import logging
from flask import Request
import docker  # type: ignore
from typing import Any
import os

from ..schema.rest_api import Bases

# get enviroment variables
POSTGRES_VERSION = os.environ.get("POSTGRES_VERSION")
if not POSTGRES_VERSION:
    raise Exception("POSTGRES_VERSION not defined")


def create_db(data: Bases) -> str:
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
    return "done"
