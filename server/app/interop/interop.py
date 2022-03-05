from flask import Blueprint, current_app as app

from app.interop.map import interop_map
from app.interop.odlc import interop_odlc

interop = Blueprint("interop", __name__)
interop.register_blueprint(interop_odlc, url_prefix="/odlc")
interop.register_blueprint(interop_map, url_prefix="/map")


@interop.route("/login", methods=["POST"])
def interop_login():
    return app.gs.call("i_login")


@interop.route("/get/<key>")
def interop_get(key):
    return app.gs.call("i_data", key)


@interop.route("/mission")
def interop_mission():
    return app.gs.call("i_data")


@interop.route("/telemetry")
def interop_telemetry():
    return app.gs.call("i_telemetry")
