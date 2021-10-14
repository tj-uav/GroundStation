import random
from flask import Flask, jsonify, request, redirect, url_for
from flask_cors import CORS
from flask_socketio import SocketIO, send, emit
from interop_handler import InteropHandler
from mav_handler import MavHandler
from dummy_mav_handler import DummyMavHandler
from threading import Thread
import logging
import json

log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)
config = json.load(open('config.json', 'r'))

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
    return redirect(url_for("hello"))

@app.route("/hello")
def hello():
    return "TJ UAV Ground Station Backend homepage"


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


@app.route("/interop/odlcs/<id>/<dtype>")
def odcl_get(id, dtype):
    return jsonify(interop.get_odlcs(id, dtype))


@app.route("/mav/quick")
def quick():
    return json.dumps(mav.quick())

@app.route("/mav/params")
def getParams():
    return json.dumps(mav.params())

@app.route("/mav/params/<key>/<value>")
def setParam(key, value):
    mav.setParam(key, float(value))
    return "Success"

@app.route("/mav/commands")
def commands_get():
    return jsonify(mav.getCommands())


@app.route("/mav/commands/<command>/<lat>/<lon>/<alt>")
def command_append(command, lat, lon, alt):
    mav.insertCommand(command, lat, lon, alt)
    return "Success"


@app.route("/mav/commands/<command>/<lat>/<lon>/<alt>/<ind>")
def command_insert(command, lat, lon, alt, ind):
    mav.insertCommand(command, lat, lon, alt, ind)
    return "Success"


if __name__ == "__main__":
    mav.connect()

    interop.login()
    interop_telem_thread = Thread(target=interop.submit_telemetry, args=(mav,))
    interop_telem_thread.daemon = True
    interop_telem_thread.start()
    app.run(port=5000)
    # socketio.run(app, port=5000)
