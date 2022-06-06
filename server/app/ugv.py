from flask import Blueprint, current_app as app, request, send_file

from errors import InvalidRequestError

ugv = Blueprint("ugv", __name__)


@ugv.route("/connect", methods=["POST"])
def ugv_connect():
    return app.gs.ugv.connect()


@ugv.route("/update", methods=["POST"])
def ugv_update():
    return app.gs.ugv.update()


@ugv.route("/quick")
def ugv_quick():
    return app.gs.ugv.quick()


@ugv.route("/stats")
def ugv_stats():
    return app.gs.ugv.stats()


@ugv.route("/sethome", methods=["POST"])
def uav_sethome():
    return app.gs.ugv.set_home()


@ugv.route("/calibrate", methods=["POST"])
def uav_calibrate():
    return app.gs.ugv.calibrate()


@ugv.route("/restart", methods=["POST"])
def uav_restart():
    return app.gs.ugv.restart()


@ugv.route("/abort", methods=["POST"])
def uav_abort():
    return app.gs.ugv.abort()


@ugv.route("/getarmed")
def ugv_armed():
    return app.gs.ugv.get_armed()


@ugv.route("/arm", methods=["POST"])
def ugv_arm():
    return app.gs.ugv.arm()


@ugv.route("/disarm", methods=["POST"])
def ugv_disarm():
    return app.gs.ugv.disarm()


# Commands
ugv_commands = Blueprint("ugv_commands", __name__)
ugv.register_blueprint(ugv_commands, url_prefix="/commands")


@ugv_commands.route("/get")
def ugv_get_commands():
    return app.gs.ugv.get_commands()


@ugv_commands.route("/load", methods=["POST"])
def uav_load_commands():
    return app.gs.ugv.load_commands()


@ugv_commands.route("/view")
def uav_view_commands_file():
    return send_file("handlers/pixhawk/uav/uav_mission.txt")


@ugv_commands.route("/clear", methods=["POST"])
def ugv_clear_commands():
    return app.gs.ugv.clear_commands()


# Mode
ugv_mode = Blueprint("ugv_mode", __name__)
ugv.register_blueprint(ugv_mode, url_prefix="/mode")


@ugv_mode.route("/get")
def ugv_get_mode():
    return app.gs.ugv.get_flight_mode()


@ugv_mode.route("/set", methods=["POST"])
def ugv_set_mode():
    f = request.json
    if not all(field in f for field in ["mode"]):
        raise InvalidRequestError("Missing required fields in request")
    return app.gs.ugv.set_flight_mode(f.get("mode"))


# Params
ugv_params = Blueprint("ugv_params", __name__)
ugv.register_blueprint(ugv_params, url_prefix="/params")


@ugv_params.route("/get/<key>")
def ugv_get_param(key):
    return app.gs.ugv.get_param(key)


@ugv_params.route("/getall")
def ugv_get_params():
    return app.gs.ugv.get_params()


@ugv_params.route("/set/<key>/<value>", methods=["POST"])
def ugv_set_param(key, value):
    return app.gs.ugv.set_param(key, value)


@ugv_params.route("/setmultiple", methods=["POST"])
def ugv_set_params():
    f = request.json
    if not all(field in f for field in ["params"]):
        raise InvalidRequestError("Missing required fields in request")
    return app.gs.ugv.set_params(f.get("params"))  # {"param": "newvalue"}


@ugv_params.route("/save", methods=["POST"])
def ugv_save_params():
    return app.gs.ugv.save_params()


@ugv_params.route("/load", methods=["POST"])
def ugv_load_params():
    return app.gs.ugv.load_params()
