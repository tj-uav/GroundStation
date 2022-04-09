import base64
import logging
import string
from random import random, randint, choice

import eventlet
import socketio
from dotenv import load_dotenv

from handlers.utils import decorate_all_functions, log

load_dotenv()


@decorate_all_functions(log, logging.getLogger("groundstation"))
class ImageHandler:
    def __init__(self, gs, config):
        self.logger = logging.getLogger("groundstation")
        self.gs = gs
        self.config = config
        self.sio = self.app = None
        print("╠ CREATED IMAGE HANDLER")
        self.logger.info("CREATED IMAGE HANDLER")

    def initialize(self):
        self.sio = socketio.Server(max_http_buffer_size=40_000_000)
        self.app = socketio.WSGIApp(self.sio)

        @self.sio.event
        def connect(sid, _):
            self.logger.important("[Image] Socketio connection established (sid: %s)", sid)

        @self.sio.event
        def image(sid, data):
            self.logger.debug(
                "[Image] Successfully retreived image from socketio connection (sid: %s)", sid
            )
            img = data["image"]
            if self.process_image(img):
                self.logger.info("[Image] Successfully identified ODLC from Image (sid: %s)", sid)

        @self.sio.event
        def disconnect(sid):
            self.logger.warning("[Image] Lost socketio connection (sid: %s)", sid)

        print("╠ INITIALIZED IMAGE HANDLER")
        self.logger.info("INITIALIZED IMAGE HANDLER")

    def socket_connect(self):
        eventlet.wsgi.server(
            eventlet.listen(
                (self.config["uav"]["images"]["host"], self.config["uav"]["images"]["port"])
            ),
            self.app,
            log_output=False,
        )

    # When socket connection is not used
    def retreive_images(self):
        # Retreives Image from UAV
        if random() < 1:  # Every image (until CV implementation)
            with open("assets/odlc_images/sample.png", "rb") as image_file:
                img = base64.b64encode(image_file.read())
            if self.process_image(img):  # Dummy Image
                self.logger.info("[Image] Successfully identified ODLC from Image")
                return True
        return False

    def process_image(self, image):
        if random() < 0.05:  # 5% chance that the image is of an ODLC
            # Dummy Data
            self.gs.interop.odlc.add_to_queue(
                image,
                "standard",
                random() * 90,
                random() * -90,
                randint(0, 360),
                choice(
                    [
                        "circle",
                        "semicircle",
                        "quarter_circle",
                        "triangle",
                        "square",
                        "rectangle",
                        "trapezoid",
                        "pentagon",
                        "hexagon",
                        "heptagon",
                        "octagon",
                        "star",
                        "cross",
                    ]
                ),
                choice(
                    [
                        "white",
                        "gray",
                        "red",
                        "blue",
                        "green",
                        "yellow",
                        "purple",
                        "brown",
                        "orange",
                    ]
                ),
                choice(string.ascii_uppercase + string.digits),
                choice(
                    [
                        "white",
                        "gray",
                        "red",
                        "blue",
                        "green",
                        "yellow",
                        "purple",
                        "brown",
                        "orange",
                    ]
                ),
                log=False,
            )
            return True
        return False

    def __repr__(self):
        return "Image Handler"
