import json
import logging
from threading import Thread

from flask import Flask, jsonify, redirect, url_for
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


@app.route("/interop/mission")
def interop_mission():
    return interop.get_mission()


@app.route("/interop/get/<key>")
def interop_get(key):
    return interop.get_data(key)


@app.route("/interop/telemetry")
def interop_telemetry():
    return json.dumps(interop.telemetry_json)


@app.route("/interop/odlcs/<id_>/<dtype>")
def odcl_get(id_, dtype):
    return jsonify(interop.get_odlcs(id_, dtype))


@app.route("/mav/telemetry")
def mav_telemetry():
    return json.dumps(mav.get_telemetry())


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
    interop.login()
    mav.connect(interop.waypoints)

    interop_telem_thread = Thread(target=interop.submit_telemetry, args=(mav,))
    interop_telem_thread.daemon = True
    interop_telem_thread.start()

    app.run(port=5000)
    # socketio.run(app, port=5000)
