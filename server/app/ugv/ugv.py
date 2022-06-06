from flask import Blueprint, current_app as app

from app.ugv.commands import ugv_commands
from app.ugv.mode import ugv_mode
from app.ugv.params import ugv_params

ugv = Blueprint("ugv", __name__)
ugv.register_blueprint(ugv_commands, url_prefix="/commands")
ugv.register_blueprint(ugv_mode, url_prefix="/mode")
ugv.register_blueprint(ugv_params, url_prefix="/params")


@ugv.route("/connect", methods=["POST"])
def ugv_connect():
    return app.gs.call("ugv_connect")


@ugv.route("/update", methods=["POST"])
def ugv_update():
    return app.gs.call("ugv_update")


@ugv.route("/quick")
def ugv_quick():
    return app.gs.call("ugv_quick")


@ugv.route("/stats")
def ugv_stats():
    return app.gs.call("ugv_stats")


@ugv.route("/getarmed")
def ugv_armed():
    return app.gs.call("ugv_getarmed")


@ugv.route("/arm", methods=["POST"])
def ugv_arm():
    return app.gs.call("ugv_arm")


@ugv.route("/disarm", methods=["POST"])
def ugv_disarm():
    return app.gs.call("ugv_disarm")
