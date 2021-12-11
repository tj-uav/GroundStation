import json
import math
import random

from dronekit import Command
from pymavlink import mavutil

COMMANDS = {
    "TAKEOFF": mavutil.mavlink.MAV_CMD_NAV_TAKEOFF,
    "WAYPOINT": mavutil.mavlink.MAV_CMD_NAV_WAYPOINT,
    "LAND": mavutil.mavlink.MAV_CMD_NAV_LAND,
    "GEOFENCE": mavutil.mavlink.MAV_CMD_NAV_FENCE_POLYGON_VERTEX_INCLUSION
}


class DummyUAVHandler:
    def __init__(self, gs, config, socketio):
        self.gs = gs
        self.config = config
        self.port = self.config["uav"]["port"]
        self.serial = self.config["uav"]["serial"]
        self.socketio = socketio
        self.update_thread = None
        self.altitude = self.orientation = self.ground_speed = self.air_speed = self.dist_to_wp = \
            self.voltage = self.battery_level = self.throttle = self.lat = self.lon = \
            self.mode = self.waypoints = self.waypoint_index = None
        with open("params.json", "r") as file:
            self.params = json.load(file)
        self.mode = "AUTO"
        self.commands = []
        self.armed = False

    def connect(self):
        print("CREATED DUMMY UAV HANDLER")
        return {}, 201

    def update(self):
        try:
            self.altitude = random.random() * 100
            self.orientation = {
                "yaw": random.randint(0, 360),
                "roll": random.randint(0, 360),
                "pitch": random.randint(0, 360)
            }
            self.ground_speed = random.random() * 100
            self.air_speed = random.random() * 100
            self.dist_to_wp = random.random() * 100
            self.voltage = random.random() * 16
            self.battery_level = random.randint(0, 100)
            self.throttle = random.randint(0, 100)
            # simulates the plane flying over waypoints
            if not self.waypoints:
                self.waypoints = self.gs.call("i_data", "waypoints")
                if self.waypoints[1] >= 400:
                    return {"result": "Could not retreive data from Interop"}, 503
                self.waypoints = self.waypoints[0]["result"]
                self.waypoint_index = 1 % len(self.waypoints)
                self.lat = self.waypoints[0]["latitude"]
                self.lon = self.waypoints[0]["longitude"]
            speed = 0.0001
            x_dist = self.waypoints[self.waypoint_index]["latitude"]-self.lat
            y_dist = self.waypoints[self.waypoint_index]["longitude"]-self.lon
            dist = math.sqrt((x_dist) ** 2 + (y_dist) ** 2)
            angle = math.atan2(y_dist, x_dist)
            if dist <= 0.0001:
                self.lat = self.waypoints[self.waypoint_index]["latitude"]
                self.lon = self.waypoints[self.waypoint_index]["longitude"]
                self.waypoint_index = (self.waypoint_index+1) % len(self.waypoints)
            else:
                self.lat = (self.lat + math.cos(angle) * speed)
                self.lon = (self.lon + math.sin(angle) * speed)
            self.orientation = {
                'yaw': int((angle/(2*math.pi) * 360) if angle >= 0 else (angle/(2*math.pi)*360 + 360)),
                'roll': random.randint(0, 360),
                'pitch': random.randint(0, 360)
            }
            return {}, 201
        except Exception as e:
            return {"result": str(e)}, 500

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
        }}, 200

    def stats(self):
        return {"result": {
            "quick": self.quick(),
            "flightmode": self.mode,
            "commands": [cmd.to_dict() for cmd in self.commands],
            "armed": self.armed
        }}, 200

    def set_flight_mode(self, flightmode):
        self.mode = flightmode
        return {}, 201

    def get_flight_mode(self):
        return {"result": self.mode}, 200

    def get_param(self, key):
        return {"result": self.params[key]}, 200

    def get_params(self):
        return {"result": self.params}, 200

    def set_param(self, key, value):
        try:
            print(float(value))
        except ValueError:
            return {"result": "Invalid parameter value"}, 400
        try:
            with open("params.json", "r") as file:
                params = json.load(file)
            params[key] = value
            with open("params.json", "w") as file:
                json.dump(self.params, file)
            self.load_params()
            self.params[key] = value
            return {}, 201
        except Exception as e:
            return {"result": str(e)}, 500

    def set_params(self, **kwargs):
        try:
            new_params = dict(self.params.items())
            for key, value in kwargs.items():
                try:
                    float(value)
                except ValueError:
                    return {"result": "Invalid parameter value"}, 400
                new_params[key] = value
            self.params = new_params
            return {}, 201
        except Exception as e:
            return {"result": str(e)}, 500

    def save_params(self):
        try:
            with open("params.json", "w") as file:
                json.dump(self.params, file)
            return {}, 201
        except Exception as e:
            return {"result": str(e)}, 500

    def load_params(self):
        try:
            with open("params.json", "r") as file:
                self.params = json.load(file)
            return {}, 201
        except Exception as e:
            return {"result": str(e)}, 500

    def get_commands(self):
        try:
            commands = self.commands
            return {"result": [cmd.to_dict() for cmd in commands]}, 201
        except Exception as e:
            return {"result": str(e)}, 500

    def insert_command(self, command, lat, lon, alt):
        try:
            if command not in COMMANDS:
                return {"result": "Command not found"}
            new_cmd = Command(0, 0, 0, mavutil.mavlink.MAV_FRAME_GLOBAL_RELATIVE_ALT,
                              COMMANDS[command], 0, 0, 0, 0, 0, 0, lat, lon, alt)
            self.commands.append(new_cmd)
            return {}, 201
        except Exception as e:
            return {"result": str(e)}, 500

    def clear_mission(self):
        self.commands = []
        return {}, 201

    def get_armed(self):
        return {"result": self.armed}, 200

    def arm(self):
        self.armed = True  # Motors can be started
        return {}, 201

    def disarm(self):
        self.armed = False
        return {}, 201
