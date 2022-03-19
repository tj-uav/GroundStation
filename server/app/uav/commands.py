from flask import Blueprint, request, current_app as app, send_file

from errors import InvalidRequestError

uav_commands = Blueprint("uav_commands", __name__)


@uav_commands.route("/get")
def uav_get_commands():
    return app.gs.call("uav_getcommands")


@uav_commands.route("/insert", methods=["POST"])
def uav_insert_command():
    f = request.json
    if not all(field in f for field in ["command", "lat", "lon", "alt"]):
        raise InvalidRequestError("Missing required fields in request")
    return app.gs.call("uav_insertcommand",
                       f.get("command"),
                       f.get("lat"),
                       f.get("lon"),
                       f.get("alt")
                       )


@uav_commands.route("/jump", methods=["POST"])
def uav_jump_command():
    f = request.json
    if not all(field in f for field in ["command"]):
        raise InvalidRequestError("Missing required fields in request")
    return app.gs.call("uav_jumpcommand", f.get("command"))


@uav_commands.route("/save", methods=["POST"])
def uav_save_commands():
    return app.gs.call("uav_savecommands")


@uav_commands.route("/load", methods=["POST"])
def uav_load_commands():
    return app.gs.call("uav_loadcommands")


@uav_commands.route("/view")
def uav_view_commands_file():
    return send_file("handlers/pixhawk/uav/uav_mission.txt")


@uav_commands.route("/clear", methods=["POST"])
def uav_clear_commands():
    return app.gs.call("uav_clearcommands")
