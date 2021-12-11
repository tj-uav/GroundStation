import base64
import json
import os
import sys
from datetime import datetime, timedelta, date

from google.protobuf import json_format
from requests.exceptions import ConnectionError as RequestsCE

from auvsi_suas.client import client
from auvsi_suas.proto import interop_api_pb2 as interop


def json_serial(obj):
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    raise obj


class InteropHandler:
    ODLC_KEY = {
        "type": {
            "standard": interop.Odlc.STANDARD,
            "emergent": interop.Odlc.EMERGENT
        },
        "orientation": {
            0: interop.Odlc.N,
            45: interop.Odlc.NE,
            90: interop.Odlc.E,
            135: interop.Odlc.SE,
            180: interop.Odlc.S,
            225: interop.Odlc.SW,
            270: interop.Odlc.W,
            315: interop.Odlc.NW,
        },
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
            "cross": interop.Odlc.CROSS
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
        }
    }

    def __init__(self, gs, config):
        print("Created interop handler")
        self.gs = gs
        self.config = config
        self.mission_id = self.config["interop"]["mission_id"]
        self.login_status = False
        self.client = None
        self.mission = self.teams = self.waypoints = self.search_grid = \
            self.lost_comms_pos = self.odlc_points = self.ugv_points = self.obstacles = None
        self.mission_dict = self.teams_dict = self.waypoints_dict = self.search_grid_dict = \
            self.lost_comms_pos_dict = self.obstacles_dict = None
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
                "off_axis": json_format.MessageToDict(self.mission.off_axis_odlc_pos)
            }
            self.ugv_points = {
                "drop": json_format.MessageToDict(self.mission.air_drop_pos),
                "drop_boundary": [json_format.MessageToDict(a) for a in self.mission.air_drop_boundary_points],
                "drive": json_format.MessageToDict(self.mission.ugv_drive_pos)
            }
            self.obstacles = self.mission.stationary_obstacles
            self.obstacles_dict = [json_format.MessageToDict(o) for o in self.obstacles]
            print("INITIALIZED INTEROP HANDLER")
            return {}, 201
        except RequestsCE:
            self.login_status = False
            self.login()
            return {"result": "Interop connection lost, attempted to re-initiate"}, 503
        except Exception as e:
            print(e)
            return {"result": str(e)}, 500

    def login(self):
        if self.login_status and self.client:
            return {"result": "Already logged in"}, 409
        try:
            self.client = client.Client(url=self.config["interop"]["url"],
                                        username=self.config["interop"]["username"],
                                        password=self.config["interop"]["password"])
            self.login_status = True
            self.initialize()
            return {}, 201
        except RequestsCE:
            self.login_status = False
            return {"result": "Could not establish connection to Interop"}, 503
        except Exception as e:
            return {"result": str(sys.exc_info()[2].tb_lineno) + ": " + str(e)}, 500

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
                "lost_comms": self.lost_comms_pos_dict
            }
            if key and key in key_map:
                return {"result": key_map[key]}, 200
            return {"result": key_map["mission"]}, 200
        except RequestsCE:
            self.login_status = False
            self.login()
            return {"result": "Interop connection lost, attempted to re-initiate"}, 503
        except Exception as e:
            return {"result": str(e)}, 500

    def get_telemetry(self):
        try:
            return {"result": self.telemetry_json}, 200
        except Exception as e:
            return {"result": str(e)}, 500

    def submit_telemetry(self):
        if self.client is None:
            self.login_status = False
            self.login()
            return {"result": "Interop connection lost, attempted to re-initiate"}, 503
        else:
            try:
                telemetry = interop.Telemetry()
                uav_quick = self.gs.call("m_quick")
                if uav_quick[1] >= 400:
                    return {"result": "Could not retreive data from Interop"}, 503
                uav_quick = uav_quick[0]["result"]
                telemetry.latitude = uav_quick["lat"]
                telemetry.longitude = uav_quick["lon"]
                telemetry.altitude = uav_quick["altitude"]
                telemetry.heading = uav_quick["orientation"]["yaw"]
                self.telemetry_json = json_format.MessageToDict(telemetry)
                self.client.post_telemetry(telemetry)
                return {}, 201
            except RequestsCE:
                self.login_status = False
                self.login()
                return {"result": "Interop connection lost, attempted to re-initiate"}, 503
            except KeyError:
                return {"result": "UAV connection lost"}, 503
            except Exception as e:
                return {"result": "Line " + str(sys.exc_info()[2].tb_lineno) + ": " + str(e)}, 500

    def odlc_get_queue(self, filter_val=3):
        try:
            if filter_val == 0:
                return {"result": [o for o in self.odlc_queued_data if o["status"] is None]}, 200
            if filter_val == 1:
                return {"result": [o for o in self.odlc_queued_data if o["status"]]}, 200
            if filter_val == 2:
                return {"result": [o for o in self.odlc_queued_data if o["status"] is False]}, 200
            return {"result": self.odlc_queued_data}, 200
        except Exception as e:
            return {"result": str(e)}, 500

    def odlc_add_to_queue(self, image: str, type_: str, lat: float, lon: float, orientation: int, shape: str,
                          shape_color: str, alpha: str, alpha_color: str, description=None):
        try:
            with open(f"assets/odlc_images/{len(self.odlc_queued_data)}.jpg", "wb") as file:
                file.write(base64.decodebytes(bytes(image, 'utf-8')))
            data_obj = {
                "created": datetime.now(),
                "auto_submit": datetime.now() + timedelta(minutes=5),
                "status": None,
                "type": self.ODLC_KEY["type"][type_],
                "latitude": lat,
                "longitude": lon,
                "orientation": self.ODLC_KEY["orientation"][orientation] if orientation in self.ODLC_KEY[
                    "orientation"] else self.ODLC_KEY["orientation"][
                    min(self.ODLC_KEY["orientation"].keys(), key=lambda k: abs(k - orientation))],
                "shape": self.ODLC_KEY["shape"][shape],
                "shape_color": self.ODLC_KEY["color"][shape_color],
                "alphanumeric": alpha,
                "alphanumeric_color": self.ODLC_KEY["color"][alpha_color],
                "description": description
            }
            self.odlc_queued_data.append(data_obj)
            return {}, 201
        except Exception as e:
            return {"result": str(e)}, 500

    def odlc_edit(self, id_, image=None, type_=None, lat=None, lon=None, orientation=None, shape=None, shape_color=None, alpha=None, alpha_color=None, description=None):
        if len(self.odlc_queued_data) <= id_:
            return {"result": "Invalid ID"}, 409
        try:
            if image:
                with open(f"assets/odlc_images/{id_}.jpg", "wb") as file:
                    file.write(base64.decodebytes(bytes(image, 'utf-8')))
            fields = {
                "type": self.ODLC_KEY["type"][type_] if type_ else None,
                "latitude": lat,
                "longitude": lon,
                "orientation": None if orientation is None else (self.ODLC_KEY["orientation"][orientation] if orientation in self.ODLC_KEY[
                    "orientation"] else self.ODLC_KEY["orientation"][
                    min(self.ODLC_KEY["orientation"].keys(), key=lambda k: abs(k - orientation))]),
                "shape": self.ODLC_KEY["shape"][shape] if shape else None,
                "shape_color": self.ODLC_KEY["color"][shape_color] if shape_color else None,
                "alphanumeric": alpha,
                "alphanumeric_color": self.ODLC_KEY["color"][alpha_color] if alpha_color else None,
                "description": description
            }
            for name, var in fields.items():
                if var is not None:
                    self.odlc_queued_data[id_][name] = var
            return {}, 201
        except Exception as e:
            return {"result": str(e)}, 500

    def odlc_reject(self, id_):
        try:
            if len(self.odlc_queued_data) <= id_:
                return {"result": "Invalid ID"}, 409
            if self.odlc_queued_data[id_]["status"] is False:
                return {"result": "Already Rejected"}, 409
            self.odlc_queued_data[id_]["status"] = False
            return {}, 201
        except Exception as e:
            return {"result": str(e)}, 500

    def odlc_submit(self, id_):
        try:
            if len(self.odlc_queued_data) <= id_:
                return {"result": "Invalid ID"}, 409
            if self.odlc_queued_data[id_]["status"] is True:
                return {"result": "Already Submitted"}, 409
            obj_data = self.odlc_queued_data[id_]
            with open(f"assets/odlc_images/{id_}.jpg", "rb") as image:
                image_data = image.read()
            submission = interop.Odlc()
            submission.mission = self.mission_id
            submission.type = obj_data["type"]
            submission.latitude = obj_data["latitude"]
            submission.longitude = obj_data["longitude"]
            submission.orientation = obj_data["orientation"]
            submission.shape = obj_data["shape"]
            submission.shape_color = obj_data["shape_color"]
            submission.alphanumeric = obj_data["alphanumeric"]
            submission.alphanumeric_color = obj_data["alphanumeric_color"]
            odlc = self.client.post_odlc(submission)
            self.client.put_odlc_image(odlc.id, image_data)
            self.odlc_queued_data[id_]["status"] = True
            return {}, 201
        except Exception as e:
            return {"result": str(e)}, 500

    def odlc_save_queue(self, filename="odlc"):
        try:
            with open(filename + ".json", "w") as file:
                json.dump(self.odlc_queued_data, file, default=json_serial)
                return {}, 201
        except Exception as e:
            return {"result": str(e)}, 500

    def odlc_load_queue(self, filename="odlc"):
        try:
            with open(filename + ".json", "r") as file:
                self.odlc_queued_data = json.load(file)
                for x, obj in enumerate(self.odlc_queued_data):
                    obj["created"] = datetime.fromisoformat(obj["created"])
                    obj["auto_submit"] = datetime.fromisoformat(obj["auto_submit"])
                    self.odlc_queued_data[x] = obj
                return {}, 201
        except FileNotFoundError:
            return {"result": "File does not exist"}, 409
        except Exception as e:
            return {"result": str(e)}, 500

    def map_add(self, name: str, image: str):
        try:
            if os.path.isfile(f"assets/map_images/{name}.jpg"):
                return {"result": "Map with this name already exists"}, 409
            with open(f"assets/map_images/{name}.jpg", "wb") as file:
                file.write(base64.decodebytes(bytes(image, 'utf-8')))
            self.map_image = image
            return {}, 201
        except Exception as e:
            return {"result": str(e)}, 500

    def map_submit(self, name=None):
        try:
            if not os.path.isfile(f"assets/map_images/{name}.jpg"):
                return {"result": "Map not found"}, 409
            if not name:
                self.submitted_map = base64.decodebytes(bytes(self.map_image, 'utf-8'))
                self.client.put_map_image(self.mission_id, self.submitted_map)
            else:
                with open(f"assets/map_images/{name}.jpg", "rb") as file:
                    self.submitted_map = file.read()
                    self.client.put_map_image(self.mission_id, self.submitted_map)
            return {}, 201
        except Exception as e:
            return {"result": str(e)}, 500
