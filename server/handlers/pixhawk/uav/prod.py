import json
import logging
import math

from dronekit import connect, Command, VehicleMode
from pymavlink import mavutil as uavutil

from errors import GeneralError, InvalidRequestError

SERIAL_PORT = "/dev/ttyACM0"
BAUDRATE = 115200

COMMANDS = {
    "TAKEOFF": uavutil.mavlink.MAV_CMD_NAV_TAKEOFF,
    "WAYPOINT": uavutil.mavlink.MAV_CMD_NAV_WAYPOINT,
    "LAND": uavutil.mavlink.MAV_CMD_NAV_LAND,
    "GEOFENCE": uavutil.mavlink.MAV_CMD_NAV_FENCE_POLYGON_VERTEX_INCLUSION
}


class UAVHandler:
    def __init__(self, gs, config):
        self.logger = logging.getLogger("main")
        self.gs = gs
        self.config = config
        self.port = self.config["uav"]["telemetry"]["port"]
        self.serial = self.config["uav"]["telemetry"]["serial"]
        self.update_thread = None
        self.vehicle = None
        self.altitude = self.orientation = self.ground_speed = self.air_speed = self.dist_to_wp = \
            self.battery = self.throttle = self.lat = self.lon = self.connection = self.waypoint = \
            self.mode = self.waypoints = self.waypoint_index = self.temperature = self.params = \
            self.gps = None
        self.mode = "MANUAL"
        self.commands = []
        self.armed = False
        print("╠ CREATED UAV HANDLER")
        self.logger.info("CREATED UAV HANDLER")

    def connect(self):
        try:
            if self.serial:
                self.vehicle = connect(self.port, wait_ready=True, baud=BAUDRATE)
            else:
                self.vehicle = connect(self.port, wait_ready=True)
            self.update()
            print("╠ INITIALIZED UAV HANDLER")
            self.logger.info("INITIALIZED UAV HANDLER")
            return {}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def update(self):
        try:
            loc = self.vehicle.location.global_frame
            angle = self.vehicle.attitude
            battery = self.vehicle.battery
            self.altitude = loc.alt
            self.throttle = None
            self.orientation = dict(
                roll=angle.roll * 180 / math.pi,
                pitch=angle.pitch * 180 / math.pi,
                yaw=angle.yaw * 180 / math.pi,
            )
            self.orientation["yaw"] = 360 + self.orientation["yaw"] if self.orientation["yaw"] < 0 else \
                self.orientation["yaw"]
            self.ground_speed = self.vehicle.groundspeed
            self.air_speed = self.vehicle.airspeed
            self.battery = battery.voltage
            # self.temperature = self.vehicle.temperature
            self.gps = self.vehicle.gps_0
            self.connection = [self.gps.eph, self.gps.epv, self.gps.satellites_visible]
            self.lat = loc.lat
            self.lon = loc.lon
            if not self.waypoints:
                self.waypoints = self.gs.call("i_data", "waypoints")
                self.waypoints = self.waypoints["result"]
                self.waypoint_index = 1 % len(self.waypoints)
            x_dist = self.waypoints[self.waypoint_index]["latitude"] - self.lat
            y_dist = self.waypoints[self.waypoint_index]["longitude"] - self.lon
            dist = math.sqrt(x_dist ** 2 + y_dist ** 2)
            x_dist_ft = x_dist * (math.cos(self.lat * math.pi / 180) * 69.172) * 5280
            y_dist_ft = y_dist * 69.172 * 5280
            self.dist_to_wp = math.sqrt(x_dist_ft ** 2 + y_dist_ft ** 2)
            if dist <= 0.0001:
                self.waypoint_index = (self.waypoint_index + 1) % len(self.waypoints)
            self.waypoint = [self.waypoint_index, self.dist_to_wp]
            self.mode = self.vehicle.mode
            return {}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def quick(self):
        try:
            self.update()
            return {"result": {
                "altitude": self.altitude,
                "throttle": self.throttle,
                "orientation": self.orientation,
                "lat": self.lat,
                "lon": self.lon,
                "ground_speed": self.ground_speed,
                "air_speed": self.air_speed,
                "battery": self.battery,
                "waypoint": self.waypoint,
                "connection": self.connection
            }}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def stats(self):
        return {"result": {
            "quick": self.quick()["result"],
            "mode": self.vehicle.mode.name,
            "commands": [cmd.to_dict() for cmd in self.vehicle.commands],
            "armed": self.vehicle.armed
        }}

    def set_flight_mode(self, flightmode):
        try:
            self.vehicle.mode = VehicleMode(flightmode)
            self.mode = flightmode
            return {}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def get_flight_mode(self):
        try:
            self.mode = self.vehicle.mode.name
            return {"result": self.mode}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def get_param(self, key):
        try:
            return {"result": self.vehicle.parameters[key]}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def get_params(self):
        try:
            return {"result": self.vehicle.parameters.items()}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def set_param(self, key, value):
        try:
            print(float(value))
        except ValueError as e:
            raise InvalidRequestError("Parameter Value cannot be converted to float") from e
        try:
            self.vehicle.parameters[key] = value
            return {}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def set_params(self, **kwargs):
        try:
            for key, value in kwargs.items():
                try:
                    float(value)
                except ValueError as e:
                    raise InvalidRequestError("Parameter Value cannot be converted to float") from e
                self.vehicle.parameters[key] = value
            return {}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def save_params(self):
        try:
            with open("handlers/pixhawk/uav/uav_params.json", "w") as file:
                json.dump(self.vehicle.paramreters, file)
            return {}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def load_params(self):
        try:
            with open("handlers/pixhawk/uav/uav_params.json", "r") as file:
                self.vehicle.parameters = json.load(file)
            return {}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def get_commands(self):
        try:
            commands = self.vehicle.commands
            commands.download()
            return {"result": [cmd.to_dict() for cmd in commands]}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def insert_command(self, command, lat, lon, alt):
        if command not in COMMANDS:
            raise InvalidRequestError("Invalid Command Name")
        try:
            new_cmd = Command(0, 0, 0, uavutil.mavlink.MAV_FRAME_GLOBAL_RELATIVE_ALT,
                              COMMANDS[command], 0, 0, 0, 0, 0, 0, lat, lon, alt)
            cmds = self.vehicle.commands
            cmds.download()
            cmds.add(new_cmd)
            cmds.upload()
            return {}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def clear_mission(self):
        try:
            self.vehicle.commands.clear()
            self.vehicle.commands.upload()
            return {}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def get_armed(self):
        try:
            return {"result": self.vehicle.armed}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def arm(self):
        try:
            self.vehicle.armed = True  # Motors can be started
            return {}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def disarm(self):
        try:
            self.vehicle.armed = False
            return {}
        except Exception as e:
            raise GeneralError(str(e)) from e
