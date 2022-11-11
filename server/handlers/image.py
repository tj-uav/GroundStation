from __future__ import annotations
import logging
import string
import time
import typing
from random import random, choice

import requests  # type: ignore[import]
from dotenv import load_dotenv

from utils.decorators import decorate_all_functions, log

load_dotenv()

if typing.TYPE_CHECKING:
    from groundstation import GroundStation


@decorate_all_functions(log, logging.getLogger("groundstation"))
class ImageHandler:
    def __init__(self, gs, config):
        self.logger = logging.getLogger("groundstation")
        self.gs: GroundStation = gs
        self.config = config
        self.img_count = -1
        print("╠ CREATED IMAGE HANDLER")
        self.logger.info("CREATED IMAGE HANDLER")

    def initialize(self):
        print("╠ INITIALIZED IMAGE HANDLER")
        self.logger.info("INITIALIZED IMAGE HANDLER")

    def retrieve_image(self, img_cnt):
        for i in range(self.img_count, img_cnt):
            self.logger.info("Retreiving image %s", i)
            img_res = requests.get(self.config["uav"]["images"]["url"] + f"/image/{i}")
            if img_res.status_code == 200 and self.process_image(img_res.content):
                self.logger.info("[Image] Successfully identified ODLC from Image")
            time.sleep(1)
        self.img_count = img_cnt

    def dummy_retrieve_image(self):
        # Retrieves Image from UAV
        if random() < 1:  # Every image (until CV implementation)
            file_extension = "jpg" if self.config["uav"]["images"]["quality"] > 0 else "png"
            with open(f"assets/odlc_images/sample.png", "rb") as image_file:
                img = image_file.read()
            if self.process_image(img):  # Dummy Image
                self.logger.info("[Image] Successfully identified ODLC from Image")
                return True
        return False

    def process_image(self, image):
        if random() < 1:  # 5% chance that the image is of an ODLC
            # Dummy Data
            self.gs.interop.odlc_add_to_queue(
                image,
                "standard",
                self.gs.uav.lat,
                self.gs.uav.lon,
                self.gs.uav.orientation["yaw"],
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
            )
            return True
        return False

    def __repr__(self):
        return "Image Handler"
