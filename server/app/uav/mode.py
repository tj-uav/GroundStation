from flask import Blueprint, request, current_app as app

from errors import InvalidRequestError

uav_mode = Blueprint("uav_mode", __name__)


@uav_mode.route("/get")
def uav_get_mode():
    return app.gs.call("uav_getflightmode")


@uav_mode.route("/set", methods=["POST"])
def uav_set_mode():
    f = request.json
    if not all(field in f for field in ["mode"]):
        raise InvalidRequestError("Missing required fields in request")
    return app.gs.call("uav_setflightmode", f.get("mode"))
