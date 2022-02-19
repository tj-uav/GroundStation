import base64
import json
import logging
import sys
import traceback

from io import StringIO

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


@app.route("/log/<string:type>")
def create_log(type):
    if type == "debug":
        logger.debug("This is for debugging")
    elif type == "info":
        logger.info("This is info")
    elif type == "warning":
        logger.warning("This is a warning")
    elif type == "important":
        logger.important("This is important")
    elif type == "error":
        logger.error("This is an error")
    elif type == "critical":
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
def uav_connect():
    return gs.call("uav_connect")


@app.route("/uav/update", methods=["POST"])
def uav_update():
    return gs.call("uav_update")


@app.route("/uav/quick")
def uav_quick():
    return gs.call("uav_quick")


@app.route("/uav/stats")
def uav_stats():
    return gs.call("uav_stats")


@app.route("/uav/mode/get")
def uav_get_mode():
    return gs.call("uav_getflightmode")


@app.route("/uav/mode/set", methods=["POST"])
def uav_set_mode():
    f = request.json
    if not all(field in f for field in ["mode"]):
        raise InvalidRequestError("Missing required fields in request")
    return gs.call("uav_setflightmode", f.get("mode"))


@app.route("/uav/params/get/<key>")
def uav_get_param(key):
    return gs.call("uav_getparam", key)


@app.route("/uav/params/getall")
def uav_get_params():
    return gs.call("uav_getparams")


@app.route("/uav/params/set/<key>/<value>", methods=["POST"])
def uav_set_param(key, value):
    return gs.call("uav_setparam", key, value)


@app.route("/uav/params/setmultiple", methods=["POST"])
def uav_set_params():
    f = request.json
    if not all(field in f for field in ["params"]):
        raise InvalidRequestError("Missing required fields in request")
    return gs.call("uav_setparams", f.get("params"))  # {"param": "newvalue"}


@app.route("/uav/params/save", methods=["POST"])
def uav_save_params():
    return gs.call("uav_saveparams")


@app.route("/uav/params/load", methods=["POST"])
def uav_load_params():
    return gs.call("uav_loadparams")


@app.route("/uav/commands/get")
def uav_get_commands():
    return gs.call("uav_getcommands")


@app.route("/uav/commands/insert", methods=["POST"])
def uav_insert_command():
    f = request.json
    if not all(field in f for field in ["command", "lat", "lon", "alt"]):
        raise InvalidRequestError("Missing required fields in request")
    return gs.call("uav_insertcommand",
                   f.get("command"),
                   f.get("lat"),
                   f.get("lon"),
                   f.get("alt")
                   )


@app.route("/uav/commands/clear", methods=["POST"])
def uav_clear_commands():
    return gs.call("uav_clearcommands")


@app.route("/uav/getarmed")
def uav_armed():
    return gs.call("uav_getarmed")


@app.route("/uav/arm", methods=["POST"])
def uav_arm():
    return gs.call("uav_arm")


@app.route("/uav/disarm", methods=["POST"])
def uav_disarm():
    return gs.call("uav_disarm")


@app.route("/ugv/connect", methods=["POST"])
def ugv_connect():
    return gs.call("ugv_connect")


@app.route("/ugv/update", methods=["POST"])
def ugv_update():
    return gs.call("ugv_update")


@app.route("/ugv/quick")
def ugv_quick():
    return gs.call("ugv_quick")


@app.route("/ugv/stats")
def ugv_stats():
    return gs.call("ugv_stats")


@app.route("/ugv/mode/get")
def ugv_get_mode():
    return gs.call("ugv_getflightmode")


@app.route("/ugv/mode/set", methods=["POST"])
def ugv_set_mode():
    f = request.json
    if not all(field in f for field in ["mode"]):
        raise InvalidRequestError("Missing required fields in request")
    return gs.call("ugv_setflightmode", f.get("mode"))


@app.route("/ugv/params/get/<key>")
def ugv_get_param(key):
    return gs.call("ugv_getparam", key)


@app.route("/ugv/params/getall")
def ugv_get_params():
    return gs.call("ugv_getparams")


@app.route("/ugv/params/set/<key>/<value>", methods=["POST"])
def ugv_set_param(key, value):
    return gs.call("ugv_setparam", key, value)


@app.route("/ugv/params/setmultiple", methods=["POST"])
def ugv_set_params():
    f = request.json
    if not all(field in f for field in ["params"]):
        raise InvalidRequestError("Missing required fields in request")
    return gs.call("ugv_setparams", f.get("params"))  # {"param": "newvalue"}


@app.route("/ugv/params/save", methods=["POST"])
def ugv_save_params():
    return gs.call("ugv_saveparams")


@app.route("/ugv/params/load", methods=["POST"])
def ugv_load_params():
    return gs.call("ugv_loadparams")


@app.route("/ugv/commands/get")
def ugv_get_commands():
    return gs.call("ugv_getcommands")


@app.route("/ugv/commands/insert", methods=["POST"])
def ugv_insert_command():
    f = request.json
    if not all(field in f for field in ["command", "lat", "lon", "alt"]):
        raise InvalidRequestError("Missing required fields in request")
    return gs.call("ugv_insertcommand",
                   f.get("command"),
                   f.get("lat"),
                   f.get("lon"),
                   f.get("alt")
                   )


@app.route("/ugv/commands/clear", methods=["POST"])
def ugv_clear_commands():
    return gs.call("ugv_clearcommands")


@app.route("/ugv/getarmed")
def ugv_armed():
    return gs.call("ugv_getarmed")


@app.route("/ugv/arm", methods=["POST"])
def ugv_arm():
    return gs.call("ugv_arm")


@app.route("/ugv/disarm", methods=["POST"])
def ugv_disarm():
    return gs.call("ugv_disarm")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
