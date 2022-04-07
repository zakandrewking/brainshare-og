from fastapi import FastAPI, Response, Request
from fastapi.applications import get_swagger_ui_html
import logging
import docker  # type: ignore
from typing import Any, Optional
import os
from pydantic import BaseModel


from .schema.rest_api import Bases

# get enviroment variables
POSTGRES_VERSION = os.environ.get("POSTGRES_VERSION")
if not POSTGRES_VERSION:
    raise Exception("POSTGRES_VERSION not defined")

app = FastAPI()


class Result(BaseModel):
    message: str


@app.get("/")
async def read_root() -> str:
    return "Hello World"


# https://github.com/tiangolo/fastapi/issues/4211
@app.get("/docs1", include_in_schema=False)
async def custom_swagger_ui_html(req: Request) -> Any:
    root_path = "/api/function-server"
    openapi_url = root_path + app.openapi_url
    logging.info(openapi_url)
    return get_swagger_ui_html(
        openapi_url=openapi_url,
        title="API",
    )


def create_db(data: Bases) -> Result:
    # get client
    client = docker.from_env()

    # container details
    image = f"brainshare/postgres:{POSTGRES_VERSION}"

    # check for existing container
    containers = client.containers.list(filters={"name": "supabase-db"})
    if len(containers) > 0:
        logging.info("Found existing container")
        return "Found existing container"

    # run docker container
    client.containers.run(
        image,
        detach=True,
        name="supabase-postgres",
        ports={"5432/tcp": "5432"},
        environment={"POSTGRES_PASSWORD": "supabase"},
    )

    logging.info("-- CREATE DB --")

    # dump logs to database. will stream them in v1 via dagster

    return Result(message="done")
