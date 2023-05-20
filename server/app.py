import json
import logging
import os.path
import traceback

from flask import Flask, jsonify, send_file, Response
from flask_cors import CORS

from apps import uav, image
from groundstation import GroundStation
from utils.errors import (
    InvalidRequestError,
    InvalidStateError,
    GeneralError,
    ServiceUnavailableError,
)
from utils.logging_setup import LOG_STREAM, TELEM_STREAM
import sys

sys.stdin.reconfigure(encoding="utf-8")
sys.stdout.reconfigure(encoding="utf-8")  # These two lines account for Krishnan's massive brain

log: logging.Logger = logging.getLogger("werkzeug")
log.setLevel(logging.ERROR)

with open(os.path.join(os.getcwd(), "config.json"), "r", encoding="utf-8") as file:
    config: dict = json.load(file)

app: Flask = Flask(__name__)
app.config["JSONIFY_PRETTYPRINT_REGULAR"] = True
CORS(app)

app.register_blueprint(uav, url_prefix="/uav")
app.register_blueprint(image, url_prefix="/image")

logger: logging.Logger = logging.getLogger("groundstation")

gs: GroundStation = GroundStation(config=config)
app.gs = gs
app.gs_config = config


@app.errorhandler(Exception)
def handle_error(e: Exception) -> tuple[Response, int]:
    logger.error(type(e).__name__)
    logger.info("Traceback of %s : ", type(e).__name__, exc_info=e)
    return (
        jsonify(
            {
                "title": "Unhandled Server Error",
                "message": str(e),
                "exception": type(e).__name__,
                "traceback": traceback.format_tb(e.__traceback__),
            }
        ),
        500,
    )


@app.errorhandler(InvalidRequestError)
def handle_400(e: InvalidRequestError) -> tuple[Response, int]:
    logger.error(type(e).__name__)
    logger.info("Traceback of %s : ", type(e).__name__, exc_info=e)
    return (
        jsonify(
            {
                "title": "Invalid Request",
                "message": str(e),
                "exception": type(e).__name__,
                "traceback": traceback.format_tb(e.__traceback__),
            }
        ),
        400,
    )


@app.errorhandler(InvalidStateError)
def handle_409(e: InvalidStateError) -> tuple[Response, int]:
    logger.error(type(e).__name__)
    logger.info("Traceback of %s : ", type(e).__name__, exc_info=e)
    return (
        jsonify(
            {
                "title": "Invalid State Error",
                "message": str(e),
                "exception": type(e).__name__,
                "traceback": traceback.format_tb(e.__traceback__),
            }
        ),
        409,
    )


@app.errorhandler(GeneralError)
def handle_500(e: GeneralError) -> tuple[Response, int]:
    logger.error(type(e).__name__)
    logger.info("Traceback of %s : ", type(e).__name__, exc_info=e)
    return (
        jsonify(
            {
                "title": "Server Error",
                "message": str(e),
                "exception": type(e).__name__,
                "traceback": traceback.format_tb(e.__traceback__),
            }
        ),
        500,
    )


@app.errorhandler(ServiceUnavailableError)
def handle_503(e: ServiceUnavailableError) -> tuple[Response, int]:
    logger.error(type(e).__name__)
    logger.info("Traceback of %s : ", type(e).__name__, exc_info=e)
    return (
        jsonify(
            {
                "title": "Service Unavailable Error",
                "message": str(e),
                "exception": type(e).__name__,
                "traceback": traceback.format_tb(e.__traceback__),
            }
        ),
        503,
    )


@app.route("/")
def index() -> str:
    return "TJ UAV Ground Station Backend homepage"


@app.route("/log/<string:type_>")
def create_log(type_: str) -> str:
    if type_ == "debug":
        logger.debug("This is for debugging")
    elif type_ == "info":
        logger.info("This is info")
    elif type_ == "warning":
        logger.warning("This is a warning")
    elif type_ == "important":
        logger.important("This is important")  # type: ignore[attr-defined]
    elif type_ == "error":
        logger.error("This is an error")
    elif type_ == "critical":
        logger.critical("This is critical")
    else:
        pass
    return ""


@app.route("/favicon.ico")
def favicon() -> str:
    return ""


@app.route("/logs")
def logs():
    return {"result": LOG_STREAM.getvalue().split("\n")[::-1]}


@app.route("/telemetry")
def telemetry_data() -> dict:
    return {"result": TELEM_STREAM.getvalue().split("\n")}


@app.route("/file/infolog")
def logfile() -> Response:
    return send_file(os.path.join(os.getcwd(), "logs", "info.log"))


@app.route("/file/debuglog")
def debuglogfile() -> Response:
    return send_file(os.path.join(os.getcwd(), "logs", "debug.log"))


@app.route("/file/telemlog")
def telemlogfile() -> Response:
    return send_file(os.path.join(os.getcwd(), "logs", "telem.log"))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
