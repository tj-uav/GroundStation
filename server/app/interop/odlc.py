import base64

from flask import Blueprint, request, current_app as app

from errors import InvalidRequestError

interop_odlc = Blueprint("interop_odlc", __name__)


@interop_odlc.route("/list")
def odlc_list():
    return app.gs.call("i_odlcget")


@interop_odlc.route("/filter/<int:status>")  # 0: Not Reviewed, 1: Submitted, 2: Rejected
def odlc_filter(status):
    return app.gs.call("i_odlcget", status)


@interop_odlc.route("/image/<int:id_>")
def odlc_get_image(id_):
    with open(f"assets/odlc_images/{id_}.png", "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read())
    return {"image": encoded_string.decode("utf-8")}


@interop_odlc.route("/add", methods=["POST"])
def odlc_add():
    f = request.json
    if not all(field in f for field in ["image", "type", "lat", "lon"]):
        raise InvalidRequestError("Missing required fields in request")
    if f.get("type") == "standard":
        if not all(field in f for field in
                   ["orientation", "shape", "shape_color", "alpha", "alpha_color"]):
            raise InvalidRequestError("Missing required fields for specific ODLC type")
    else:
        if not all(field in f for field in ["description"]):
            raise InvalidRequestError("Missing required fields for specific ODLC type")
    return app.gs.call("i_odlcadd",
                       f.get("image"),
                       f.get("type"),
                       f.get("latitude"),
                       f.get("longitude"),
                       f.get("orientation"),
                       f.get("shape"),
                       f.get("shape_color"),
                       f.get("alphanumeric"),
                       f.get("alphanumeric_color"),
                       f.get("description")
                       )


@interop_odlc.route("/edit/<int:id_>", methods=["POST"])
def odlc_edit(id_):
    f = request.json
    if not all(field in f for field in ["type"]):
        raise InvalidRequestError("Missing required fields in request")
    return app.gs.call("i_odlcedit",
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
                       f.get("description")
                       )


@interop_odlc.route("/reject/<int:id_>", methods=["POST"])
def odlc_reject(id_):
    return app.gs.call("i_odlcreject", id_)


@interop_odlc.route("/submit/<int:id_>", methods=["POST"])
def odlc_submit(id_):
    f = request.json
    return app.gs.call("i_odlcsubmit", id_, f.get("status"))


@interop_odlc.route("/save", methods=["POST"])
def odlc_save():
    return app.gs.call("i_odlcsave")


@interop_odlc.route("/load", methods=["POST"])
def odlc_load():
    return app.gs.call("i_odlcload")
