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


class UGVHandler:
    def __init__(self, gs, config):
        self.logger = logging.getLogger("main")
        self.gs = gs
        self.config = config
        self.port = self.config["ugv"]["telemetry"]["port"]
        self.serial = self.config["ugv"]["telemetry"]["serial"]
        self.update_thread = None
        self.vehicle = None
        self.states = ["On Plane", "Drop to Ground", "Reach Destination", "Terminated"]
        self.current_state = "Reach Destination"
        self.next_objective = "Terminated"
        self.yaw = self.ground_speed = self.connection = self.droppos = self.lat = self.lon = \
            self.dist_to_dest = self.mode = self.gps = None
        self.commands = []
        self.armed = False
        print("╠ CREATED UGV HANDLER")
        self.logger.info("CREATED UGV HANDLER")

    def connect(self):
        try:
            if self.serial:
                self.vehicle = connect(self.port, wait_ready=True, baud=BAUDRATE)
            else:
                self.vehicle = connect(self.port, wait_ready=True)
            self.update()
            print("╠ INITIALIZED UGV HANDLER")
            self.logger.info("INITIALIZED UGV HANDLER")
            return {}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def update(self):
        try:
            loc = self.vehicle.location.global_frame
            angle = self.vehicle.attitude
            self.yaw = angle.yaw
            self.ground_speed = self.vehicle.groundspeed
            self.lat = loc.lat
            self.lon = loc.lon
            self.gps = self.vehicle.gps_0
            self.connection = [self.gps.eph, self.gps.epv, self.gps.satellites_visible]
            self.mode = self.vehicle.mode
            if not self.droppos:
                self.droppos = self.gs.call("i_data", "ugv")
                self.droppos = self.droppos["result"]
            x_dist = self.droppos["drop"]["latitude"] - self.lat
            y_dist = self.droppos["drop"]["longitude"] - self.lon
            angle = math.atan2(y_dist, x_dist)
            x_dist_ft = x_dist * (math.cos(self.lat * math.pi / 180) * 69.172) * 5280
            y_dist_ft = y_dist * 69.172 * 5280
            self.dist_to_dest = math.sqrt(x_dist_ft ** 2 + y_dist_ft ** 2)
            self.yaw = int((angle / (2 * math.pi) * 360) if angle >= 0 else (
                    angle / (2 * math.pi) * 360 + 360))
            return {}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def quick(self):
        try:
            self.update()
            return {"result": {
                "states": [self.current_state, self.next_objective, self.dist_to_dest],
                "yaw": self.yaw,
                "lat": self.lat,
                "lon": self.lon,
                "ground_speed": self.ground_speed,
                "connection": self.connection
            }}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def stats(self):
        return {"result": {
            "quick": self.quick(),
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
            new_params = dict(self.vehicle.parameters.items())
            for key, value in kwargs.items():
                try:
                    float(value)
                except ValueError as e:
                    raise InvalidRequestError("Parameter Value cannot be converted to float") from e
                new_params[key] = value
            self.vehicle.parameters = new_params
            return {}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def save_params(self):
        try:
            with open("handlers/pixhawk/ugv/ugv_params.json", "w") as file:
                json.dump(self.vehicle.paramreters, file)
            return {}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def load_params(self):
        try:
            with open("handlers/pixhawk/ugv/ugv_params.json", "r") as file:
                self.vehicle.params = json.load(file)
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
            self.vehicle.arm()  # Motors can be started
            return {}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def disarm(self):
        try:
            self.vehicle.disarm()
            return {}
        except Exception as e:
            raise GeneralError(str(e)) from e
