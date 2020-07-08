from flask import Flask, jsonify, request
from flask_cors import CORS
# from interop_handler import InteropHandler
import logging
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

app = Flask(__name__)
CORS(app)

# interop = InteropHandler(1)

@app.route("/")
def hello():
    return "Hello World!"


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
    import random
    return jsonify([random.randint(0, 50), random.randint(0, 50), random.randint(0, 50), 
        random.randint(0, 50), random.randint(0, 50), random.randint(0, 50), 
        random.randint(0, 50), random.randint(0, 50),
    ])


if __name__ == "__main__":
    app.run(port=5000, debug=False)