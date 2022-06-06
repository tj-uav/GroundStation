from flask import Blueprint, request, current_app as app

from errors import InvalidRequestError

ugv_commands = Blueprint("ugv_commands", __name__)


@ugv_commands.route("/get")
def ugv_get_commands():
    return app.gs.call("ugv_getcommands")


@ugv_commands.route("/insert", methods=["POST"])
def ugv_insert_command():
    f = request.json
    if not all(field in f for field in ["command", "lat", "lon", "alt"]):
        raise InvalidRequestError("Missing required fields in request")
    return app.gs.call("ugv_insertcommand",
                       f.get("command"),
                       f.get("lat"),
                       f.get("lon"),
                       f.get("alt")
                       )


@ugv_commands.route("/clear", methods=["POST"])
def ugv_clear_commands():
    return app.gs.call("ugv_clearcommands")
