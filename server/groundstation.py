import json
import logging
import time
from threading import Thread

import requests

import errors
from handlers import DummyUAV, ProdUAV
from handlers import DummyUGV, ProdUGV
from handlers import Interop, Image


class GroundStation:
    def __init__(self):
        self.logger = logging.getLogger("groundstation")
        self.telem_logger = logging.getLogger("telemetry")
        with open("config.json", "r", encoding="utf-8") as file:
            self.config = json.load(file)

        print("╔══ CREATING HANDLERS")
        self.logger.info("CREATING HANDLERS")

        self.interop_telem_thread = (
            self.plane_thread
        ) = self.rover_thread = self.retrieve_image_thread = None

        self.interop = Interop(self, config=self.config)
        self.image = Image(self, self.config)

        uavconfig = self.config["uav"]["telemetry"]["type"]
        self.uav = DummyUAV if uavconfig == "dummy" else ProdUAV
        self.uav: ProdUAV = self.uav(self, self.config)

        ugvconfig = self.config["ugv"]["telemetry"]["type"]
        self.ugv = DummyUGV if ugvconfig == "dummy" else ProdUGV
        self.ugv: ProdUGV = self.ugv(self, self.config)

        print("╚═══ CREATED HANDLERS\n")
        self.logger.info("CREATED HANDLERS\n")

        print("╔═══ INITIALIZING HANDLERS")
        self.logger.info("INITIALIZING HANDLERS")
        self.interop.login()
        time.sleep(1)
        self.uav.connect()
        self.ugv.connect()
        self.image.initialize()
        print("╚═══ INITIALIZED HANDLERS\n")
        self.logger.info("INITIALIZED HANDLERS\n")

        self.async_calls()

    def telemetry_thread(self):
        while True:
            if not self.interop.login_status:  # Connection to Interop Server is already lost
                try:
                    self.interop.login()  # Re-initiate connection
                    self.logger.important(
                        "[Telemetry] Re-initiated connection with Interop Server"
                    )
                except errors.ServiceUnavailableError:
                    self.logger.info(
                        "[Telemetry] Unable to re-initiate connection with Interop "
                        "Server, retrying in one second"
                    )
                time.sleep(1)
                continue

            try:
                run = self.interop.submit_telemetry()
            except errors.ServiceUnavailableError:  # Lost connection to Interop
                self.logger.critical(
                    "[Telemetry] Lost connection to Interop Server, attempting to "
                    "re-initiate connection every second"
                )
                time.sleep(1)
                continue

            if run:
                self.logger.debug("[Telemetry] %s", run)
            time.sleep(0.1)

    def uav_thread(self):
        while True:
            run = self.uav.update()
            self.logger.debug("[UAV] %s", run)
            if self.config["uav"]["telemetry"]["log"]:
                self.telem_logger.info(json.dumps(self.uav.stats()))
            time.sleep(0.1)

    def ugv_thread(self):
        while True:
            run = self.ugv.update()
            self.logger.debug("[UGV] %s", run)
            time.sleep(0.1)

    def image_thread(self):
        if self.config["uav"]["images"]["type"] == "prod":  # Initialize a socket connection
            while True:
                time.sleep(1)
                try:
                    res = requests.get(f"{self.config['uav']['images']['url']}/last_image")
                except Exception:
                    self.logger.error(
                        "[Image] Cannot connect to FlightSoftware, retrying in 5 seconds"
                    )
                    time.sleep(4)
                    continue
                if res.status_code != 200:
                    self.logger.error(
                        "[Image] Unable to retrieve image count, retrying in 5 seconds"
                    )
                    time.sleep(4)
                    continue
                img_cnt = res.json()["result"]
                if img_cnt != self.image.img_count:
                    self.image.retrieve_image(img_cnt)
        else:  # Use a dummy connection
            while True:
                self.image.dummy_retrieve_image()
                time.sleep(2)

    def async_calls(self):
        print("╔═══ STARTING ASYNC THREADS")
        self.logger.info("STARTING ASYNC THREADS")
        self.interop_telem_thread = Thread(target=self.telemetry_thread)
        self.interop_telem_thread.name = "InteropThread"
        self.interop_telem_thread.daemon = True

        self.plane_thread = Thread(target=self.uav_thread)
        self.plane_thread.name = "UAVThread"
        self.plane_thread.daemon = True

        self.rover_thread = Thread(target=self.ugv_thread)
        self.rover_thread.name = "UGVThread"
        self.rover_thread.daemon = True

        self.retrieve_image_thread = Thread(target=self.image_thread)
        self.retrieve_image_thread.name = "ImageThread"
        self.retrieve_image_thread.daemon = True

        self.interop_telem_thread.start()
        print("╠ STARTED TELEMETRY THREAD")
        self.logger.info("STARTED TELEMETRY THREAD")

        self.plane_thread.start()
        print("╠ STARTED UAV THREAD")
        self.logger.info("STARTED UAV THREAD")

        self.rover_thread.start()
        print("╠ STARTED UGV THREAD")
        self.logger.info("STARTED UGV THREAD")

        self.retrieve_image_thread.start()
        print("╠ STARTED IMAGE THREAD")
        self.logger.info("STARTED IMAGE THREAD")

        print("╚═══ STARTED ASYNC THREADS\n")
        self.logger.info("STARTED ASYNC THREADS\n")
