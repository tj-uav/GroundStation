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


class DummyUAVHandler:
    def __init__(self, gs, config):
        self.logger = logging.getLogger("main")
        self.gs = gs
        self.config = config
        self.port = self.config["uav"]["telemetry"]["port"]
        self.serial = self.config["uav"]["telemetry"]["serial"]
        self.update_thread = None
        self.altitude = self.orientation = self.ground_speed = self.air_speed = self.dist_to_wp = \
            self.voltage = self.battery_level = self.throttle = self.lat = self.lon = \
            self.mode = self.waypoints = self.waypoint_index = None
        with open("params.json", "r") as file:
            self.params = json.load(file)
        self.mode = "AUTO"
        self.commands = []
        self.armed = False
        print("╠ CREATED DUMMY UAV HANDLER")
        self.logger.info("CREATED DUMMY UAV HANDLER")

    def connect(self):
        print("╠ INITIALIZED DUMMY UAV HANDLER")
        self.logger.info("INITIALIZED DUMMY UAV HANDLER")
        self.update()
        return {}

    def update(self):
        try:
            self.altitude = random.random() * 250 + 150
            self.orientation = {
                "yaw": random.randint(0, 360),
                "roll": random.randint(-30, 30),
                "pitch": random.randint(-20, 20)
            }
            self.ground_speed = random.random() * 30 + 45
            self.air_speed = random.random() * 30 + 45
            self.dist_to_wp = random.random() * 100
            self.voltage = random.random() * 2 + 14
            self.battery_level = random.randint(0, 100)
            self.throttle = random.randint(60, 80)
            # simulates the plane flying over waypoints
            if not self.waypoints:
                self.waypoints = self.gs.call("i_data", "waypoints")
                self.waypoints = self.waypoints["result"]
                self.waypoint_index = 1 % len(self.waypoints)
                self.lat = self.waypoints[self.waypoint_index]["latitude"]
                self.lon = self.waypoints[self.waypoint_index]["longitude"]
            speed = 0.0001
            x_dist = self.waypoints[self.waypoint_index]["latitude"] - self.lat
            y_dist = self.waypoints[self.waypoint_index]["longitude"] - self.lon
            dist = math.sqrt(x_dist ** 2 + y_dist ** 2)
            angle = math.atan2(y_dist, x_dist)
            if dist <= 0.0001:
                self.lat = self.waypoints[self.waypoint_index]["latitude"]
                self.lon = self.waypoints[self.waypoint_index]["longitude"]
                self.waypoint_index = (self.waypoint_index + 1) % len(self.waypoints)
            else:
                self.lat = (self.lat + math.cos(angle) * speed)
                self.lon = (self.lon + math.sin(angle) * speed)
            self.orientation = {
                'yaw': int((angle / (2 * math.pi) * 360) if angle >= 0 else (
                            angle / (2 * math.pi) * 360 + 360)),
                'roll': random.randint(-30, 30),
                'pitch': random.randint(-20, 20)
            }
            return {}
        except KeyError as e:
            raise ServiceUnavailableError("Interop Connection Lost") from e
        except Exception as e:
            raise GeneralError(str(e)) from e

    def quick(self):
        return {"result": {
            "altitude": self.altitude,
            "orientation": self.orientation,
            "ground_speed": self.ground_speed,
            "air_speed": self.air_speed,
            "dist_to_wp": self.dist_to_wp,
            "voltage": self.voltage,
            "throttle": self.throttle,
            "lat": self.lat,
            "lon": self.lon
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
            with open("params.json", "w") as file:
                json.dump(self.params, file)
            return {}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def load_params(self):
        try:
            with open("params.json", "r") as file:
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
        if command not in COMMANDS.keys():
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
