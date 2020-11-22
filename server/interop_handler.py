import json
import time
from auvsi_suas.client import client
from auvsi_suas.proto import interop_api_pb2

class InteropHandler:
    def __init__(self, mission_id):
        print("Created interop handler")
        self.mission_id = mission_id
        self.login_status = False
        self.client = None


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


    def login(self, url, username, password):
        if self.login_status:
            # No need to relogin
            return
        try:
            self.client = client.Client(url=url,
                        username=username,
                        password=password)
            self.login_status = True
        except Exception as e:
            print("Interop login failed: {}".format(str(e)))
            self.login_status = False
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
            lat = mav.lat
            lon = mav.lon
            time.sleep(0.1)


    def get_odlc_data(id):
        # TODO: Implement this
        return None


    def get_odlc_image(id):
        # TODO: Implement this
        return None


    def get_odlcs(self, odlc_id, dtype):
        ids = [odlc_id]
        if odlc_id == "all":
            ids = self.odlc_submission_ids
        else:
            assert(odlc_id in self.odlc_submission_ids)
        assert(dtype in ["data", "image", "all"])
        for id in ids:
            ret = {id: {}}
            if dtype == "data" or dtype == "all":
                ret[id]["data"] = self.get_odlc_data(id)
            elif dtype == "image" or dtype == "all":
                ret[id]["image"] = self.get_odlc_image(id)
        return ret
    
