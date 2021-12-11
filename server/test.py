import logging

from flask import Flask
from flask_socketio import SocketIO

log = logging.getLogger("werkzeug")
log.setLevel(logging.ERROR)

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

if __name__ == "__main__":
    #    app.run()
    socketio.run(app)
