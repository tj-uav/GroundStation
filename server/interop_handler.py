import time

from google.protobuf import json_format

from auvsi_suas.client import client
from auvsi_suas.proto import interop_api_pb2


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
                telemetry = interop_api_pb2.Telemetry()
                telemetry.latitude = mav.lat
                telemetry.longitude = mav.lon
                telemetry.altitude = mav.altitude
                telemetry.heading = mav.orientation['yaw']
                self.telemetry_json = json_format.MessageToJson(telemetry)
                self.client.post_telemetry(telemetry)
                # print("Posted telemetry" + self.telemetry_json)
            time.sleep(0.1)

    def get_odlc_data(self, id_):
        # TODO: Implement this
        return None

    def get_odlc_image(self, id_):
        # TODO: Implement this
        return None

    def get_odlcs(self, odlc_id, dtype):
        ids = [odlc_id]
        if odlc_id == "all":
            ids = self.odlc_submission_ids
        else:
            assert odlc_id in self.odlc_submission_ids
        assert (dtype in ["data", "image", "all"])
        ret = {}
        for id_ in ids:
            if dtype in ["data", "all"]:
                ret[id_]["data"] = self.get_odlc_data(id_)
            if dtype in ["image", "all"]:
                ret[id_]["image"] = self.get_odlc_image(id_)
        return ret
