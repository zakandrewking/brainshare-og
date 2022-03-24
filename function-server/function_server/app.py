from flask import Flask, Request

from .functions.database import create_db

app = Flask(__name__)


@app.route("/create-db")
def hello_world(request: Request) -> str:
    data = request.json()
    return create_db(data)
