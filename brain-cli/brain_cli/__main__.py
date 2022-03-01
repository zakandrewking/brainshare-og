from black import main
from flask import appcontext_popped
from .main import app

app(prog_name="brain")
