from .util import increment

import os
from typing import Optional, Final, Any
import logging
import sys
from pydantic import BaseModel, Field, Extra
import pandas as pd  # type: ignore
import io
import httpx
import asyncio
from autobahn.asyncio.websocket import WebSocketServerFactory, WebSocketServerProtocol  # type: ignore

from schema.table_parser import File, TableParserMessage, Status

# logging
logging.basicConfig(stream=sys.stdout, level=logging.DEBUG)

# autobanh
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


def upload_to_supabase(file: File, file_data: FileData) -> None:
    # check that file does not exist; fail after 10 tries
    file_name = file.name  # TODO give each user their own bucket!
    for a in range(10):
        url: str = f"{SUPABASE_STORAGE_URL}/object/{BUCKET_NAME}/{file_name}"
        result = httpx.get(url)
        if result.status_code != 404:
            file_name = increment(file_name)

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


# Websockets


class MyServerProtocol(WebSocketServerProtocol):
    file: Optional[File] = None
    file_data: Optional[FileData] = None

    def send_message(self, message: TableParserMessage) -> None:
        logging.debug("sending message")
        self.sendMessage(
            message.json(by_alias=True, ensure_ascii=False).encode("utf8"), False
        )

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
            return self.sendError("Not ready for file data")

        # some immutables
        current_slice: Final = self.file_data.current_slice
        n_slices: Final = self.file.n_slices
        name: Final = self.file.name

        # set the data
        if current_slice + 1 > n_slices:
            self.file = None
            return self.sendError("Mismatch in file parts. Resetting")
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

            # upload
            upload_to_supabase(self.file, self.file_data)
            self.send_message(TableParserMessage(status=Status.saved))
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


if __name__ == "__main__":
    logging.info("starting")
    factory = WebSocketServerFactory(f"ws://{HOST}:{PORT}/sock")
    factory.protocol = MyServerProtocol

    loop = asyncio.get_event_loop()
    coro = loop.create_server(factory, HOST, PORT)
    server = loop.run_until_complete(coro)

    try:
        loop.run_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.close()
        loop.close()
