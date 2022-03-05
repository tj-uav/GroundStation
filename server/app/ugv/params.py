from flask import Blueprint, request, current_app as app

from errors import InvalidRequestError

ugv_params = Blueprint("ugv_params", __name__)


@ugv_params.route("/get/<key>")
def ugv_get_param(key):
    return app.gs.call("ugv_getparam", key)


@ugv_params.route("/getall")
def ugv_get_params():
    return app.gs.call("ugv_getparams")


@ugv_params.route("/set/<key>/<value>", methods=["POST"])
def ugv_set_param(key, value):
    return app.gs.call("ugv_setparam", key, value)


@ugv_params.route("/setmultiple", methods=["POST"])
def ugv_set_params():
    f = request.json
    if not all(field in f for field in ["params"]):
        raise InvalidRequestError("Missing required fields in request")
    return app.gs.call("ugv_setparams", f.get("params"))  # {"param": "newvalue"}


@ugv_params.route("/save", methods=["POST"])
def ugv_save_params():
    return app.gs.call("ugv_saveparams")


@ugv_params.route("/load", methods=["POST"])
def ugv_load_params():
    return app.gs.call("ugv_loadparams")
