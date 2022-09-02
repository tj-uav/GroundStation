import base64
import json

from flask import Blueprint, current_app as app, request

from utils.errors import InvalidRequestError

interop = Blueprint("interop", __name__)


@interop.route("/login", methods=["POST"])
def interop_login():
    return app.gs.interop.login()


@interop.route("/get/<key>")
def interop_get(key):
    return app.gs.interop.get_data(key)


@interop.route("/mission")
def interop_mission():
    return app.gs.interop.get_data()


@interop.route("/telemetry")
def interop_telemetry():
    return app.gs.interop.get_telemetry()


# Map
interop_map = Blueprint("interop_map", __name__)
interop.register_blueprint(interop_map, url_prefix="/map")


@interop_map.route("/add", methods=["POST"])
def map_add():
    f = request.json
    if not all(field in f for field in ["name", "image"]):
        raise InvalidRequestError("Missing required fields in request")
    return app.gs.interop.map_add(f.get("name"), f.get("image"))


@interop_map.route("/submit", methods=["POST"])
def map_submit():
    f = request.json
    if not all(field in f for field in ["name"]):
        raise InvalidRequestError("Missing required fields in request")
    return app.gs.interop.map_submit(f.get("name"))


# ODLC
interop_odlc = Blueprint("interop_odlc", __name__)
interop.register_blueprint(interop_odlc, url_prefix="/odlc")


@interop_odlc.route("/list")
def odlc_list():
    return app.gs.interop.odlc_get_queue()


@interop_odlc.route("/filter/<int:status>")  # 0: Not Reviewed, 1: Submitted, 2: Rejected
def odlc_filter(status):
    return app.gs.interop.odlc_get_queue(status)


@interop_odlc.route("/image/<int:id_>")
def odlc_get_image(id_):
    file_extension = "jpg" if app.config["uav"]["images"]["quality"] > 0 else "png"
    with open(f"assets/odlc_images/{id_}.{file_extension}", "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read())
    return {"image": encoded_string.decode("utf-8")}


@interop_odlc.route("/add", methods=["POST"])
def odlc_add():
    f = request.json
    if not all(field in f for field in ["image", "type", "lat", "lon"]):
        raise InvalidRequestError("Missing required fields in request")
    if f.get("type") == "standard":
        if not all(
            field in f for field in ["orientation", "shape", "shape_color", "alpha", "alpha_color"]
        ):
            raise InvalidRequestError("Missing required fields for specific ODLC type")
    else:
        if not all(field in f for field in ["description"]):
            raise InvalidRequestError("Missing required fields for specific ODLC type")
    return app.gs.interop.odlc_add_to_queue(
        f.get("image"),
        f.get("type"),
        f.get("latitude"),
        f.get("longitude"),
        f.get("orientation"),
        f.get("shape"),
        f.get("shape_color"),
        f.get("alphanumeric"),
        f.get("alphanumeric_color"),
        f.get("description"),
    )


@interop_odlc.route("/edit/<int:id_>", methods=["POST"])
def odlc_edit(id_):
    f = request.json
    if not all(field in f for field in ["type"]):
        raise InvalidRequestError("Missing required fields in request")
    return app.gs.interop.odlc_edit(
        id_,
        f.get("image"),
        f.get("type"),
        f.get("latitude"),
        f.get("longitude"),
        f.get("orientation"),
        f.get("shape"),
        f.get("shape_color"),
        f.get("alphanumeric"),
        f.get("alphanumeric_color"),
        f.get("description"),
    )


@interop_odlc.route("/reject/<int:id_>", methods=["POST"])
def odlc_reject(id_):
    return app.gs.interop.odlc_reject(id_)


@interop_odlc.route("/submit/<int:id_>", methods=["POST"])
def odlc_submit(id_):
    f = request.json
    return app.gs.interop.odlc_submit(id_, f.get("status"))


@interop_odlc.route("/save", methods=["POST"])
def odlc_save():
    return app.gs.interop.odlc_save_queue()


@interop_odlc.route("/load", methods=["POST"])
def odlc_load():
    return app.gs.interop.odlc_load_queue()
