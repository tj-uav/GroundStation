from flask import Blueprint, request, current_app as app

from errors import InvalidRequestError

uav_params = Blueprint("uav_params", __name__)


@uav_params.route("/get/<key>")
def uav_get_param(key):
    return app.gs.call("uav_getparam", key)


@uav_params.route("/getall")
def uav_get_params():
    return app.gs.call("uav_getparams")


@uav_params.route("/set/<key>/<value>", methods=["POST"])
def uav_set_param(key, value):
    return app.gs.call("uav_setparam", key, value)


@uav_params.route("/setmultiple", methods=["POST"])
def uav_set_params():
    f = request.json
    if not all(field in f for field in ["params"]):
        raise InvalidRequestError("Missing required fields in request")
    return app.gs.call("uav_setparams", f.get("params"))  # {"param": "newvalue"}


@uav_params.route("/save", methods=["POST"])
def uav_save_params():
    return app.gs.call("uav_saveparams")


@uav_params.route("/load", methods=["POST"])
def uav_load_params():
    return app.gs.call("uav_loadparams")
