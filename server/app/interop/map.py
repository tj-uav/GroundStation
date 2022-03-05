from flask import Blueprint, request, current_app as app

from errors import InvalidRequestError

interop_map = Blueprint("interop_map", __name__)


@interop_map.route("/add", methods=["POST"])
def map_add():
    f = request.json
    if not all(field in f for field in ["name", "image"]):
        raise InvalidRequestError("Missing required fields in request")
    return app.gs.call("i_mapadd", f.get("name"), f.get("image"))


@interop_map.route("/submit", methods=["POST"])
def map_submit():
    f = request.json
    if not all(field in f for field in ["name"]):
        raise InvalidRequestError("Missing required fields in request")
    return app.gs.call("i_mapsubmit", f.get("name"))
