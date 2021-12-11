import base64
import json
import logging

from flask import Flask, redirect, url_for, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit

from groundstation import GroundStation

log = logging.getLogger("werkzeug")
log.setLevel(logging.ERROR)
with open("config.json", "r") as file:
    config = json.load(file)

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

gs = GroundStation(socketio)


@socketio.on("connect")
def test_connect():
    emit("connect", {"data": "Connected"})


@app.route("/")
def index():
    return "TJ UAV Ground Station Backend homepage"


@app.route("/hello")
def hello():
    return redirect(url_for("index"))


@app.route("/interop/login", methods=["POST"])
def interop_login():
    return gs.call("i_login")


@app.route("/interop/get/<key>")
def interop_get(key):
    return gs.call("i_data", key)


@app.route("/interop/mission")
def interop_mission():
    return gs.call("i_data")


@app.route("/interop/telemetry")
def interop_telemetry():
    return gs.call("i_telemetry")


@app.route("/interop/odlc/list")
def odlc_list():
    return gs.call("i_odlcget")


@app.route("/interop/odlc/filter/<int:status>")  # 0: Not Reviewed, 1: Submitted, 2: Rejected
def odlc_filter(status):
    return gs.call("i_odlcget", status)


@app.route("/interop/odlc/image/<int:id_>")
def odlc_get_image(id_):
    with open(f"assets/odlc_images/{id_}.jpg", "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read())
    return {"image": encoded_string.decode("utf-8")}


@app.route("/interop/odlc/add", methods=["POST"])
def odlc_add():
    f = request.form
    return gs.call("i_odlcadd",
                   f.get("type"),
                   float(f.get("lat")),
                   float(f.get("lon")),
                   int(f.get("orientation")),
                   f.get("shape"),
                   f.get("shape_color"),
                   f.get("alpha"),
                   f.get("alpha_color"),
                   f.get("description")
                   )


@app.route("/interop/odlc/edit/<int:id_>", methods=["POST"])
def odlc_edit(id_):
    f = request.form
    return gs.call("i_odlcedit",
                   id_,
                   f.get("type"),
                   float(f.get("lat")),
                   float(f.get("lon")),
                   int(f.get("orientation")),
                   f.get("shape"),
                   f.get("shape_color"),
                   f.get("alpha"),
                   f.get("alpha_color"),
                   f.get("description")
                   )


@app.route("/interop/odlc/reject/<int:id_>", methods=["POST"])
def odlc_reject(id_):
    return gs.call("i_odlcreject", id_)


@app.route("/interop/odlc/submit/<int:id_>", methods=["POST"])
def odlc_submit(id_):
    return gs.call("i_odlcsubmit", id_)


@app.route("/interop/odlc/save", methods=["POST"])
def odlc_save():
    return gs.call("i_odlcsave")


@app.route("/interop/odlc/load", methods=["POST"])
def odlc_load():
    return gs.call("i_odlcload")


@app.route("/interop/map/add", methods=["POST"])
def map_add():
    f = request.form
    return gs.call("i_mapadd", f.get("name"), f.get("image"))


@app.route("/interop/map/submit", methods=["POST"])
def map_submit():
    f = request.form
    return gs.call("i_mapsubmit", f.get("name"))


@app.route("/uav/connect", methods=["POST"])
def connect():
    return gs.call("m_connect")


@app.route("/uav/update", methods=["POST"])
def update():
    return gs.call("m_update")


@app.route("/uav/quick")
def quick():
    return gs.call("m_quick")


@app.route("/uav/stats")
def stats():
    return gs.call("m_stats")


@app.route("/uav/mode/get")
def get_mode():
    return gs.call("m_getflightmode")


@app.route("/uav/mode/set", methods=["POST"])
def set_mode():
    f = request.form
    return gs.call("m_setflightmode", f.get("mode"))


@app.route("/uav/params/get/<key>")
def get_param(key):
    return gs.call("m_getparam", key)


@app.route("/uav/params/getall")
def get_params():
    return gs.call("m_getparams")


@app.route("/uav/params/set/<key>/<value>", methods=["POST"])
def set_param(key, value):
    return gs.call("m_setparam", key, value)


@app.route("/uav/params/setmultiple", methods=["POST"])
def set_params():
    f = request.form
    return gs.call("m_setparams", f.get("params"))  # {"param": "newvalue"}


@app.route("/uav/params/save", methods=["POST"])
def save_params():
    return gs.call("m_saveparams")


@app.route("/uav/params/load", methods=["POST"])
def load_params():
    return gs.call("m_loadparams")


@app.route("/uav/commands/get")
def get_commands():
    return gs.call("m_getcommands")


@app.route("/uav/commands/insert", methods=["POST"])
def insert_command():
    f = request.form
    return gs.call("m_insertcommand",
                   f.get("command"),
                   f.get("lat"),
                   f.get("lon"),
                   f.get("alt")
                   )


@app.route("/uav/commands/clear", methods=["POST"])
def clear_commands():
    return gs.call("m_clearcommands")


@app.route("/uav/getarmed")
def armed():
    return gs.call("m_getarmed")


@app.route("/uav/arm", methods=["POST"])
def arm():
    return gs.call("m_arm")


@app.route("/uav/disarm", methods=["POST"])
def disarm():
    return gs.call("m_disarm")


# Below method is not possible due to dronekit limitations
# @app.route("/mav/commands/<command>/<lat>/<lon>/<alt>/<ind>")
# def command_insert(command, lat, lon, alt, ind):
#     mav.insert_command(command, lat, lon, alt, ind)
#     return "Success"


if __name__ == "__main__":
    app.run(port=5000)
    # socketio.run(app, port=5000)
