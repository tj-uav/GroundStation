from flask import Flask, jsonify, request
from flask_cors import CORS
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
if config['mav']['dummy']:
    mav = DummyMavHandler(port=config['mav']['port'])
else:
    mav = MavHandler(port=config['mav']['port'], serial=config['mav']['serial'])

interop = InteropHandler(mission_id=config['interop']['mission_id'])
interop_telem_thread = Thread(target=interop.submit_telemetry, args=(mav,))
interop_telem_thread.daemon = True
interop_telem_thread.start()

CORS(app)

@app.route("/hello")
def hello():
    return "TJ UAV Ground Station Backend homepage"


@app.route("/interop/login")
def interop_login():
    interop.login(url=config['interop']['url'], username=config['interop']['username'], password=config['interop']['password'])
    return jsonify({"status": interop.login_status})


@app.route("/interop/get/<key>")
def interop_get(key):
    return jsonify(interop.get_data(key))


@app.route("/interop/odlcs/<id>/<dtype>")
def odcl_get(id, dtype):
    return jsonify(interop.get_odlcs(id, dtype))


@app.route("/mav/quick")
def quick():
    return json.dumps(mav.quick())

@app.route("/mav/commands")
def commands_get():
    return jsonify(mav.getCommands())

@app.route("mav/commands/<command>/<lat>/<lon>/<alt>")
def commands_append(command, lat, lon, alt):
    mav.setCommand(command, lat, lon, alt)
    return "Success"

@app.route("mav/commands/<command>/<lat>/<lon>/<alt>/<ind>")
def commands_insert(command, lat, lon, alt, ind):
    mav.setCommand(command, lat, lon, alt, ind)
    return "Success"

if __name__ == "__main__":
    mav.connect()
    app.run(port=5000, debug=False)
