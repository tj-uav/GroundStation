from flask import Blueprint, current_app as app, request, send_file

from errors import InvalidRequestError

uav = Blueprint("uav", __name__)


@uav.route("/connect", methods=["POST"])
def uav_connect():
    return app.gs.uav.connect()


@uav.route("/update", methods=["POST"])
def uav_update():
    return app.gs.uav.update()


@uav.route("/quick")
def uav_quick():
    return app.gs.uav.quick()


@uav.route("/stats")
def uav_stats():
    return app.gs.uav.stats()


@uav.route("/sethome", methods=["POST"])
def uav_sethome():
    return app.gs.uav.set_home()


@uav.route("/calibrate", methods=["POST"])
def uav_calibrate():
    return app.gs.uav.calibrate()


@uav.route("/restart", methods=["POST"])
def uav_restart():
    return app.gs.uav.restart()


@uav.route("/abort", methods=["POST"])
def uav_abort():
    return app.gs.uav.abort()


@uav.route("/getarmed")
def uav_armed():
    return app.gs.uav.get_armed()


@uav.route("/arm", methods=["POST"])
def uav_arm():
    return app.gs.uav.arm()


@uav.route("/disarm", methods=["POST"])
def uav_disarm():
    return app.gs.uav.disarm()


# Commands
uav_commands = Blueprint("uav_commands", __name__)
uav.register_blueprint(uav_commands, url_prefix="/commands")


@uav_commands.route("/get")
def uav_get_commands():
    return app.gs.uav.get_commands()


@uav_commands.route("/insert", methods=["POST"])
def uav_insert_command():
    f = request.json
    if not all(field in f for field in ["command", "lat", "lon", "alt"]):
        raise InvalidRequestError("Missing required fields in request")
    return app.gs.uav.insert_command(f.get("command"), f.get("lat"), f.get("lon"), f.get("alt"))


@uav_commands.route("/jump", methods=["POST"])
def uav_jump_command():
    f = request.json
    if not all(field in f for field in ["command"]):
        raise InvalidRequestError("Missing required fields in request")
    return app.gs.uav.jump_to_command(f.get("command"))


@uav_commands.route("/write", methods=["POST"])
def uav_write_commands():
    """
    Write commands from the mission file to the UAV.
    """
    return app.gs.uav.write_commands()


@uav_commands.route("/load", methods=["POST"])
def uav_load_commands():
    """
    Load commands from the UAV to the mission file.
    """
    return app.gs.uav.load_commands()


@uav_commands.route("/view")
def uav_view_commands_file():
    return send_file("handlers/uav/uav_mission.txt")


@uav_commands.route("/export")
def uav_export_commands_file():
    waypoints = []
    with open("handlers/uav/uav_mission.txt", "r", encoding="utf-8") as f:
        for line in f.readlines()[1:]:
            spl = line.split("\t")
            waypoints.append({
                "lat": float(spl[8]),
                "lon": float(spl[9]),
                "alt": float(spl[10])
            })
    return {"waypoints": waypoints}


@uav_commands.route("/generate", methods=["POST"])
def uav_generate_commands_file():
    f = request.json
    if not all(field in f for field in ["waypoints"]):
        raise InvalidRequestError("Missing required fields in request")
    with open("handlers/uav/uav_mission.txt", "w", encoding="utf-8") as file:
        file.write("QGC WPL 110\n")
        counter = 1
        for waypoint in f.get("waypoints"):
            file.write(f"{counter}\t0\t3\t16\t0.0\t0.0\t0.0\t0.0\t{waypoint.get('lat')}\t{waypoint.get('lon')}\t{waypoint.get('alt')}\t1\n")
            counter += 1
    return {}


@uav_commands.route("/clear", methods=["POST"])
def uav_clear_commands():
    return app.gs.uav.clear_commands()


# Mode
uav_mode = Blueprint("uav_mode", __name__)
uav.register_blueprint(uav_mode, url_prefix="/mode")


@uav_mode.route("/get")
def uav_get_mode():
    return app.gs.uav.get_flight_mode()


@uav_mode.route("/set", methods=["POST"])
def uav_set_mode():
    f = request.json
    if not all(field in f for field in ["mode"]):
        raise InvalidRequestError("Missing required fields in request")
    return app.gs.uav.set_flight_mode(f.get("mode"))


# Params
uav_params = Blueprint("uav_params", __name__)
uav.register_blueprint(uav_params, url_prefix="/params")


@uav_params.route("/get/<key>")
def uav_get_param(key):
    return app.gs.uav.get_param(key)


@uav_params.route("/getall")
def uav_get_params():
    return app.gs.uav.get_params()


@uav_params.route("/set/<key>/<value>", methods=["POST"])
def uav_set_param(key, value):
    return app.gs.uav.set_param(key, value)


@uav_params.route("/setmultiple", methods=["POST"])
def uav_set_params():
    f = request.json
    if not all(field in f for field in ["params"]):
        raise InvalidRequestError("Missing required fields in request")
    return app.gs.uav.set_params(f.get("params"))  # {"param": "newvalue"}


@uav_params.route("/save", methods=["POST"])
def uav_save_params():
    return app.gs.uav.save_params()


@uav_params.route("/load", methods=["POST"])
def uav_load_params():
    return app.gs.uav.load_params()
