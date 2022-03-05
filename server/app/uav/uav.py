from flask import Blueprint, current_app as app

from app.uav.commands import uav_commands
from app.uav.mode import uav_mode
from app.uav.params import uav_params

uav = Blueprint("uav", __name__)
uav.register_blueprint(uav_commands, url_prefix="/commands")
uav.register_blueprint(uav_mode, url_prefix="/mode")
uav.register_blueprint(uav_params, url_prefix="/params")


@uav.route("/connect", methods=["POST"])
def uav_connect():
    return app.gs.call("uav_connect")


@uav.route("/update", methods=["POST"])
def uav_update():
    return app.gs.call("uav_update")


@uav.route("/quick")
def uav_quick():
    return app.gs.call("uav_quick")


@uav.route("/stats")
def uav_stats():
    return app.gs.call("uav_stats")


@uav.route("/getarmed")
def uav_armed():
    return app.gs.call("uav_getarmed")


@uav.route("/arm", methods=["POST"])
def uav_arm():
    return app.gs.call("uav_arm")


@uav.route("/disarm", methods=["POST"])
def uav_disarm():
    return app.gs.call("uav_disarm")
