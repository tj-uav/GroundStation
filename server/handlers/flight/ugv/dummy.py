import json
import logging
import math
import random

from dronekit import Command
from pymavlink import mavutil

from errors import GeneralError, ServiceUnavailableError, InvalidRequestError

COMMANDS = {
    "TAKEOFF": mavutil.mavlink.MAV_CMD_NAV_TAKEOFF,
    "WAYPOINT": mavutil.mavlink.MAV_CMD_NAV_WAYPOINT,
    "LAND": mavutil.mavlink.MAV_CMD_NAV_LAND,
    "GEOFENCE": mavutil.mavlink.MAV_CMD_NAV_FENCE_POLYGON_VERTEX_INCLUSION
}


class DummyUGVHandler:
    def __init__(self, gs, config):
        self.logger = logging.getLogger("main")
        self.gs = gs
        self.config = config
        self.port = self.config["ugv"]["telemetry"]["port"]
        self.serial = self.config["ugv"]["telemetry"]["serial"]
        self.update_thread = None
        self.current_state = self.next_objective = self.yaw = self.ground_speed = \
            self.connection = self.droppos = self.lat = self.lon = self.dist_to_dest = \
            self.mode = self.gps = None
        with open("handlers/flight/ugv/ugv_params.json", "r") as file:
            self.params = json.load(file)
        self.mode = "AUTO"
        self.states = ["On Plane", "Drop to Ground", "Reach Destination", "Terminated"]
        self.commands = []
        self.armed = False
        print("╠ CREATED DUMMY UGV HANDLER")
        self.logger.info("CREATED DUMMY UGV HANDLER")

    def connect(self):
        print("╠ INITIALIZED DUMMY UGV HANDLER")
        self.logger.info("INITIALIZED DUMMY UGV HANDLER")
        self.update()
        return {}

    def update(self):
        try:
            self.current_state = random.choice(self.states)
            self.next_objective = self.states[((self.states.index(self.current_state)) + 1) % len(self.states)]
            self.yaw = random.randint(0, 360)
            self.ground_speed = random.random() * 30 + 45
            self.connection = [random.random(), random.random(), random.random() * 100]
            # simulates the plane flying over waypoints
            if not self.droppos:
                self.droppos = self.gs.call("i_data", "ugv")
                self.droppos = self.droppos["result"]
            self.lat = self.droppos["drop"]["latitude"] + (random.random() - 0.5) / 2000
            self.lon = self.droppos["drop"]["longitude"] + (random.random() - 0.5) / 2000
            x_dist = self.droppos["drop"]["latitude"] - self.lat
            y_dist = self.droppos["drop"]["longitude"] - self.lon
            angle = math.atan2(y_dist, x_dist)
            x_dist_ft = x_dist * (math.cos(self.lat * math.pi / 180) * 69.172) * 5280
            y_dist_ft = y_dist * 69.172 * 5280
            self.dist_to_dest = math.sqrt(x_dist_ft ** 2 + y_dist_ft ** 2)
            self.yaw = int((angle / (2 * math.pi) * 360) if angle >= 0 else (
                        angle / (2 * math.pi) * 360 + 360))
            return {}
        except KeyError as e:
            raise ServiceUnavailableError("Interop Connection Lost") from e
        except Exception as e:
            raise GeneralError(str(e)) from e

    def quick(self):
        return {"result": {
            "states": [self.current_state, self.next_objective, self.dist_to_dest],
            "yaw": self.yaw,
            "lat": self.lat,
            "lon": self.lon,
            "ground_speed": self.ground_speed,
            "connection": self.connection
        }}

    def stats(self):
        return {"result": {
            "quick": self.quick(),
            "flightmode": self.mode,
            "commands": [cmd.to_dict() for cmd in self.commands],
            "armed": self.armed
        }}

    def set_flight_mode(self, flightmode):
        self.mode = flightmode
        return {}

    def get_flight_mode(self):
        return {"result": self.mode}

    def get_param(self, key):
        return {"result": self.params[key]}

    def get_params(self):
        return {"result": self.params}

    def set_param(self, key, value):
        try:
            print(float(value))
        except ValueError as e:
            raise InvalidRequestError("Parameter Value cannot be converted to float") from e
        try:
            self.params[key] = value
            return {}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def set_params(self, **kwargs):
        try:
            new_params = dict(self.params.items())
            for key, value in kwargs.items():
                try:
                    float(value)
                except ValueError as e:
                    raise InvalidRequestError("Parameter Value cannot be converted to float") from e
                new_params[key] = float(value)
            self.params = new_params
            return {}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def save_params(self):
        try:
            with open("handlers/flight/ugv/ugv_params.json", "w") as file:
                json.dump(self.params, file)
            return {}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def load_params(self):
        try:
            with open("handlers/flight/ugv/ugv_params.json", "r") as file:
                self.params = json.load(file)
            return {}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def get_commands(self):
        try:
            commands = self.commands
            return {"result": [cmd.to_dict() for cmd in commands]}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def insert_command(self, command, lat, lon, alt):
        if command not in COMMANDS:
            raise InvalidRequestError("Invalid Command Name")
        try:
            new_cmd = Command(0, 0, 0, mavutil.mavlink.MAV_FRAME_GLOBAL_RELATIVE_ALT,
                              COMMANDS[command], 0, 0, 0, 0, 0, 0, lat, lon, alt)
            self.commands.append(new_cmd)
            return {}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def clear_mission(self):
        self.commands = []
        return {}

    def get_armed(self):
        return {"result": self.armed}

    def arm(self):
        self.armed = True  # Motors can be started
        return {}

    def disarm(self):
        self.armed = False
        return {}
