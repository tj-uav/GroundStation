from __future__ import annotations
import logging
import os
import typing

import requests  # type: ignore[import]
from dotenv import load_dotenv

from utils.decorators import decorate_all_functions, log
from utils.errors import InvalidRequestError, InvalidStateError, GeneralError

load_dotenv()

if typing.TYPE_CHECKING:
    from groundstation import GroundStation


CONNECTION_EXCEPTIONS = (
    requests.exceptions.ConnectionError,
    requests.exceptions.HTTPError,
    requests.exceptions.RequestException,
)


@decorate_all_functions(log, logging.getLogger("groundstation"))
class ImageHandler:
    def __init__(self, gs, config):
        self.logger = logging.getLogger("groundstation")
        self.gs: GroundStation = gs
        self.config = config
        self.url = self.config["uav"]["images"]["url"]
        self.connected = False
        self.img_count = -1
        self.image_data = {}
        self.camera_config = {"f-number": None, "iso": None, "shutterspeed": None}
        print("╠ CREATED IMAGE HANDLER")
        self.logger.info("CREATED IMAGE HANDLER")

    def initialize(self):
        print("╠ INITIALIZED IMAGE HANDLER")
        self.logger.info("INITIALIZED IMAGE HANDLER")

    def on_connect(self):
        if not self.connected:
            self.connected = True
            self.config = self.get_config()

    def status(self):
        try:
            res: requests.Response = requests.get(self.url + "/status")  # type: ignore[index]
            if res.status_code == 200:
                self.on_connect()
                return {"result": res.json()["result"]}

            self.logger.error("[Image] Unexpected status code: %s", res.status_code)
            raise InvalidStateError(f"Unexpected status code: {res.status_code}")

        except CONNECTION_EXCEPTIONS as e:
            self.connected = False
            self.logger.warning("[Image] Unable to connect to image server, %s", type(e).__name__)
            raise InvalidStateError("Unable to connect to image server") from e
        except Exception as e:
            raise GeneralError(str(e)) from e

    def pause(self):
        try:
            res: requests.Response = requests.post(f"{self.url}/pause")  # type: ignore[index]
            if res.status_code == 200:
                self.on_connect()
                return {}

            self.logger.error("[Image] Unexpected status code, %s", res.status_code)
            raise InvalidStateError(f"Unexpected status code: {res.status_code}")

        except CONNECTION_EXCEPTIONS as e:
            self.connected = False
            self.logger.warning("[Image] Unable to connect to image server, %s", type(e).__name__)
            raise InvalidStateError("Unable to connect to image server") from e
        except Exception as e:
            raise GeneralError(str(e)) from e

    def resume(self):
        try:
            res: requests.Response = requests.post(f"{self.url}/resume")  # type: ignore[index]
            if res.status_code == 200:
                self.on_connect()
                return {}

            self.logger.error("[Image] Unexpected status code, %s", res.status_code)
            raise InvalidStateError(f"Unexpected status code: {res.status_code}")

        except CONNECTION_EXCEPTIONS as e:
            self.connected = False
            self.logger.warning("[Image] Unable to connect to image server, %s", type(e).__name__)
            raise InvalidStateError("Unable to connect to image server") from e
        except Exception as e:
            raise GeneralError(str(e)) from e

    def stop(self):
        try:
            res: requests.Response = requests.post(f"{self.url}/stop", timeout=5)  # type: ignore[index]
            if res.status_code == 200:
                self.logger.warning("[Image] Received response after stopping image server")
                return {}

            self.logger.error("[Image] Unexpected status code, %s", res.status_code)
            raise InvalidStateError(f"Unexpected status code: {res.status_code}")

        except CONNECTION_EXCEPTIONS as e:
            self.connected = False
            self.logger.warning("[Image] Unable to connect to image server, %s", type(e).__name__)
            raise InvalidStateError("Unable to connect to image server") from e
        except requests.exceptions.Timeout:
            self.connected = False
            self.logger.important("[Image] Stopped FlightSoftware")
            return {}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def get_config(self):
        try:
            res: requests.Response = requests.get(f"{self.url}/config")  # type: ignore[index]
            if res.status_code == 200:
                self.on_connect()
                return {"result": res.json()["result"]}

            self.logger.error("[Image] Unexpected status code, %s", res.status_code)
            raise InvalidStateError(f"Unexpected status code: {res.status_code}")

        except CONNECTION_EXCEPTIONS as e:
            self.connected = False
            self.logger.warning("[Image] Unable to connect to image server, %s", type(e).__name__)
            raise InvalidStateError("Unable to connect to image server") from e
        except Exception as e:
            raise GeneralError(str(e)) from e

    def set_config(self, f_number=None, iso=None, shutterspeed=None):
        try:
            res: requests.Response = requests.post(
                f"{self.url}/setconfig",
                json={"f-number": f_number, "iso": iso, "shutterspeed": shutterspeed},
            )  # type: ignore[index]
            if res.status_code == 200:
                self.on_connect()
                return {}

            self.logger.error("[Image] Unexpected status code, %s", res.status_code)
            raise InvalidStateError(f"Unexpected status code: {res.status_code}")

        except CONNECTION_EXCEPTIONS as e:
            self.connected = False
            self.logger.warning("[Image] Unable to connect to image server, %s", type(e).__name__)
            raise InvalidStateError("Unable to connect to image server") from e
        except Exception as e:
            raise GeneralError(str(e)) from e

    def get_img_count(self):
        try:
            res: requests.Response = requests.get(f"{self.url}/last_image")  # type: ignore[index]
            if res.status_code == 200:
                self.on_connect()
                return res.json()["result"]

            self.logger.error("[Image] Unexpected status code, %s", res.status_code)
            return False
        except CONNECTION_EXCEPTIONS as e:
            self.connected = False
            self.logger.warning("[Image] Unable to connect to image server, %s", type(e).__name__)
            return False
        except Exception as e:
            self.logger.error("[Image] %s", str(e))
            return False

    def retrieve_image(self, img_cnt):
        try:
            for i in range(self.img_count + 1, img_cnt + 1):
                self.logger.info("[Image] Retreiving image %s", i)
                try:
                    img_data = requests.get(self.url + f"/image_data/{i}")
                    if img_data.status_code != 200:
                        self.logger.error(
                            "[Image] Unexpected status code, %s", img_data.status_code
                        )
                        return False
                    self.on_connect()
                    self.img_count = i
                    if os.path.isfile(
                        os.path.join(os.getcwd(), "assets", "images", "odlc", f"{i}.png")
                    ):
                        self.save_image(i, None, img_data.json())
                        self.logger.info("[Image] Image %s already exists; data retrieved", i)
                    else:
                        img_res = requests.get(self.url + f"/image/{i}")
                        self.save_image(i, img_res.content, img_data.json())
                        self.logger.info("[Image] Image %s saved", i)
                except CONNECTION_EXCEPTIONS as e:
                    self.connected = False
                    self.logger.warning(
                        "[Image] Unable to connect to image server, %s", type(e).__name__
                    )
                    return False
        except Exception as e:
            self.logger.error("[Image] %s", str(e))
            return False

    def save_image(self, image_id, image, image_data):
        try:
            if image:
                with open(
                    os.path.join(os.getcwd(), "assets", "images", "odlc", f"{image_id}.png"), "wb"
                ) as file:
                    file.write(image)
            self.image_data[image_id] = image_data["result"]
        except Exception as e:
            self.logger.error("[Image] %s", str(e))

    def __repr__(self):
        return "Image Handler"
