from __future__ import annotations
import base64
import json
import logging
import os
import typing
from datetime import datetime, timedelta, date

from auvsi_suas.proto import interop_api_pb2 as interop
from requests.exceptions import ConnectionError as RequestsCE  # type: ignore[import]

from utils.errors import (
    InvalidRequestError,
    InvalidStateError,
    GeneralError,
    ServiceUnavailableError,
)
from utils.decorators import decorate_all_functions, log

if typing.TYPE_CHECKING:
    from groundstation import GroundStation


def json_serial(obj):
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    raise obj


@decorate_all_functions(log, logging.getLogger("groundstation"))
class DummyInteropHandler:
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
        self.login_status = True
        (
            self.mission_dict,
            self.waypoints_dict,
            self.obstacles_dict,
            self.teams_dict,
            self.search_grid_dict,
            self.ugv_points,
            self.odlc_points,
            self.lost_comms_pos_dict,
            self.telemetry_json,
        ) = [{}] * 9
        self.odlc_queued_data = []
        self.odlc_submission_ids = []
        self.file_extension = "jpg" if self.config["uav"]["images"]["quality"] > 0 else "png"
        self.map_image = None
        self.submitted_map = None

    def initialize(self):
        try:
            self.mission_dict = {
                "id": 1,
                "lostCommsPos": {"latitude": 38.144778, "longitude": -76.429417},
                "flyZones": [
                    {
                        "altitudeMin": 100.0,
                        "altitudeMax": 750.0,
                        "boundaryPoints": [
                            {"latitude": 38.1462694444444, "longitude": -76.4281638888889},
                            {"latitude": 38.151625, "longitude": -76.4286833333333},
                            {"latitude": 38.1518888888889, "longitude": -76.4314666666667},
                            {"latitude": 38.1505944444444, "longitude": -76.4353611111111},
                            {"latitude": 38.1475666666667, "longitude": -76.4323416666667},
                            {"latitude": 38.1446666666667, "longitude": -76.4329472222222},
                            {"latitude": 38.1432555555556, "longitude": -76.4347666666667},
                            {"latitude": 38.1404638888889, "longitude": -76.4326361111111},
                            {"latitude": 38.1407194444444, "longitude": -76.4260138888889},
                            {"latitude": 38.1437611111111, "longitude": -76.4212055555556},
                            {"latitude": 38.1473472222222, "longitude": -76.4232111111111},
                            {"latitude": 38.1461305555556, "longitude": -76.4266527777778},
                        ],
                    }
                ],
                "waypoints": [
                    {
                        "latitude": 38.1446916666667,
                        "longitude": -76.4279944444445,
                        "altitude": 200.0,
                    },
                    {
                        "latitude": 38.1461944444444,
                        "longitude": -76.4237138888889,
                        "altitude": 300.0,
                    },
                    {"latitude": 38.1438972222222, "longitude": -76.42255, "altitude": 400.0},
                    {
                        "latitude": 38.1417722222222,
                        "longitude": -76.4251083333333,
                        "altitude": 400.0,
                    },
                    {"latitude": 38.14535, "longitude": -76.428675, "altitude": 300.0},
                    {
                        "latitude": 38.1508972222222,
                        "longitude": -76.4292972222222,
                        "altitude": 300.0,
                    },
                    {
                        "latitude": 38.1514944444444,
                        "longitude": -76.4313833333333,
                        "altitude": 300.0,
                    },
                    {"latitude": 38.1505333333333, "longitude": -76.434175, "altitude": 300.0},
                    {
                        "latitude": 38.1479472222222,
                        "longitude": -76.4316055555556,
                        "altitude": 200.0,
                    },
                    {
                        "latitude": 38.1443333333333,
                        "longitude": -76.4322888888889,
                        "altitude": 200.0,
                    },
                    {
                        "latitude": 38.1433166666667,
                        "longitude": -76.4337111111111,
                        "altitude": 300.0,
                    },
                    {
                        "latitude": 38.1410944444444,
                        "longitude": -76.4321555555556,
                        "altitude": 400.0,
                    },
                    {
                        "latitude": 38.1415777777778,
                        "longitude": -76.4252472222222,
                        "altitude": 400.0,
                    },
                    {
                        "latitude": 38.1446083333333,
                        "longitude": -76.4282527777778,
                        "altitude": 200.0,
                    },
                ],
                "searchGridPoints": [
                    {"latitude": 38.1444444444444, "longitude": -76.4280916666667},
                    {"latitude": 38.1459444444444, "longitude": -76.4237944444445},
                    {"latitude": 38.1439305555556, "longitude": -76.4227444444444},
                    {"latitude": 38.1417138888889, "longitude": -76.4253805555556},
                    {"latitude": 38.1412111111111, "longitude": -76.4322361111111},
                    {"latitude": 38.1431055555556, "longitude": -76.4335972222222},
                    {"latitude": 38.1441805555556, "longitude": -76.4320111111111},
                    {"latitude": 38.1452611111111, "longitude": -76.4289194444444},
                    {"latitude": 38.1444444444444, "longitude": -76.4280916666667},
                ],
                "offAxisOdlcPos": {"latitude": 38.146747, "longitude": -76.422131},
                "emergentLastKnownPos": {"latitude": 38.145111, "longitude": -76.427861},
                "airDropBoundaryPoints": [
                    {"latitude": 38.14616666666666, "longitude": -76.42666666666668},
                    {"latitude": 38.14636111111111, "longitude": -76.42616666666667},
                    {"latitude": 38.14558333333334, "longitude": -76.42608333333334},
                    {"latitude": 38.14541666666667, "longitude": -76.42661111111111},
                ],
                "airDropPos": {"latitude": 38.145848, "longitude": -76.426374},
                "ugvDrivePos": {"latitude": 38.146152, "longitude": -76.426396},
                "stationaryObstacles": [
                    {
                        "latitude": 38.146689,
                        "longitude": -76.426475,
                        "radius": 150.0,
                        "height": 750.0,
                    },
                    {
                        "latitude": 38.142914,
                        "longitude": -76.430297,
                        "radius": 300.0,
                        "height": 300.0,
                    },
                    {
                        "latitude": 38.149504,
                        "longitude": -76.43311,
                        "radius": 100.0,
                        "height": 750.0,
                    },
                    {
                        "latitude": 38.148711,
                        "longitude": -76.429061,
                        "radius": 300.0,
                        "height": 750.0,
                    },
                    {
                        "latitude": 38.144203,
                        "longitude": -76.426155,
                        "radius": 50.0,
                        "height": 400.0,
                    },
                    {
                        "latitude": 38.146003,
                        "longitude": -76.430733,
                        "radius": 225.0,
                        "height": 500.0,
                    },
                ],
                "mapCenterPos": {"latitude": 38.14468, "longitude": -76.428022},
                "mapHeight": 1200.0,
            }
            self.waypoints_dict = [
                {"latitude": 38.1446916666667, "longitude": -76.4279944444445, "altitude": 200.0},
                {"latitude": 38.1461944444444, "longitude": -76.4237138888889, "altitude": 300.0},
                {"latitude": 38.1438972222222, "longitude": -76.42255, "altitude": 400.0},
                {"latitude": 38.1417722222222, "longitude": -76.4251083333333, "altitude": 400.0},
                {"latitude": 38.14535, "longitude": -76.428675, "altitude": 300.0},
                {"latitude": 38.1508972222222, "longitude": -76.4292972222222, "altitude": 300.0},
                {"latitude": 38.1514944444444, "longitude": -76.4313833333333, "altitude": 300.0},
                {"latitude": 38.1505333333333, "longitude": -76.434175, "altitude": 300.0},
                {"latitude": 38.1479472222222, "longitude": -76.4316055555556, "altitude": 200.0},
                {"latitude": 38.1443333333333, "longitude": -76.4322888888889, "altitude": 200.0},
                {"latitude": 38.1433166666667, "longitude": -76.4337111111111, "altitude": 300.0},
                {"latitude": 38.1410944444444, "longitude": -76.4321555555556, "altitude": 400.0},
                {"latitude": 38.1415777777778, "longitude": -76.4252472222222, "altitude": 400.0},
                {"latitude": 38.1446083333333, "longitude": -76.4282527777778, "altitude": 200.0},
            ]
            self.obstacles_dict = [
                {"latitude": 38.146689, "longitude": -76.426475, "radius": 150.0, "height": 750.0},
                {"latitude": 38.142914, "longitude": -76.430297, "radius": 300.0, "height": 300.0},
                {"latitude": 38.149504, "longitude": -76.43311, "radius": 100.0, "height": 750.0},
                {"latitude": 38.148711, "longitude": -76.429061, "radius": 300.0, "height": 750.0},
                {"latitude": 38.144203, "longitude": -76.426155, "radius": 50.0, "height": 400.0},
                {"latitude": 38.146003, "longitude": -76.430733, "radius": 225.0, "height": 500.0},
            ]
            self.teams_dict = [
                {
                    "team": {"id": 2, "username": "testuser", "name": "", "university": ""},
                    "inAir": False,
                    "telemetry": {
                        "latitude": 54.6939479,
                        "longitude": -2.3977821,
                        "altitude": 472.5065768,
                        "heading": 252.97946661217355,
                    },
                    "telemetryId": "2821588",
                    "telemetryAgeSec": 506.303088,
                    "telemetryTimestamp": "2022-08-13T17:37:05.248478+00:00",
                }
            ]
            self.search_grid_dict = [
                {"latitude": 38.1444444444444, "longitude": -76.4280916666667},
                {"latitude": 38.1459444444444, "longitude": -76.4237944444445},
                {"latitude": 38.1439305555556, "longitude": -76.4227444444444},
                {"latitude": 38.1417138888889, "longitude": -76.4253805555556},
                {"latitude": 38.1412111111111, "longitude": -76.4322361111111},
                {"latitude": 38.1431055555556, "longitude": -76.4335972222222},
                {"latitude": 38.1441805555556, "longitude": -76.4320111111111},
                {"latitude": 38.1452611111111, "longitude": -76.4289194444444},
                {"latitude": 38.1444444444444, "longitude": -76.4280916666667},
            ]
            self.ugv_points = {
                "drop": {"latitude": 38.145848, "longitude": -76.426374},
                "drop_boundary": [
                    {"latitude": 38.14616666666666, "longitude": -76.42666666666668},
                    {"latitude": 38.14636111111111, "longitude": -76.42616666666667},
                    {"latitude": 38.14558333333334, "longitude": -76.42608333333334},
                    {"latitude": 38.14541666666667, "longitude": -76.42661111111111},
                ],
                "drive": {"latitude": 38.146152, "longitude": -76.426396},
            }
            self.odlc_points = {
                "emergent": {"latitude": 38.145111, "longitude": -76.427861},
                "off_axis": {"latitude": 38.146747, "longitude": -76.422131},
            }
            self.lost_comms_pos_dict = {"latitude": 38.144778, "longitude": -76.429417}
            print("╠ INITIALIZED INTEROP HANDLER")
            self.logger.info("INITIALIZED INTEROP HANDLER")
            return {}
        except RequestsCE as e:
            self.login()
            raise ServiceUnavailableError(
                "Interop connection lost, attempted to re-initiate"
            ) from e
        except Exception as e:
            raise GeneralError(str(e)) from e

    def login(self):
        try:
            self.initialize()
            return {}
        except InvalidStateError as e:
            raise InvalidStateError(str(e)) from e
        except RequestsCE as e:
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
        try:
            return {}
        except RequestsCE as e:
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
        image: bytes,
        type_: str,
        lat: float,
        lon: float,
        orientation: int = None,
        shape: str = None,
        shape_color: str = None,
        alpha: str = None,
        alpha_color: str = None,
        description: str = None,
    ):
        try:
            with open(
                f"assets/odlc_images/{len(self.odlc_queued_data)}.{self.file_extension}", "wb"
            ) as file:
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
                with open(f"assets/odlc_images/{id_}.{self.file_extension}", "wb") as file:
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
            if os.path.isfile(f"assets/map_images/{name}.{self.file_extension}"):
                raise InvalidStateError("Map with this name already exists")
            with open(f"assets/map_images/{name}.{self.file_extension}", "wb") as file:
                file.write(base64.decodebytes(bytes(image, "utf-8")))
            self.map_image = image
            return {}
        except InvalidStateError as e:
            raise InvalidStateError(str(e)) from e
        except Exception as e:
            raise GeneralError(str(e)) from e

    def map_submit(self, name=None):
        try:
            if name:
                if not os.path.isfile(f"assets/map_images/{name}.{self.file_extension}"):
                    raise InvalidStateError("Map not found")
            return {}
        except InvalidStateError as e:
            raise InvalidStateError(str(e)) from e
        except Exception as e:
            raise GeneralError(str(e)) from e

    def __repr__(self):
        return "Interop Handler"
