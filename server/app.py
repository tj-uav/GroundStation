import base64
import json
import logging
import sys
import traceback

from flask import Flask, redirect, url_for, request, jsonify
from flask_cors import CORS

from errors import InvalidRequestError, InvalidStateError, GeneralError, ServiceUnavailableError
from groundstation import GroundStation

log = logging.getLogger("werkzeug")
log.setLevel(logging.ERROR)

with open("config.json", "r") as file:
    config = json.load(file)

app = Flask(__name__)
CORS(app)


def logForLevel(self, message, *args, **kwargs):
    if self.isEnabledFor(logging.INFO + 5):
        self._log(logging.INFO + 5, message, args, **kwargs)


def logToRoot(message, *args, **kwargs):
    logging.log(logging.INFO + 5, message, *args, **kwargs)


logging.addLevelName(logging.INFO + 5, "IMPORTANT")
setattr(logging, "IMPORTANT", logging.INFO + 5)
setattr(logging.getLoggerClass(), "important", logForLevel)
setattr(logging, "important", logToRoot)

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

logger.addHandler(console_handler)
logger.addHandler(file_handler)
logger.addHandler(debug_file_handler)

logger.info("STARTED LOGGING")

gs = GroundStation()


@app.errorhandler(Exception)
def handle_error(e):
    logger.error(type(e).__name__)
    logger.info("Traceback of %s : ", type(e).__name__, exc_info=e)
    return jsonify({
        "title": "Unhandled Server Error",
        "message": str(e),
        "exception": type(e).__name__,
        "traceback": traceback.format_tb(e.__traceback__)
    }), 500


@app.errorhandler(InvalidRequestError)
def handle_400(e):
    logger.error(type(e).__name__)
    logger.info("Traceback of %s : ", type(e).__name__, exc_info=e)
    return jsonify({
        "title": "Invalid Request",
        "message": str(e),
        "exception": type(e).__name__,
        "traceback": traceback.format_tb(e.__traceback__)
    }), 400


@app.errorhandler(InvalidStateError)
def handle_409(e):
    logger.error(type(e).__name__)
    logger.info("Traceback of %s : ", type(e).__name__, exc_info=e)
    return jsonify({
        "title": "Invalid State Error",
        "message": str(e),
        "exception": type(e).__name__,
        "traceback": traceback.format_tb(e.__traceback__)
    }), 409


@app.errorhandler(GeneralError)
def handle_500(e):
    logger.error(type(e).__name__)
    logger.info("Traceback of %s : ", type(e).__name__, exc_info=e)
    return jsonify({
        "title": "Server Error",
        "message": str(e),
        "exception": type(e).__name__,
        "traceback": traceback.format_tb(e.__traceback__)
    }), 500


@app.errorhandler(ServiceUnavailableError)
def handle_503(e):
    logger.error(type(e).__name__)
    logger.info("Traceback of %s : ", type(e).__name__, exc_info=e)
    return jsonify({
        "title": "Service Unavailable Error",
        "message": str(e),
        "exception": type(e).__name__,
        "traceback": traceback.format_tb(e.__traceback__)
    }), 503


@app.route("/")
def index():
    return "TJ UAV Ground Station Backend homepage"


@app.route("/hello")
def hello():
    return redirect(url_for("index"))


@app.route("/favicon.ico")
def favicon():
    return ""


@app.route("/interop/login", methods=["POST"])
def interop_login():
    return gs.call("i_login")


@app.route("/interop/get/<key>")
def interop_get(key):
    return gs.call("i_data", key)


@app.route("/interop/mission")
def interop_mission():
    return gs.call("i_data")


@app.route("/interop/telemetry")
def interop_telemetry():
    return gs.call("i_telemetry")


@app.route("/interop/odlc/list")
def odlc_list():
    return gs.call("i_odlcget")


@app.route("/interop/odlc/filter/<int:status>")  # 0: Not Reviewed, 1: Submitted, 2: Rejected
def odlc_filter(status):
    return gs.call("i_odlcget", status)


@app.route("/interop/odlc/image/<int:id_>")
def odlc_get_image(id_):
    with open(f"assets/odlc_images/{id_}.png", "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read())
    return {"image": encoded_string.decode("utf-8")}


@app.route("/interop/odlc/add", methods=["POST"])
def odlc_add():
    f = request.json
    if not all(field in f for field in ["image", "type", "lat", "lon"]):
        raise InvalidRequestError("Missing required fields in request")
    if f.get("type") == "standard":
        if not all(field in f for field in
                   ["orientation", "shape", "shape_color", "alpha", "alpha_color"]):
            raise InvalidRequestError("Missing required fields for specific ODLC type")
    else:
        if not all(field in f for field in ["description"]):
            raise InvalidRequestError("Missing required fields for specific ODLC type")
    return gs.call("i_odlcadd",
                   f.get("image"),
                   f.get("type"),
                   f.get("latitude"),
                   f.get("longitude"),
                   f.get("orientation"),
                   f.get("shape"),
                   f.get("shape_color"),
                   f.get("alphanumeric"),
                   f.get("alphanumeric_color"),
                   f.get("description")
                   )


@app.route("/interop/odlc/edit/<int:id_>", methods=["POST"])
def odlc_edit(id_):
    f = request.json
    if not all(field in f for field in ["type"]):
        raise InvalidRequestError("Missing required fields in request")
    return gs.call("i_odlcedit",
                   id_,
                   f.get("image"),
                   f.get("type"),
                   f.get("latitude"),
                   f.get("longitude"),
                   f.get("orientation"),
                   f.get("shape"),
                   f.get("shape_color"),
                   f.get("alphanumeric"),
                   f.get("alphanumeric_color"),
                   f.get("description")
                   )


@app.route("/interop/odlc/reject/<int:id_>", methods=["POST"])
def odlc_reject(id_):
    return gs.call("i_odlcreject", id_)


@app.route("/interop/odlc/submit/<int:id_>", methods=["POST"])
def odlc_submit(id_):
    f = request.json
    return gs.call("i_odlcsubmit", id_, f.get("status"))


@app.route("/interop/odlc/save", methods=["POST"])
def odlc_save():
    return gs.call("i_odlcsave")


@app.route("/interop/odlc/load", methods=["POST"])
def odlc_load():
    return gs.call("i_odlcload")


@app.route("/interop/map/add", methods=["POST"])
def map_add():
    f = request.json
    if not all(field in f for field in ["name", "image"]):
        raise InvalidRequestError("Missing required fields in request")
    return gs.call("i_mapadd", f.get("name"), f.get("image"))


@app.route("/interop/map/submit", methods=["POST"])
def map_submit():
    f = request.json
    if not all(field in f for field in ["name"]):
        raise InvalidRequestError("Missing required fields in request")
    return gs.call("i_mapsubmit", f.get("name"))


@app.route("/uav/connect", methods=["POST"])
def connect():
    return gs.call("m_connect")


@app.route("/uav/update", methods=["POST"])
def update():
    return gs.call("m_update")


@app.route("/uav/quick")
def quick():
    return gs.call("m_quick")


@app.route("/uav/stats")
def stats():
    return gs.call("m_stats")


@app.route("/uav/mode/get")
def get_mode():
    return gs.call("m_getflightmode")


@app.route("/uav/mode/set", methods=["POST"])
def set_mode():
    f = request.json
    if not all(field in f for field in ["mode"]):
        raise InvalidRequestError("Missing required fields in request")
    return gs.call("m_setflightmode", f.get("mode"))


@app.route("/uav/params/get/<key>")
def get_param(key):
    return gs.call("m_getparam", key)


@app.route("/uav/params/getall")
def get_params():
    return gs.call("m_getparams")


@app.route("/uav/params/set/<key>/<value>", methods=["POST"])
def set_param(key, value):
    return gs.call("m_setparam", key, value)


@app.route("/uav/params/setmultiple", methods=["POST"])
def set_params():
    f = request.json
    if not all(field in f for field in ["params"]):
        raise InvalidRequestError("Missing required fields in request")
    return gs.call("m_setparams", f.get("params"))  # {"param": "newvalue"}


@app.route("/uav/params/save", methods=["POST"])
def save_params():
    return gs.call("m_saveparams")


@app.route("/uav/params/load", methods=["POST"])
def load_params():
    return gs.call("m_loadparams")


@app.route("/uav/commands/get")
def get_commands():
    return gs.call("m_getcommands")


@app.route("/uav/commands/insert", methods=["POST"])
def insert_command():
    f = request.json
    if not all(field in f for field in ["command", "lat", "lon", "alt"]):
        raise InvalidRequestError("Missing required fields in request")
    return gs.call("m_insertcommand",
                   f.get("command"),
                   f.get("lat"),
                   f.get("lon"),
                   f.get("alt")
                   )


@app.route("/uav/commands/clear", methods=["POST"])
def clear_commands():
    return gs.call("m_clearcommands")


@app.route("/uav/getarmed")
def armed():
    return gs.call("m_getarmed")


@app.route("/uav/arm", methods=["POST"])
def arm():
    return gs.call("m_arm")


@app.route("/uav/disarm", methods=["POST"])
def disarm():
    return gs.call("m_disarm")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
