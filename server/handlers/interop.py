from __future__ import annotations
import base64
import json
import logging
import os
import typing
from datetime import datetime, timedelta, date

from auvsi_suas.client import client
from auvsi_suas.proto import interop_api_pb2 as interop
from google.protobuf import json_format
from requests.exceptions import ConnectionError as RequestsCE

from errors import InvalidRequestError, InvalidStateError, GeneralError, ServiceUnavailableError
from handlers.utils import decorate_all_functions, log

if typing.TYPE_CHECKING:
    from groundstation import GroundStation


def json_serial(obj):
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    raise obj


@decorate_all_functions(log, logging.getLogger("groundstation"))
class InteropHandler:
    ODLC_KEY = {
        "type": {"standard": interop.Odlc.STANDARD, "emergent": interop.Odlc.EMERGENT},
        "shape": {
            "circle": interop.Odlc.CIRCLE,
            "semicircle": interop.Odlc.SEMICIRCLE,
            "quarter_circle": interop.Odlc.QUARTER_CIRCLE,
            "triangle": interop.Odlc.TRIANGLE,
            "square": interop.Odlc.SQUARE,
            "rectangle": interop.Odlc.RECTANGLE,
            "trapezoid": interop.Odlc.TRAPEZOID,
            "pentagon": interop.Odlc.PENTAGON,
            "hexagon": interop.Odlc.HEXAGON,
            "heptagon": interop.Odlc.HEPTAGON,
            "octagon": interop.Odlc.OCTAGON,
            "star": interop.Odlc.STAR,
            "cross": interop.Odlc.CROSS,
        },
        "color": {
            "white": interop.Odlc.WHITE,
            "gray": interop.Odlc.GRAY,
            "red": interop.Odlc.RED,
            "blue": interop.Odlc.BLUE,
            "green": interop.Odlc.GREEN,
            "yellow": interop.Odlc.YELLOW,
            "purple": interop.Odlc.PURPLE,
            "brown": interop.Odlc.BROWN,
            "orange": interop.Odlc.ORANGE,
        },
    }

    def __init__(self, gs, config):
        self.logger = logging.getLogger("groundstation")
        print("╠ CREATED INTEROP HANDLER")
        self.logger.info("CREATED INTEROP ERROR")
        self.gs: GroundStation = gs
        self.config = config
        self.mission_id = self.config["interop"]["mission_id"]
        self.login_status = False
        self.client = None
        self.mission = (
            self.teams
        ) = (
            self.waypoints
        ) = (
            self.search_grid
        ) = self.lost_comms_pos = self.odlc_points = self.ugv_points = self.obstacles = None
        self.mission_dict = (
            self.teams_dict
        ) = (
            self.waypoints_dict
        ) = self.search_grid_dict = self.lost_comms_pos_dict = self.obstacles_dict = None
        self.telemetry_json = {}
        self.odlc_queued_data = []
        self.odlc_submission_ids = []
        self.map_image = None
        self.submitted_map = None

    def initialize(self):
        try:
            self.mission = self.client.get_mission(self.mission_id)
            self.mission_dict = json_format.MessageToDict(self.mission)
            self.teams = self.client.get_teams()
            self.teams_dict = [json_format.MessageToDict(t) for t in self.teams]
            self.waypoints = self.mission.waypoints
            self.waypoints_dict = [json_format.MessageToDict(w) for w in self.waypoints]
            self.search_grid = self.mission.search_grid_points
            self.search_grid_dict = [json_format.MessageToDict(sg) for sg in self.search_grid]
            self.lost_comms_pos = self.mission.lost_comms_pos
            self.lost_comms_pos_dict = json_format.MessageToDict(self.lost_comms_pos)
            self.odlc_points = {
                "emergent": json_format.MessageToDict(self.mission.emergent_last_known_pos),
                "off_axis": json_format.MessageToDict(self.mission.off_axis_odlc_pos),
            }
            self.ugv_points = {
                "drop": json_format.MessageToDict(self.mission.air_drop_pos),
                "drop_boundary": [
                    json_format.MessageToDict(a) for a in self.mission.air_drop_boundary_points
                ],
                "drive": json_format.MessageToDict(self.mission.ugv_drive_pos),
            }
            self.obstacles = self.mission.stationary_obstacles
            self.obstacles_dict = [json_format.MessageToDict(o) for o in self.obstacles]
            print("╠ INITIALIZED INTEROP HANDLER")
            self.logger.info("INITIALIZED INTEROP HANDLER")
            return {}
        except RequestsCE as e:
            self.login_status = False
            self.login()
            raise ServiceUnavailableError(
                "Interop connection lost, attempted to re-initiate"
            ) from e
        except Exception as e:
            raise GeneralError(str(e)) from e

    def login(self):
        if self.login_status and self.client:
            raise InvalidStateError("Already Logged In")
        try:
            self.client: client.Client = client.Client(
                url=self.config["interop"]["url"],
                username=self.config["interop"]["username"],
                password=self.config["interop"]["password"],
            )
            self.login_status = True
            self.initialize()
            return {}
        except InvalidStateError as e:
            raise InvalidStateError(str(e)) from e
        except RequestsCE as e:
            self.login_status = False
            raise ServiceUnavailableError("Could not establish connection to Interop") from e
        except Exception as e:
            raise GeneralError(str(e)) from e

    def get_data(self, key="mission"):
        try:
            key_map = {
                "mission": self.mission_dict,
                "waypoints": self.waypoints_dict,
                "obstacles": self.obstacles_dict,
                "teams": self.teams_dict,
                "search": self.search_grid_dict,
                "ugv": self.ugv_points,
                "odlc": self.odlc_points,
                "lost_comms": self.lost_comms_pos_dict,
            }
            if key and key in key_map:
                return {"result": key_map[key]}
            return {"result": key_map["mission"]}
        except RequestsCE as e:
            self.login_status = False
            self.login()
            raise ServiceUnavailableError(
                "Interop connection lost, attempted to re-initiate"
            ) from e
        except Exception as e:
            raise GeneralError(str(e)) from e

    def get_telemetry(self):
        try:
            return {"result": self.telemetry_json}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def submit_telemetry(self):
        if self.client is None:
            self.login_status = False
            self.login()
            raise ServiceUnavailableError("Interop connection lost, attempted to re-initiate")
        try:
            telemetry = interop.Telemetry()
            uav_quick = self.gs.uav.quick()
            uav_quick = uav_quick["result"]
            telemetry.latitude = uav_quick["lat"]
            telemetry.longitude = uav_quick["lon"]
            telemetry.altitude = uav_quick["altitude"]
            telemetry.heading = uav_quick["orientation"]["yaw"]
            self.telemetry_json = json_format.MessageToDict(telemetry)
            self.client.post_telemetry(telemetry)
            return {}
        except RequestsCE as e:
            self.login_status = False
            self.login()
            raise ServiceUnavailableError(
                "Interop connection lost, attempted to re-initiate"
            ) from e
        except KeyError as e:
            raise ServiceUnavailableError("UAV Connection Lost") from e
        except Exception as e:
            raise GeneralError(str(e)) from e

    def odlc_get_queue(self, filter_val=3):
        try:
            if filter_val == 0:
                return {"result": [o for o in self.odlc_queued_data if o["status"] is None]}
            if filter_val == 1:
                return {"result": [o for o in self.odlc_queued_data if o["status"]]}
            if filter_val == 2:
                return {"result": [o for o in self.odlc_queued_data if o["status"] is False]}
            return {"result": self.odlc_queued_data}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def odlc_add_to_queue(
        self,
        image: bytes = None,
        type_: str = None,
        lat: float = None,
        lon: float = None,
        orientation: int = None,
        shape: str = None,
        shape_color: str = None,
        alpha: str = None,
        alpha_color: str = None,
        description: str = None,
    ):
        try:
            with open(f"assets/odlc_images/{len(self.odlc_queued_data)}.png", "wb") as file:
                file.write(image)
            base_obj = {
                "created": datetime.now(),
                "auto_submit": datetime.now() + timedelta(minutes=5),
                "status": None,
                "autonomous": True,
                "type": self.ODLC_KEY["type"][type_],
                "latitude": float(lat),
                "longitude": float(lon),
            }
            if type_ == "emergent":
                data_obj = {"description": description}
            else:
                data_obj = {
                    "orientation": int(orientation / 45) + 1,
                    "shape": self.ODLC_KEY["shape"][shape],
                    "shape_color": self.ODLC_KEY["color"][shape_color],
                    "alphanumeric": alpha,
                    "alphanumeric_color": self.ODLC_KEY["color"][alpha_color],
                }
            self.odlc_queued_data.append(
                {**base_obj, **data_obj}
            )  # Merges base data with type-specific data
            return {}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def odlc_edit(
        self,
        id_,
        image=None,
        type_=None,
        lat=None,
        lon=None,
        orientation=None,
        shape=None,
        shape_color=None,
        alpha=None,
        alpha_color=None,
        description=None,
    ):
        if len(self.odlc_queued_data) <= id_:
            raise InvalidStateError("Invalid ODLC ID")
        if not type_:
            raise InvalidRequestError("Missing required fields in request")
        try:
            if image:
                with open(f"assets/odlc_images/{id_}.png", "wb") as file:
                    file.write(base64.decodebytes(bytes(image, "utf-8")))
            old_obj = self.odlc_queued_data[id_]
            old_obj["type"] = int(type_) if type_ else old_obj["type"]
            old_obj["autonomous"] = False
            old_obj["latitude"] = float(lat) if lat else old_obj["latitude"]
            old_obj["longitude"] = float(lon) if lon else old_obj["longitude"]
            if old_obj["type"] == interop.Odlc.EMERGENT:
                old_obj["description"] = description if description else old_obj["description"]
            else:
                old_obj["orientation"] = (
                    int(orientation) if orientation else old_obj["orientation"]
                )
                old_obj["shape"] = int(shape) if shape else old_obj["shape"]
                old_obj["shape_color"] = (
                    int(shape_color) if shape_color else old_obj["shape_color"]
                )
                old_obj["alphanumeric"] = alpha if alpha else old_obj["alphanumeric"]
                old_obj["alphanumeric_color"] = (
                    int(alpha_color) if alpha_color else old_obj["alphanumeric_color"]
                )
            self.odlc_queued_data[id_] = old_obj
            return {}
        except InvalidStateError as e:
            raise InvalidStateError(str(e)) from e
        except Exception as e:
            raise GeneralError(str(e)) from e

    def odlc_reject(self, id_):
        try:
            if len(self.odlc_queued_data) <= id_:
                raise InvalidStateError("Invalid ODLC ID")
            if self.odlc_queued_data[id_]["status"] is False:
                raise InvalidStateError("ODLC Already Rejected")
            self.odlc_queued_data[id_]["status"] = False
            return {}
        except InvalidStateError as e:
            raise InvalidStateError(str(e)) from e
        except Exception as e:
            raise GeneralError(str(e)) from e

    def odlc_submit(self, id_, status):
        try:
            if len(self.odlc_queued_data) <= id_:
                raise InvalidStateError("Invalid ODLC ID")
            if self.odlc_queued_data[id_]["status"] is True:
                raise InvalidStateError("ODLC Already Submitted")
            obj_data = self.odlc_queued_data[id_]
            with open(f"assets/odlc_images/{id_}.png", "rb") as image:
                image_data = image.read()
            submission = interop.Odlc()
            submission.mission = self.mission_id
            submission.type = obj_data["type"]
            submission.latitude = obj_data["latitude"]
            submission.longitude = obj_data["longitude"]
            if obj_data["type"] == interop.Odlc.STANDARD:
                submission.orientation = obj_data["orientation"]
                submission.shape = obj_data["shape"]
                submission.shape_color = obj_data["shape_color"]
                submission.alphanumeric = obj_data["alphanumeric"]
                submission.alphanumeric_color = obj_data["alphanumeric_color"]
            else:
                submission.description = obj_data["description"]
            odlc = self.client.post_odlc(submission)
            self.client.put_odlc_image(odlc.id, image_data)
            self.odlc_queued_data[id_]["status"] = status
            return {}
        except InvalidStateError as e:
            raise InvalidStateError(str(e)) from e
        except Exception as e:
            raise GeneralError(str(e)) from e

    def odlc_save_queue(self, filename="odlc"):
        try:
            with open(filename + ".json", "w", encoding="utf-8") as file:
                json.dump(self.odlc_queued_data, file, default=json_serial)
                return {}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def odlc_load_queue(self, filename="odlc"):
        try:
            with open(filename + ".json", "r", encoding="utf-8") as file:
                self.odlc_queued_data = json.load(file)
                for x, obj in enumerate(self.odlc_queued_data):
                    obj["created"] = datetime.fromisoformat(obj["created"])
                    obj["auto_submit"] = datetime.fromisoformat(obj["auto_submit"])
                    self.odlc_queued_data[x] = obj
                return {}
        except FileNotFoundError as e:
            raise InvalidStateError("ODLC File Does Not Exist") from e
        except Exception as e:
            raise GeneralError(str(e)) from e

    def map_add(self, name: str, image: str):
        try:
            if os.path.isfile(f"assets/map_images/{name}.png"):
                raise InvalidStateError("Map with this name already exists")
            with open(f"assets/map_images/{name}.png", "wb") as file:
                file.write(base64.decodebytes(bytes(image, "utf-8")))
            self.map_image = image
            return {}
        except InvalidStateError as e:
            raise InvalidStateError(str(e)) from e
        except Exception as e:
            raise GeneralError(str(e)) from e

    def map_submit(self, name=None):
        try:
            if not name:
                self.submitted_map = base64.decodebytes(bytes(self.map_image, "utf-8"))
                self.client.put_map_image(self.mission_id, self.submitted_map)
            else:
                if not os.path.isfile(f"assets/map_images/{name}.png"):
                    raise InvalidStateError("Map not found")
                with open(f"assets/map_images/{name}.png", "rb") as file:
                    self.submitted_map = file.read()
                    self.client.put_map_image(self.mission_id, self.submitted_map)
            return {}
        except InvalidStateError as e:
            raise InvalidStateError(str(e)) from e
        except Exception as e:
            raise GeneralError(str(e)) from e

    def __repr__(self):
        return "Interop Handler"
