from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO
import logging
import json

log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

if __name__ == "__main__":
#    app.run()
   socketio.run(app)
