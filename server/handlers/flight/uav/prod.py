import json
import logging
import random

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
            self.voltage = self.battery_level = self.throttle = self.lat = self.lon = \
            self.mode = self.params = None
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
            return {}
        except Exception as e:
            raise GeneralError(str(e)) from e

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
            }}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def stats(self):
        return {"result": {
            "result": "success",
            "quick": self.quick(),
            "flightmode": self.vehicle.mode,
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
            self.params[key] = value
            return {}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def set_params(self, **kwargs):
        try:
            new_params = dict(self.vehicle.parameters.items())
            for key, value in kwargs.items():
                try:
                    float(value)
                except ValueError as e:
                    raise InvalidRequestError("Parameter Value cannot be converted to float") from e
                new_params[key] = value
            self.vehicle.parameters = new_params
            self.params = new_params
            return {}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def save_params(self):
        try:
            with open("params.json", "w") as file:
                json.dump(self.vehicle.paramreters, file)
            return {}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def load_params(self):
        try:
            with open("params.json", "r") as file:
                self.params = json.load(file)
            self.vehicle.parameters = self.params
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
        if command not in COMMANDS.keys():
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
