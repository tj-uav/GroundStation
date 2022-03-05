from flask import Blueprint, request, current_app as app

from errors import InvalidRequestError

ugv_mode = Blueprint("ugv_mode", __name__)


@ugv_mode.route("/get")
def ugv_get_mode():
    return app.gs.call("ugv_getflightmode")


@ugv_mode.route("/set", methods=["POST"])
def ugv_set_mode():
    f = request.json
    if not all(field in f for field in ["mode"]):
        raise InvalidRequestError("Missing required fields in request")
    return app.gs.call("ugv_setflightmode", f.get("mode"))
