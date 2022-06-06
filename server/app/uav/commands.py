from flask import Blueprint, request, current_app as app

from errors import InvalidRequestError

uav_commands = Blueprint("uav_commands", __name__)


@uav_commands.route("/get")
def uav_get_commands():
    return app.gs.call("uav_getcommands")


@uav_commands.route("/insert", methods=["POST"])
def uav_insert_command():
    f = request.json
    print(f)
    if not all(field in f for field in ["command", "lat", "lon", "alt"]):
        raise InvalidRequestError("Missing required fields in request")
    return app.gs.call("uav_insertcommand",
                       f.get("command"),
                       f.get("lat"),
                       f.get("lon"),
                       f.get("alt")
                       )


@uav_commands.route("/clear", methods=["POST"])
def uav_clear_commands():
    return app.gs.call("uav_clearcommands")
