import json
import random
import time

from dronekit import connect, Command, VehicleMode
from pymavlink import mavutil as uavutil

SERIAL_PORT = "/dev/ttyACM0"
BAUDRATE = 115200

COMMANDS = {
    "TAKEOFF": uavutil.mavlink.MAV_CMD_NAV_TAKEOFF,
    "WAYPOINT": uavutil.mavlink.MAV_CMD_NAV_WAYPOINT,
    "LAND": uavutil.mavlink.MAV_CMD_NAV_LAND,
    "GEOFENCE": uavutil.mavlink.MAV_CMD_NAV_FENCE_POLYGON_VERTEX_INCLUSION
}


class UAVHandler:
    def __init__(self, gs, config, socketio):
        self.gs = gs
        self.config = config
        self.port = self.config["uav"]["port"]
        self.serial = self.config["uav"]["serial"]
        self.socketio = socketio
        self.update_thread = None
        self.vehicle = None
        self.altitude = self.orientation = self.ground_speed = self.air_speed = self.dist_to_wp = \
            self.voltage = self.battery_level = self.throttle = self.lat = self.lon = \
            self.mode = self.params = None
        self.commands = []
        self.armed = False

    def connect(self):
        try:
            if self.serial:
                self.vehicle = connect(self.port, wait_ready=True, baud=BAUDRATE)
            else:
                self.vehicle = connect(self.port, wait_ready=True)
            self.update()
            print("CONNECTED TO UAV")
            return {}, 201
        except Exception as e:
            return {"result": str(e)}, 500

    def update(self):
        try:
            loc = self.vehicle.location.global_frame
            angle = self.vehicle.attitude
            battery = self.vehicle.battery
            # TODO: Use actual dronekit commands for these
            self.altitude = loc.alt
            self.orientation = dict(yaw=angle.yaw, roll=angle.roll, pitch=angle.pitch),
            self.ground_speed = self.vehicle.groundspeed
            self.air_speed = self.vehicle.airspeed
            self.dist_to_wp = random.random() * 100
            self.voltage = battery.voltage
            self.battery_level = battery.level
            self.throttle = random.randint(0, 100)
            self.lat = loc.lat
            self.lon = loc.lon
            self.mode = self.vehicle.mode
            return {}, 201
        except Exception as e:
            return {"result": str(e)}, 500

    def quick(self):
        try:
            self.update()
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
        except Exception as e:
            return {"result": str(e)}, 500

    def stats(self):
        return {"result": {
            "result": "success",
            "quick": self.quick(),
            "flightmode": self.vehicle.mode,
            "commands": [cmd.to_dict() for cmd in self.vehicle.commands],
            "armed": self.vehicle.armed
        }}, 200

    def set_flight_mode(self, flightmode):
        try:
            self.vehicle.mode = VehicleMode(flightmode)
            self.mode = flightmode
            return {}, 201
        except Exception as e:
            return {"result": str(e)}, 500

    def get_flight_mode(self):
        try:
            self.mode = self.vehicle.mode.name
            return {"result": self.mode}, 200
        except Exception as e:
            return {"result": str(e)}, 500

    def get_param(self, key):
        try:
            return {"result": self.vehicle.parameters[key]}, 200
        except Exception as e:
            return {"result": str(e)}, 500

    def get_params(self):
        try:
            return {"result": self.vehicle.parameters.items()}, 200
        except Exception as e:
            return {"result": str(e)}, 500

    def set_param(self, key, value):
        try:
            self.vehicle.parameters[key] = value
            self.params[key] = value
            return {}, 200
        except Exception as e:
            return {"result": str(e)}, 500

    def set_params(self, **kwargs):
        try:
            new_params = dict(self.vehicle.parameters.items())
            for key, value in kwargs.items():
                new_params[key] = value
            self.vehicle.parameters = new_params
            self.params = new_params
            return {}, 201
        except Exception as e:
            return {"result": str(e)}, 500

    def save_params(self):
        try:
            with open("params.json", "w") as file:
                json.dump(self.vehicle.paramreters, file)
            return {}, 201
        except Exception as e:
            return {"result": str(e)}, 500

    def load_params(self):
        try:
            with open("params.json", "r") as file:
                self.params = json.load(file)
            self.vehicle.parameters = self.params
            return {}, 201
        except Exception as e:
            return {"result": str(e)}, 500

    def get_commands(self):
        try:
            commands = self.vehicle.commands
            commands.download()
            return {"result": [cmd.to_dict() for cmd in commands]}, 200
        except Exception as e:
            return {"result": str(e)}, 500

    def insert_command(self, command, lat, lon, alt):
        try:
            new_cmd = Command(0, 0, 0, uavutil.mavlink.MAV_FRAME_GLOBAL_RELATIVE_ALT,
                              COMMANDS[command], 0, 0, 0, 0, 0, 0, lat, lon, alt)
            cmds = self.vehicle.commands
            cmds.download()
            cmds.add(new_cmd)
            cmds.upload()
            return {}, 201
        except Exception as e:
            return {"result": str(e)}, 500

    def clear_mission(self):
        try:
            self.vehicle.commands.clear()
            self.vehicle.commands.upload()
            return {}, 201
        except Exception as e:
            return {"result": str(e)}, 500

    def get_armed(self):
        try:
            return {"result": self.vehicle.armed}, 200
        except Exception as e:
            return {"result": str(e)}, 500

    def arm(self):
        try:
            self.vehicle.armed = True  # Motors can be started
            return {}, 201
        except Exception as e:
            return {"result": str(e)}, 500

    def disarm(self):
        try:
            self.vehicle.armed = False
            return {}, 201
        except Exception as e:
            return {"result": str(e)}, 500
