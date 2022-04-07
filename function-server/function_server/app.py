from cProfile import label
from fastapi import FastAPI, Response, Request, status, HTTPException
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


@app.get("/readyz", response_model=Result)
async def readyz() -> Result:
    return Result(message="ready")


@app.post("/create-db", response_model=Result)
def create_db(data: Bases) -> Result:
    # get client
    client = docker.from_env()

    # container details
    image = f"brainshare/postgres:{POSTGRES_VERSION}"
    name = f"brainshare-base-db-{data.id}"

    # check for existing container(s)
    containers = client.containers.list(filters={"name": f"brainshare-base-db-{}"})
    if len(containers) > 0:
        ids = ", ".join(c.id for c in containers)
        raise HTTPException(
            status_code=400, detail=f"Found existing container(s): {ids}"
        )

    # run docker container
    try:
        client.containers.run(
            image,
            detach=True,
            name="",
            ports={"5432/tcp": "5432"},
            environment={"POSTGRES_PASSWORD": "supabase"},
            labels=["brainshare-base-db"],
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error running container: {e}")

    logging.info("-- CREATE DB --")

    # dump logs to database. will stream them in v1 via dagster

    return Result(message="done")
