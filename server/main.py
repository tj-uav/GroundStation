import random
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, send, emit

# from interop_handler import InteropHandler
# import logging
# log = logging.getLogger('werkzeug')
# log.setLevel(logging.ERROR)

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")


# interop = InteropHandler(1)

# @app.route("/")
# def hello():
#     return "Hello World!"


# @app.route("/interop/login", methods=["GET", "POST"])
# def interop_login():
#     if request.method == "POST":
#         try:
#             data = request.get_json()
#             interop.login(data['ip'], data['username'], data['password'])
#         except:
#             return jsonify({"status": False})
#     return jsonify({"status": interop.login_status})
#
#
# @app.route("/interop/get/<key>")
# def interop_get(key):
#     return jsonify(interop.get_data(key))
#
#
# @app.route("/interop/odlcs/<id>/<dtype>")
# def odcl_get(id, dtype):
#     return jsonify(interop.get_odlcs(id, dtype))


@socketio.on("connect")
def connect():
    print("Connected")
    return


@socketio.on("message")
def telem():
    print("DATA")
    data = {'altitude': random.randint(0, 50), 'orientation': random.randint(0, 50),
            'groundspeed': random.randint(0, 50), 'airspeed': random.randint(0, 50), 'text': random.randint(0, 50),
            'battery': random.randint(0, 50), 'throttle': random.randint(0, 50), 'latlong': random.randint(0, 50)}
    emit('responseMessage', data)

if __name__ == "__main__":
    socketio.run(app)
