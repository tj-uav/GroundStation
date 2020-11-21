from flask import Flask, jsonify, request
from flask_cors import CORS
from interop_handler import InteropHandler
from mav_handler import MavHandler
from dummy_mav_handler import DummyMavHandler
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
interop.login(ip=config['interop']['ip'], username=config['interop']['username'], password=config['interop']['password'])
CORS(app)

@app.route("/")
def hello():
    return "TJ UAV Ground Station Backend homepage"


@app.route("/interop/login", methods=["GET", "POST"])
def interop_login():
    if request.method == "POST":
        try:
            data = request.get_json()
            interop.login(data['ip'], data['username'], data['password'])
        except:
            return jsonify({"status": False})
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

if __name__ == "__main__":
    mav.connect()
    app.run(port=5000, debug=False)
