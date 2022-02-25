from flask import Flask, request, flash, redirect, url_for, session
from werkzeug.utils import secure_filename
import os
from typing import Optional
import logging
import httpx

# flask
app = Flask(__name__)
app.secret_key = os.environ.get("TABLE_PARSER_FLASK_SECRET")
if not app.secret_key:
    raise Exception("TABLE_PARSER_FLASK_SECRET not defined")

# uploads
UPLOAD_FOLDER = "/app"
ALLOWED_EXTENSIONS = {"xlsx"}
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 16 * 1000 * 1000

# supabase
url: Optional[str] = os.environ.get("SUPABASE_URL")
if not url:
    raise Exception("SUPABASE_URL not defined")
key: Optional[str] = os.environ.get("SUPABASE_ANON_KEY")
if not key:
    raise Exception("SUPABASE_ANON_KEY not defined")
BUCKET_NAME = "uploaded_files"


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route("/parse", methods=["GET", "POST"])
def hello_world():
    app.logger.info("parsing")
    if request.method == "POST":
        app.logger.info("files", request.files)
        # check if the post request has the file part
        if "file" not in request.files:
            return {"result": None, "error": "No file part"}
        file = request.files["file"]
        # If the user does not select a file, the browser submits an
        # empty file without a filename.
        if file.filename == "":
            return {"result": None, "error": "No file name"}
        if not file or not allowed_file(file.filename):
            return {"result": None, "error": "No file"}

        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(filepath)
        session["file"] = file

        app.logger.info("saving to supabase")
        # https://github.com/supabase-community/supabase-py/blob/develop/supabase/lib/storage/storage_file_api.py
        # api = supabase.storage().StorageFileAPI(BUCKET_NAME)
        # headers = dict(self.headers, **self.DEFAULT_FILE_OPTIONS)
        # headers.update(file_options)
        # filename = path.rsplit("/", maxsplit=1)[-1]
        # files = {"file": (filename, open(file, "rb"), headers.pop("content-type"))}
        # _path = self._get_final_path(path)
        # try:
        #     resp = httpx.post(
        #         f"{self.url}/object/{_path}",
        #         files=files,
        #         headers=headers,
        #     )
        # except Exception as err:
        #     raise err  # Python 3.6
        # else:
        #     return resp

        # app.logger.info(f"response: {resp}")
        # app.logger.info(logging.root.manager.loggerDict)

        app.logger.info(httpx.get("https://httpbin.org/get"))

        # in parallel to saving, begin generating postgres init sql files
        # Q: how does the user intervene in the process? session ID in flask?
        # save those to supabase storage
        # let user know it's done
        # user clicks "create db" button, which hits db-management service, creates VM

        # TODO clean up temp files and sessions
        # TODO how does user interact with options? websocket?
        #      https://github.com/crossbario/autobahn-python/blob/master/examples/twisted/websocket/echo_wsgi/server.py
        #      Redis to exchange with session cookie as key
        # NOTE requires stateful load balancing, but that's ok? https://cloud.google.com/load-balancing/docs/backend-service#session_affinity
        # TODO no need to store the file to disk; keep it in memory;

        return {"result": "success", "error": None}
    else:
        return {"result": "Hey, we have Flask in a Docker container!", "error": None}


@app.route("/get-file")
def get_file():
    app.logger.info(session.get("file", "No file"))
    return {"result": "Hey, we have Flask in a Docker container!", "error": None}


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
