import json
import logging
import os
import time
from threading import Thread

import requests  # type: ignore[import]

from handlers import UAVHandler, ImageHandler


class GroundStation:
    def __init__(self, config: dict = None):
        self.logger: logging.Logger = logging.getLogger("groundstation")
        self.telem_logger: logging.Logger = logging.getLogger("telemetry")

        self.config: dict | None = config
        if not self.config:
            with open(os.path.join(os.getcwd(), "config.json"), "r", encoding="utf-8") as file:
                self.config = json.load(file)

        print("╔══ CREATING HANDLERS")
        self.logger.info("CREATING HANDLERS")

        self.plane_thread: Thread | None = None
        self.retrieve_image_thread: Thread | None = None

        self.uav: UAVHandler = UAVHandler(self, self.config)  # type: ignore

        self.image: ImageHandler = ImageHandler(self, self.config)

        print("╚═══ CREATED HANDLERS\n")
        self.logger.info("CREATED HANDLERS\n")

        print("╔═══ INITIALIZING HANDLERS")
        self.logger.info("INITIALIZING HANDLERS")
        self.uav.connect()
        self.image.initialize()
        print("╚═══ INITIALIZED HANDLERS\n")
        self.logger.info("INITIALIZED HANDLERS\n")

        self.async_calls()

    def uav_thread(self) -> None:
        while True:
            self.uav.update()
            # self.logger.debug("[UAV] %s", self.uav.update())
            if self.config["uav"]["telemetry"]["log"]:  # type: ignore[index]
                self.telem_logger.info(json.dumps(self.uav.stats()))
            time.sleep(0.1)

    def image_thread(self) -> None:
        if self.config["uav"]["images"]["type"] == "prod":  # type: ignore[index]
            while True:
                time.sleep(1)
                img_cnt = self.image.get_img_count()
                if img_cnt is not False:
                    self.image.retrieve_image(img_cnt)
                else:
                    time.sleep(5)
        else:  # Use a dummy connection
            while True:
                self.image.dummy_retrieve_image()
                time.sleep(2)

    def async_calls(self) -> None:
        print("╔═══ STARTING ASYNC THREADS")
        self.logger.info("STARTING ASYNC THREADS")

        self.plane_thread = Thread(target=self.uav_thread)
        self.plane_thread.name = "UAVThread"
        self.plane_thread.daemon = True

        self.retrieve_image_thread = Thread(target=self.image_thread)
        self.retrieve_image_thread.name = "ImageThread"
        self.retrieve_image_thread.daemon = True

        self.plane_thread.start()
        print("╠ STARTED UAV THREAD")
        self.logger.info("STARTED UAV THREAD")

        self.retrieve_image_thread.start()
        print("╠ STARTED IMAGE THREAD")
        self.logger.info("STARTED IMAGE THREAD")

        print("╚═══ STARTED ASYNC THREADS\n")
        self.logger.info("STARTED ASYNC THREADS\n")
