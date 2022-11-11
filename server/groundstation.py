import json
import logging
import time
from threading import Thread
from typing import Any

import requests  # type: ignore[import]

from utils import errors
from handlers import DummyUAV, ProdUAV
from handlers import DummyUGV, ProdUGV
from handlers import DummyInterop, ProdInterop
from handlers import Image


class GroundStation:
    def __init__(self, config: dict = None):
        self.logger: logging.Logger = logging.getLogger("groundstation")
        self.telem_logger: logging.Logger = logging.getLogger("telemetry")

        self.config: dict | None = config
        if not self.config:
            with open("config.json", "r", encoding="utf-8") as file:
                self.config = json.load(file)

        print("╔══ CREATING HANDLERS")
        self.logger.info("CREATING HANDLERS")

        self.interop_telem_thread: Thread | None = None
        self.plane_thread: Thread | None = None
        self.rover_thread: Thread | None = None
        self.retrieve_image_thread: Thread | None = None

        uav_config = self.config["uav"]["telemetry"]["type"]  # type: ignore[index]
        if uav_config == "dummy":
            self.uav: DummyUAV = DummyUAV(self, self.config)
        else:
            self.uav: ProdUAV = ProdUAV(self, self.config)  # type: ignore

        ugv_config = self.config["ugv"]["telemetry"]["type"]  # type: ignore[index]
        if ugv_config == "dummy":
            self.ugv: DummyUGV = DummyUGV(self, self.config)
        else:
            self.ugv: ProdUGV = ProdUGV(self, self.config)  # type: ignore

        interop_config: str = self.config["interop"]["type"]  # type: ignore[index]
        if interop_config == "dummy":
            self.interop: DummyInterop = DummyInterop(self, self.config)
        else:
            self.interop: ProdInterop = ProdInterop(self, self.config)  # type: ignore

        self.image: Image = Image(self, self.config)

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

    def telemetry_thread(self) -> None:
        while True:
            if not self.interop.login_status:  # Connection to Interop Server is already lost
                try:
                    self.interop.login()  # Re-initiate connection
                    self.logger.important(  # type: ignore[attr-defined]
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

    def uav_thread(self) -> None:
        while True:
            self.uav.update()
            # self.logger.debug("[UAV] %s", self.uav.update())
            if self.config["uav"]["telemetry"]["log"]:  # type: ignore[index]
                self.telem_logger.info(json.dumps(self.uav.stats()))
            time.sleep(0.1)

    def ugv_thread(self) -> None:
        while True:
            self.ugv.update()
            # self.logger.debug("[UGV] %s", self.ugv.update())
            time.sleep(0.1)

    def image_thread(self) -> None:
        if self.config["uav"]["images"]["type"] == "prod":  # type: ignore[index]
            while True:
                time.sleep(1)
                try:
                    res: requests.Response = requests.get(
                        f"{self.config['uav']['images']['url']}/last_image"  # type: ignore[index]
                    )
                except (
                    requests.exceptions.ConnectionError,
                    requests.exceptions.Timeout,
                    requests.exceptions.HTTPError,
                    requests.exceptions.RequestException,
                ) as e:
                    self.logger.info(
                        "[Image] Unable to connect to image server, %s", type(e).__name__
                    )
                    time.sleep(4)
                    continue
                if res.status_code == 200:
                    img_cnt: int = res.json()["result"]
                    if img_cnt != self.image.img_count:
                        self.image.retrieve_image(img_cnt)
                else:
                    time.sleep(4)
                    continue
        else:  # Use a dummy connection
            while True:
                self.image.dummy_retrieve_image()
                time.sleep(2)

    def async_calls(self) -> None:
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
