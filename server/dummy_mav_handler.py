import time
import random
import threading
import time
import math
import json

class DummyMavHandler:
    def __init__(self, config, socketio):
        self.config = config
        self.port = self.config['mav']['port']
        self.socketio = socketio
        self.update_thread = None
        self.altitude = self.orientation = self.ground_speed = self.air_speed = self.dist_to_wp = \
            self.voltage = self.throttle = self.lat = self.lon = None
        self.params = None

    def connect(self, waypoints):
        print("Created dummy mav handler")
        self.waypoints = waypoints
        self.waypoint_index = 1 % len(waypoints)
        self.lat = waypoints[0].latitude
        self.lon = waypoints[0].longitude
        self.update()
        self.update_thread = threading.Thread(target=self.constant_updating)
        self.update_thread.daemon = True
        self.update_thread.start()

    def constant_updating(self):
        while True:
            self.update()
            # print("Emitting")
            self.socketio.emit("get_data", {"HELLO": "HIII"})
            time.sleep(0.1)

    def update(self):
        self.altitude = random.random() * 100
        self.ground_speed = random.random() * 100
        self.air_speed = random.random() * 100
        self.dist_to_wp = random.random() * 100
        self.voltage = random.random() * 16
        self.throttle = random.randint(0, 100)
        # simulates the plane flying over the waypoints
        speed = 0.0001
        x_dist = self.waypoints[self.waypoint_index].latitude-self.lat
        y_dist = self.waypoints[self.waypoint_index].longitude-self.lon
        dist = math.sqrt((x_dist) ** 2 + (y_dist) ** 2)
        angle = math.atan2(y_dist, x_dist)
        if dist <= 0.0001:
            self.lat = self.waypoints[self.waypoint_index].latitude
            self.lon = self.waypoints[self.waypoint_index].longitude
            self.waypoint_index = (self.waypoint_index+1) % len(self.waypoints)
        else:
            self.lat = (self.lat + math.cos(angle) * speed)
            self.lon = (self.lon + math.sin(angle) * speed)
        self.orientation = {
            'yaw': int((angle/(2*math.pi) * 360) if angle >= 0 else (angle/(2*math.pi)*360 + 360)),
            'roll': random.randint(0, 360),
            'pitch': random.randint(0, 360)
        }

    def quick(self):
        # print("Requesting quick data")
        return {'altitude': self.altitude,
                'orientation': self.orientation,
                'ground_speed': self.ground_speed,
                'air_speed': self.air_speed,
                'dist_to_wp': self.dist_to_wp,
                'voltage': self.voltage,
                'throttle': self.throttle,
                'lat': self.lat,
                'lon': self.lon
                }


    def get_telemetry(self):
        return {
            "latitude": self.lat,
            "longitude": self.lon,
            "heading": self.orientation["yaw"]
        }

    def load_params(self):
        with open("params.json", "r") as file:
            self.params = json.load(file)

    def get_params(self):
        return self.params

    def set_param(self, key, value):
        with open("params.json", "r") as file:
            params = json.load(file)
        params[key] = value
        with open("params.json", "w") as file:
            json.dump(self.params, file)
        self.load_params()

    def get_commands(self):
        return []

    def insert_command(self, command, lat, lon, alt):
        return
