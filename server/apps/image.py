import os.path

from flask import Blueprint, current_app as app, request, send_file
import requests  # type: ignore[import]

from utils.errors import InvalidRequestError

image = Blueprint("image", __name__)


@image.route("/status")
def status():
    return app.gs.image.status()


@image.route("/pause", methods=["POST"])
def pause():
    return app.gs.image.pause()


@image.route("/resume", methods=["POST"])
def resume():
    return app.gs.image.resume()


# Also uses the GET method for emergency stop from browser
@image.route("/stop", methods=["GET", "POST"])
def stop():
    return app.gs.image.stop()


@image.route("/config")
def get_config():
    return app.gs.image.get_config()


@image.route("/setconfig", methods=["POST"])
def set_config():
    f = request.form
    return app.gs.image.set_config(f.get("f-number"), f.get("iso"), f.get("shutterspeed"))


@image.route("/image_file/<int:image_id>")
def image_file(image_id):
    if not os.path.exists(
        os.path.join(os.getcwd(), "assets", "images", "odlc", f"{image_id}.png")
    ):
        raise InvalidRequestError("Image not found")
    return send_file(os.path.join(os.getcwd(), "assets", "images", "odlc", f"{image_id}.png"))


@image.route("/image_data/<int:image_id>")
def image_data(image_id):
    if image_id not in app.gs.image.image_data:
        raise InvalidRequestError("Image not found")
    print(app.gs.image.image_data[image_id])
    return {"result": app.gs.image.image_data[image_id]}
