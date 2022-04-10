import os
import string
import random
from types import coroutine
from typing import Optional, Final, Any
import logging
import sys
from pydantic import BaseModel, Field, Extra
import pandas as pd  # type: ignore
import io
import httpx
import asyncio
from autobahn.asyncio.websocket import (  # type: ignore
    WebSocketServerFactory,
    WebSocketServerProtocol,
)
from uuid import UUID

from .schema.table_parser import File, TableParserMessage, Status
from .schema.rest_api import UploadedFiles

# autobahn
HOST = "0.0.0.0"
PORT = 5000

# uploads
ALLOWED_EXTENSIONS = {"xlsx"}
MAX_CONTENT_LENGTH = 16 * 1000 * 1000

# utils
def getEnv(key: str) -> str:
    val = os.environ.get(key)
    if not val:
        raise Exception(f"{key} not defined")
    return val


# supabase
SUPABASE_REST_URL = getEnv("SUPABASE_REST_URL")
SUPABASE_STORAGE_URL = getEnv("SUPABASE_STORAGE_URL")
SUPABASE_ANON_KEY = getEnv("SUPABASE_ANON_KEY")
BUCKET_NAME = "uploaded_files"

#         # in parallel to saving, begin generating postgres init sql files
#         # Q: how does the user intervene in the process? session ID in flask?
#         # save those to supabase storage
#         # let user know it's done
#         # user clicks "create db" button, which hits db-management service, creates VM

#         # TODO clean up temp files and sessions
#         # NOTE requires stateful load balancing, but that's ok? https://cloud.google.com/load-balancing/docs/backend-service#session_affinity

# Data


class FileData(BaseModel):
    class Config:
        extra = Extra.forbid
        allow_population_by_field_name = True

    data: bytes = Field(b"")
    current_slice: int = Field(0, alias="currentSlice")
    # visible_data: dict = Field(..., alias="visibleData")


# Supabase


# def create_base(file: File):
#     url: str = f"{SUPABASE_REST_URL}"
#     headers = {
#         "apikey": SUPABASE_ANON_KEY,
#         "Authorization": "Bearer " + file.access_token,
#     }


def upload_file(file: File, file_data: FileData) -> str:
    """1 upload data into bucket with random object name.

    Returns UUID for object.

    """
    file_base, file_ext = file.name.rsplit(".")
    rand = "".join(
        random.choice(string.ascii_uppercase + string.digits) for _ in range(10)
    )
    object_name = f"{file_base[:10]}.{rand}.{file_ext}"
    url: str = f"{SUPABASE_STORAGE_URL}/object/{BUCKET_NAME}/{object_name}"
    files = {"upload-file": (file.name, io.BytesIO(file_data.data), file.content_type)}
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": "Bearer " + file.access_token,
        "cache-control": "3600",
        "x-upsert": "false",
    }
    result = httpx.post(url, files=files, headers=headers)
    logging.debug(f"upload result: {result.text}")
    result.raise_for_status()
    object_key = result.json()["Key"]  # e.g. 'uploaded_files/Book1.56884IBTXK.xlsx'
    return object_key


def insert_upload(file: File, object_key: str) -> str:
    """2 insert into table for user 'uploads' with foreign key to bucket"""
    url = f"{SUPABASE_REST_URL}/uploaded_files"
    headers = {  # TODO make a function
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": "Bearer " + file.access_token,
        "Prefer": "return=representation",
    }
    data = UploadedFiles(
        name=file.name, owner=UUID(file.user_id), object_key=object_key
    ).json(exclude_none=True)
    result = httpx.post(url, content=data, headers=headers)
    logging.debug(f"post result: {result.status_code}")
    logging.debug(f"post result: {result.text}")
    logging.debug(f"post result: {result.headers}")
    result.raise_for_status()
    return result.json()[0]["id"]


# Websockets


class MyServerProtocol(WebSocketServerProtocol):
    file: Optional[File] = None
    file_data: Optional[FileData] = None

    def send_message(self, message: TableParserMessage) -> None:
        logging.debug("sending message")
        self.sendMessage(
            message.json(by_alias=True, ensure_ascii=False).encode("utf8"), False
        )

    def send_error(self, error: str) -> None:
        self.send_message(TableParserMessage(status=Status.error, error=error))

    def on_text_message(self, payload: bytes) -> None:
        message = TableParserMessage.parse_raw(payload.decode("utf8"))
        print(message)

        # testing
        if message.has_lasers:
            self.send_message(
                TableParserMessage(
                    status=Status.lasers, has_lasers=f"more {message.has_lasers}"
                )
            )
            return

        # initialize
        if message.file:
            self.file = message.file
            self.file_data = FileData()
            logging.info(f"Ready for data from {self.file.name}")
        else:
            raise Exception(f"No file provided with message status {message.status}")

    def on_binary_message(self, payload: bytes) -> None:
        if not self.file or not self.file_data:
            return self.send_error("Not ready for file data")

        # some immutables
        current_slice: Final = self.file_data.current_slice
        n_slices: Final = self.file.n_slices
        name: Final = self.file.name

        # set the data
        if current_slice + 1 > n_slices:
            self.file = None
            return self.send_error("Mismatch in file parts. Resetting")
        self.file_data.data += payload

        if current_slice + 1 == n_slices:
            logging.debug(f"slice {current_slice + 1} of {n_slices}. Last slice.")
            # ready for testing
            with open("/" + name, "wb") as f:
                f.write(self.file_data.data)

            df = pd.read_excel(io.BytesIO(self.file_data.data))
            logging.info(f"df length {len(df)}")

            # all set
            self.send_message(TableParserMessage(status=Status.upload_success))

            # # create base
            # create_base(self.file)
            # self.sendStatus("CREATE_BASE_SUCCESS")

            # upload file and insert upload row to track details
            try:
                object_key = upload_file(self.file, self.file_data)
                uploaded_file_id = insert_upload(self.file, object_key)
            except Exception as e:
                self.send_error(f"Could not save file; error: {e}")
                raise e
            self.send_message(
                TableParserMessage(
                    status=Status.saved, uploaded_file_id=uploaded_file_id
                )
            )
        else:
            logging.debug(
                f"slice {current_slice + 1} of {n_slices}. Ready for next slice."
            )
            # increment
            self.file_data.current_slice += 1

    # Methods to subclass

    def onMessage(self, payload: bytes, isBinary: bool) -> None:
        logging.debug(f"message received (binary {isBinary})")
        if isBinary:
            self.on_binary_message(payload)
        else:
            self.on_text_message(payload)

    def onConnect(self, request: Any) -> None:
        logging.info("Client connecting: {0}".format(request.peer))

    def onOpen(self) -> None:
        logging.info("WebSocket connection open.")

    def onClose(self, wasClean: bool, code: Any, reason: Any) -> None:
        logging.info("WebSocket connection closed: {0}".format(reason))


def main() -> None:
    logging.info("starting")
    factory = WebSocketServerFactory(f"ws://{HOST}:{PORT}/sock")
    factory.protocol = MyServerProtocol

    loop = asyncio.get_event_loop()
    coroutine = loop.create_server(factory, HOST, PORT)
    server = loop.run_until_complete(coroutine)

    try:
        loop.run_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.close()
        loop.close()
