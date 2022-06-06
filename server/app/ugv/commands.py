from flask import Blueprint, request, current_app as app, send_file

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


@ugv_commands.route("/jump", methods=["POST"])
def uav_jump_command():
    f = request.json
    if not all(field in f for field in ["command"]):
        raise InvalidRequestError("Missing required fields in request")
    return app.gs.call("uav_jumpcommand", f.get("command"))


@ugv_commands.route("/save", methods=["POST"])
def uav_save_commands():
    return app.gs.call("uav_savecommands")


@ugv_commands.route("/load", methods=["POST"])
def uav_load_commands():
    return app.gs.call("uav_loadcommands")


@ugv_commands.route("/view")
def uav_view_commands_file():
    return send_file("handlers/pixhawk/uav/uav_mission.txt")


@ugv_commands.route("/clear", methods=["POST"])
def ugv_clear_commands():
    return app.gs.call("ugv_clearcommands")
