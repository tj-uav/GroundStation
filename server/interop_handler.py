import json
import time
from datetime import datetime, timedelta, date

from google.protobuf import json_format

from auvsi_suas.client import client
from auvsi_suas.proto import interop_api_pb2 as interop

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


def json_serial(obj):
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    raise obj


class InteropHandler:
    def __init__(self, config):
        print("Created interop handler")
        self.config = config
        self.mission_id = self.config['interop']['mission_id']
        self.login_status = False
        self.client = None
        self.mission = self.teams = self.waypoints = self.search_grid = self.lost_comms_pos = \
            self.odlc_points = self.ugv_points = self.obstacles = None
        self.telemetry_json = {}
        self.odlc_queued_data = []
        self.odlc_submission_ids = []

    def initialize(self):
        self.mission = self.client.get_mission(self.mission_id)
        self.teams = self.client.get_teams()
        self.waypoints = self.mission.waypoints
        self.search_grid = self.mission.search_grid_points
        self.lost_comms_pos = self.mission.lost_comms_pos
        self.odlc_points = {
            "emergent": self.mission.emergent_last_known_pos,
            "off_axis": self.mission.off_axis_odlc_pos
        }
        self.ugv_points = {
            "drop": self.mission.air_drop_pos,
            "drop_boundary": self.mission.air_drop_boundary_points,
            "drive": self.mission.ugv_drive_pos
        }
        self.obstacles = self.mission.stationary_obstacles
        # print("Teams:\n", self.teams, "\nEND TEAMS")
        # print("Waypoints:\n", self.waypoints, "\nEND WAYPOINTS")
        # print("Search Grid:\n", self.search_grid, "\nEND SEARCH GRID")
        # print("Lost Comms Pos:\n", self.lost_comms_pos, "\nEND LOST COMMS POS")
        # print("ODLC Points:\n", self.odlc_points, "\nEND ODLC POINTS")
        # print("UGV Points:\n", self.ugv_points, "\nEND UGV POINTS")
        # print("Obstacles:\n", self.mission, "\nEND OBSTACLES")

    def login(self):
        if self.login_status:
            # No need to relogin
            return
        try:
            self.client = client.Client(url=self.config['interop']['url'],
                                        username=self.config['interop']['username'],
                                        password=self.config['interop']['password'])
            self.login_status = True
        except Exception as e:
            print(f"Interop login failed: {e}")
            self.login_status = False
            return
        self.initialize()

    def get_data(self, key):
        key_map = {
            "mission": self.mission,
            "waypoints": self.waypoints,
            "obstacles": self.obstacles,
            "teams": self.teams,
            "search": self.search_grid,
            "ugv": self.ugv_points,
            "odlc": self.odlc_points,
            "lost_comms": self.lost_comms_pos
        }
        if key in key_map:
            return key_map[key]
        return None

    def submit_telemetry(self, mav):
        while True:
            if self.client is None:
                self.login_status = False
                print("Interop connection lost")
                self.login()
            else:
                telemetry = interop.Telemetry()
                telemetry.latitude = mav.lat
                telemetry.longitude = mav.lon
                telemetry.altitude = mav.altitude
                telemetry.heading = mav.orientation['yaw']
                self.telemetry_json = json_format.MessageToJson(telemetry)
                self.client.post_telemetry(telemetry)
                # print("Posted telemetry" + self.telemetry_json)
            time.sleep(0.1)

    def odlc_get_queue(self, filter_val=3):
        if filter_val == 0:
            return [o for o in self.odlc_queued_data if o["status"] is None]
        if filter_val == 1:
            return [o for o in self.odlc_queued_data if o["status"]]
        if filter_val == 2:
            return [o for o in self.odlc_queued_data if o["status"] is False]
        return self.odlc_queued_data

    def odlc_add_to_queue(self, type_: str, lat: float, lon: float, orientation: int, shape: str,
                          shape_color: str, alpha: str, alpha_color: str, description=None):
        data_obj = {
            "created": datetime.now(),
            "auto_submit": datetime.now() + timedelta(minutes=5),
            "status": None,
            "type": ODLC_KEY["type"][type_],
            "latitude": lat,
            "longitude": lon,
            "orientation": ODLC_KEY["orientation"][orientation] if orientation in ODLC_KEY[
                "orientation"] else ODLC_KEY["orientation"][
                min(ODLC_KEY["orientation"].keys(), key=lambda k: abs(k - orientation))],
            "shape": ODLC_KEY["shape"][shape],
            "shape_color": ODLC_KEY["color"][shape_color],
            "alphanumeric": alpha,
            "alphanumeric_color": ODLC_KEY["color"][alpha_color],
            "description": description
        }
        self.odlc_queued_data.append(data_obj)
        return self.odlc_get_queue()

    def odlc_edit(self, id_, type_=None, lat=None, lon=None, orientation=None, shape=None, shape_color=None, alpha=None, alpha_color=None, description=None):
        fields = {
            "type": ODLC_KEY["type"][type_] if type_ else None,
            "latitude": lat,
            "longitude": lon,
            "orientation": None if orientation is None else (ODLC_KEY["orientation"][orientation] if orientation in ODLC_KEY[
                "orientation"] else ODLC_KEY["orientation"][
                min(ODLC_KEY["orientation"].keys(), key=lambda k: abs(k - orientation))]),
            "shape": ODLC_KEY["shape"][shape] if shape else None,
            "shape_color": ODLC_KEY["color"][shape_color] if shape_color else None,
            "alphanumeric": alpha,
            "alphanumeric_color": ODLC_KEY["color"][alpha_color] if alpha_color else None,
            "description": description
        }
        for name, var in fields.items():
            if var is not None:
                self.odlc_queued_data[id_][name] = var
        return {"result": "success"}

    def odlc_reject(self, id_):
        if len(self.odlc_queued_data) <= id_:
            return {"result": "failed: invalid id"}
        if self.odlc_queued_data[id_]["status"] is False:
            return {"result": "failed: already rejected"}
        self.odlc_queued_data[id_]["status"] = False
        return {"result": "success"}

    def odlc_submit(self, id_):
        if len(self.odlc_queued_data) <= id_:
            return {"result": "failed: invalid id"}
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
        return {"result": "success"}

    def odlc_save_queue(self, filename="odlc.json"):
        with open(filename, "w") as file:
            json.dump(self.odlc_queued_data, file, default=json_serial)
            return {"result": "success"}

    def odlc_load_queue(self, filename="odlc.json"):
        with open(filename, "r") as file:
            self.odlc_queued_data = json.load(file)
            for x, obj in enumerate(self.odlc_queued_data):
                obj["created"] = datetime.fromisoformat(obj["created"])
                obj["auto_submit"] = datetime.fromisoformat(obj["auto_submit"])
                self.odlc_queued_data[x] = obj
            return {"result": "success"}
