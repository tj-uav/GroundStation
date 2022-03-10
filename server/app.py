import json
import logging
import sys
import traceback
from io import StringIO

from flask import Flask, jsonify
from flask_cors import CORS

from app import interop, uav, ugv
from errors import InvalidRequestError, InvalidStateError, GeneralError, ServiceUnavailableError
from groundstation import GroundStation

log = logging.getLogger("werkzeug")
log.setLevel(logging.ERROR)

with open("config.json", "r", encoding="utf-8") as file:
    config = json.load(file)

app = Flask(__name__)
CORS(app)

app.register_blueprint(interop, url_prefix="/interop")
app.register_blueprint(uav, url_prefix="/uav")
app.register_blueprint(ugv, url_prefix="/ugv")


def log_level(self, message, *args, **kwargs):
    if self.isEnabledFor(logging.INFO + 5):
        self._log(logging.INFO + 5, message, args, **kwargs)


def log_root(message, *args, **kwargs):
    logging.log(logging.INFO + 5, message, *args, **kwargs)


logging.addLevelName(logging.INFO + 5, "IMPORTANT")
setattr(logging, "IMPORTANT", logging.INFO + 5)
setattr(logging.getLoggerClass(), "important", log_level)
setattr(logging, "important", log_root)

logger = logging.getLogger("main")
logger.setLevel(logging.DEBUG)
formatter = logging.Formatter("[%(levelname)-9s] %(asctime)s  %(message)s")

console_handler = logging.StreamHandler(sys.stdout)
console_handler.setLevel(logging.IMPORTANT)
console_handler.setFormatter(formatter)

file_handler = logging.FileHandler("logs/info.log", mode="w")
file_handler.setLevel(logging.INFO)
file_handler.setFormatter(formatter)

debug_file_handler = logging.FileHandler("logs/debug.log", mode="w")
debug_file_handler.setLevel(logging.DEBUG)
debug_file_handler.setFormatter(formatter)

LOG_STREAM = StringIO()
string_handler = logging.StreamHandler(LOG_STREAM)
string_handler.setLevel(logging.INFO)
string_handler.setFormatter(formatter)

logger.addHandler(console_handler)
logger.addHandler(file_handler)
logger.addHandler(debug_file_handler)
logger.addHandler(string_handler)

logger.info("STARTED LOGGING")

gs = GroundStation()
app.gs = gs


@app.errorhandler(Exception)
def handle_error(e):
    logger.error(type(e).__name__)
    logger.debug("Traceback of %s : ", type(e).__name__, exc_info=e)
    return jsonify({
        "title": "Unhandled Server Error",
        "message": str(e),
        "exception": type(e).__name__,
        "traceback": traceback.format_tb(e.__traceback__)
    }), 500


@app.errorhandler(InvalidRequestError)
def handle_400(e):
    logger.error(type(e).__name__)
    logger.debug("Traceback of %s : ", type(e).__name__, exc_info=e)
    return jsonify({
        "title": "Invalid Request",
        "message": str(e),
        "exception": type(e).__name__,
        "traceback": traceback.format_tb(e.__traceback__)
    }), 400


@app.errorhandler(InvalidStateError)
def handle_409(e):
    logger.error(type(e).__name__)
    logger.debug("Traceback of %s : ", type(e).__name__, exc_info=e)
    return jsonify({
        "title": "Invalid State Error",
        "message": str(e),
        "exception": type(e).__name__,
        "traceback": traceback.format_tb(e.__traceback__)
    }), 409


@app.errorhandler(GeneralError)
def handle_500(e):
    logger.error(type(e).__name__)
    logger.debug("Traceback of %s : ", type(e).__name__, exc_info=e)
    return jsonify({
        "title": "Server Error",
        "message": str(e),
        "exception": type(e).__name__,
        "traceback": traceback.format_tb(e.__traceback__)
    }), 500


@app.errorhandler(ServiceUnavailableError)
def handle_503(e):
    logger.error(type(e).__name__)
    logger.debug("Traceback of %s : ", type(e).__name__, exc_info=e)
    return jsonify({
        "title": "Service Unavailable Error",
        "message": str(e),
        "exception": type(e).__name__,
        "traceback": traceback.format_tb(e.__traceback__)
    }), 503


@app.route("/")
def index():
    return "TJ UAV Ground Station Backend homepage"


@app.route("/log/<string:type_>")
def create_log(type_):
    if type_ == "debug":
        logger.debug("This is for debugging")
    elif type_ == "info":
        logger.info("This is info")
    elif type_ == "warning":
        logger.warning("This is a warning")
    elif type_ == "important":
        logger.important("This is important")
    elif type_ == "error":
        logger.error("This is an error")
    elif type_ == "critical":
        logger.critical("This is critical")
    else:
        pass
    return ""


@app.route("/favicon.ico")
def favicon():
    return ""


@app.route("/logs")
def logs():
    return {"result": LOG_STREAM.getvalue().split("\n")}


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
