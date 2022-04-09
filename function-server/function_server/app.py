from cProfile import label
from fastapi import FastAPI, Response, Request, status, HTTPException
import logging
from uuid import UUID
import docker  # type: ignore
from typing import Any, Optional
import os
from pydantic import BaseModel
from enum import Enum

from .schema.rest_api import Bases


# get environment variables
POSTGRES_VERSION = os.environ.get("POSTGRES_VERSION")
if not POSTGRES_VERSION:
    raise Exception("POSTGRES_VERSION not defined")


app = FastAPI()


class Result(BaseModel):
    message: str


class BasesTriggerInsert(BaseModel):
    record: Bases


class BasesTriggerDelete(BaseModel):
    old_record: Bases


@app.get("/readyz", response_model=Result)
async def readyz() -> Result:
    return Result(message="ready")


def make_container_name(id: UUID) -> str:
    return f"brainshare-base-db-{id}"


@app.post("/delete-db", response_model=Result)
def delete_db(bases_trigger: BasesTriggerDelete) -> Result:
    base = bases_trigger.old_record

    # get client
    logging.debug("getting docker client")
    client = docker.from_env()

    # check for optional fields
    if not base.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="id not defined"
        )

    name = make_container_name(base.id)
    logging.debug(f"deleting container: {name}")
    container = client.containers.get(name)
    container.remove(force=True)

    return Result(message="deleted")


@app.post("/create-db", response_model=Result)
def create_db(bases_trigger: BasesTriggerInsert) -> Result:
    base = bases_trigger.record

    # TODO check JWT

    # get client
    logging.debug("getting docker client")
    client = docker.from_env()

    # check for optional fields
    if not base.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="id not defined"
        )
    if not base.dev_port:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="dev_port not defined"
        )

    # container details
    image = f"brainshare/postgres:{POSTGRES_VERSION}"
    name = make_container_name(base.id)

    logging.debug("checking for existing container(s)")
    containers = client.containers.list(filters={"name": name})
    if len(containers) > 0:
        ids = ", ".join(c.id for c in containers)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Found existing container(s): {ids}",
        )

    # run docker container
    logging.debug(f"running docker container: {name}")
    client.containers.run(
        image,
        detach=True,
        name=name,
        ports={"5432/tcp": base.dev_port},
        # TODO set a random secure password here
        environment={"POSTGRES_PASSWORD": "supabase"},
        labels=["brainshare-base-db"],
    )

    # TODO run migrations
    # TODO dump logs to database. will stream them in v1 via dagster

    return Result(message="created")
