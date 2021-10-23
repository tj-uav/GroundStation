import base64
import json
import logging
from threading import Thread

from flask import Flask, jsonify, redirect, url_for, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit

from dummy_mav_handler import DummyMavHandler
from interop_handler import InteropHandler
from mav_handler import MavHandler

log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)
with open('config.json', 'r') as file:
    config = json.load(file)

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

if config['mav']['dummy']:
    mav = DummyMavHandler(config=config, socketio=socketio)
else:
    mav = MavHandler(config=config)
interop = InteropHandler(config=config)


@socketio.on('connect')
def test_connect():
    emit('connect', {'data': 'Connected'})


@app.route("/")
def index():
    return "TJ UAV Ground Station Backend homepage"


@app.route("/hello")
def hello():
    return redirect(url_for("hello"))


@app.route("/interop/login")
def interop_login():
    interop.login()
    return jsonify({"status": interop.login_status})


@app.route("/interop/get/<key>")
def interop_get(key):
    return jsonify(interop.get_data(key))


@app.route("/interop/telemetry")
def interop_telemetry():
    return jsonify(interop.telemetry_json)


@app.route("/interop/odlc/list")
def odlc_list():
    return jsonify(interop.odlc_get_queue())


@app.route("/interop/odlc/filter/<int:status>")  # 0: Not Reviewed, 1: Submitted, 2: Rejected
def odlc_filter(status):
    return jsonify(interop.odlc_get_queue(status))


@app.route("/interop/odlc/image/<int:id_>")
def odlc_get_image(id_):
    with open(f"assets/odlc_images/{id_}.jpg", "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read())
    return jsonify({"image": encoded_string.decode('utf-8')})


@app.route("/interop/odlc/add", methods=["POST"])
def odlc_add():
    f = request.form
    return jsonify(
        interop.odlc_add_to_queue(f.get("type"), float(f.get("lat")), float(f.get("lon")),
                                  int(f.get("orientation")), f.get("shape"), f.get("shape_color"),
                                  f.get("alpha"), f.get("alpha_color"), f.get("description")))


@app.route("/interop/odlc/edit/<int:id_>", methods=["POST"])
def odlc_edit(id_):
    f = request.form
    return jsonify(interop.odlc_edit(id_, f.get("type"), float(f.get("lat")), float(f.get("lon")),
                                     int(f.get("orientation")), f.get("shape"),
                                     f.get("shape_color"), f.get("alpha"), f.get("alpha_color"),
                                     f.get("description")))


@app.route("/interop/odlc/reject/<int:id_>", methods=["POST"])
def odlc_reject(id_):
    return jsonify(interop.odlc_reject(id_))


@app.route("/interop/odlc/submit/<int:id_>", methods=["POST"])
def odlc_submit(id_):
    return jsonify(interop.odlc_submit(id_))


@app.route("/interop/odlc/load")
def odlc_load():
    return jsonify(interop.odlc_load_queue())


@app.route("/interop/odlc/save")
def odlc_save():
    return jsonify(interop.odlc_save_queue())


@app.route("/mav/quick")
def quick():
    return json.dumps(mav.quick())


@app.route("/mav/params")
def get_params():
    return json.dumps(mav.params())


@app.route("/mav/params/<key>/<value>")
def set_param(key, value):
    mav.set_param(key, float(value))
    return "Success"


@app.route("/mav/commands")
def commands_get():
    return jsonify(mav.get_commands())


@app.route("/mav/commands/<command>/<lat>/<lon>/<alt>")
def command_append(command, lat, lon, alt):
    mav.insert_command(command, lat, lon, alt)
    return "Success"


# Below method is not possible due to dronekit limitations
# @app.route("/mav/commands/<command>/<lat>/<lon>/<alt>/<ind>")
# def command_insert(command, lat, lon, alt, ind):
#     mav.insert_command(command, lat, lon, alt, ind)
#     return "Success"


if __name__ == "__main__":
    mav.connect()

    interop.login()
    interop_telem_thread = Thread(target=interop.submit_telemetry, args=(mav,))
    interop_telem_thread.daemon = True
    interop_telem_thread.start()
    app.run(port=5000)
    # socketio.run(app, port=5000)
