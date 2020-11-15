from flask import Flask, jsonify, request
from flask_cors import CORS
# from interop_handler import InteropHandler
from mav_handler import MavHandler
import logging
import json
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

app = Flask(__name__)
mav = MavHandler(dummy=True)#MavHandler(dummy=False, port='tcp:127.0.0.1:5760', serial=False)
CORS(app)

# interop = InteropHandler(1)

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


@app.route("/mav/telem")
def telem():
    global mav
    return json.dumps(mav.telemetry())

if __name__ == "__main__":
    mav.connect()
    app.run(port=5000, debug=False)
