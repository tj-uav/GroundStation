import json
import time
from auvsi_suas.client import client
from auvsi_suas.proto import interop_api_pb2
from google.protobuf import json_format

class InteropHandler:
    def __init__(self, config):
        print("Created interop handler")
        self.config = config
        self.mission_id = self.config['interop']['mission_id']
        self.login_status = False
        self.client = None
        self.telemetry_json = {}


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
            print("Interop login failed: {}".format(str(e)))
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
    
