from __future__ import annotations
import json
import logging
import math
import os
import random
import typing

from dronekit import Command
from pymavlink import mavutil as uavutil

from errors import GeneralError, ServiceUnavailableError, InvalidRequestError
from handlers.utils import decorate_all_functions, log

if typing.TYPE_CHECKING:
    from groundstation import GroundStation

COMMANDS = {
    # Takeoff will be initiated using a Flight Mode
    # "TAKEOFF": uavutil.mavlink.MAV_CMD_NAV_TAKEOFF,
    "WAYPOINT": uavutil.mavlink.MAV_CMD_NAV_WAYPOINT,
    "LAND": uavutil.mavlink.MAV_CMD_NAV_LAND,
    "GEOFENCE": uavutil.mavlink.MAV_CMD_NAV_FENCE_POLYGON_VERTEX_INCLUSION,
}


def readmission(filename):
    """
    Load a mission from a file into a list.

    This function is used by upload_mission().
    """
    print(f"Reading mission from file: {filename}\n")
    missionlist = []
    with open(filename, "r", encoding="utf-8") as f:
        for i, line in enumerate(f):
            if i == 0:
                if not line.startswith("QGC WPL 110"):
                    raise Exception("File is not supported WP version")
            else:
                linearray = line.split("\t")
                ln_currentwp = int(linearray[1])
                ln_frame = int(linearray[2])
                ln_command = int(linearray[3])
                ln_param1 = float(linearray[4])
                ln_param2 = float(linearray[5])
                ln_param3 = float(linearray[6])
                ln_param4 = float(linearray[7])
                ln_param5 = float(linearray[8])
                ln_param6 = float(linearray[9])
                ln_param7 = float(linearray[10])
                ln_autocontinue = int(linearray[11].strip())
                cmd = Command(
                    0,
                    0,
                    0,
                    ln_frame,
                    ln_command,
                    ln_currentwp,
                    ln_autocontinue,
                    ln_param1,
                    ln_param2,
                    ln_param3,
                    ln_param4,
                    ln_param5,
                    ln_param6,
                    ln_param7,
                )
                missionlist.append(cmd)
    return missionlist


@decorate_all_functions(log, logging.getLogger("groundstation"))
class DummyUGVHandler:
    def __init__(self, gs, config):
        self.logger = logging.getLogger("groundstation")
        self.gs: GroundStation = gs
        self.config = config
        self.port = self.config["ugv"]["telemetry"]["port"]
        self.serial = self.config["ugv"]["telemetry"]["serial"]
        self.update_thread = None
        self.yaw = (
            self.ground_speed
        ) = (
            self.droppos
        ) = (
            self.dest
        ) = (
            self.dist_to_dest
        ) = self.battery = self.lat = self.lon = self.connection = self.mode = self.gps = None
        with open(
            os.path.join(os.path.dirname(os.path.abspath(__file__)), "ugv_params.json"),
            "r",
            encoding="utf-8",
        ) as file:
            self.params = json.load(file)
        self.mode = "AUTO"
        self.commands = []
        self.armed = True
        self.status = "ACTIVE"
        print("╠ CREATED DUMMY UGV HANDLER")
        self.logger.info("CREATED DUMMY UGV HANDLER")

    # Basic Methods

    def connect(self):
        try:
            self.update()
            print("╠ INITIALIZED DUMMY UGV HANDLER")
            self.logger.info("INITIALIZED DUMMY UGV HANDLER")
            return {}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def update(self):
        try:
            self.ground_speed = random.random() * 30 + 45
            self.battery = random.random() * 2 + 14
            self.connection = [random.random(), random.random(), random.random() * 100]
            # simulates the ugv in the ugv boundary
            if not self.droppos:
                self.droppos = self.gs.interop.get_data("ugv")
                self.droppos = self.droppos["result"]
            if not self.lat:
                self.lat = self.droppos["drop"]["latitude"]# + (random.random() - 0.5) / 2000
                self.lon = self.droppos["drop"]["longitude"]# + (random.random() - 0.5) / 2000
            self.lat += (random.random() - 0.5) / 80000
            self.lon += (random.random() - 0.5) / 80000
            # ^^ remove after frr
            x_dist = self.droppos["drop"]["latitude"] - self.lat
            y_dist = self.droppos["drop"]["longitude"] - self.lon
            angle = math.atan2(y_dist, x_dist)
            x_dist_ft = x_dist * (math.cos(self.lat * math.pi / 180) * 69.172) * 5280
            y_dist_ft = y_dist * 69.172 * 5280
            self.dist_to_dest = math.sqrt(x_dist_ft**2 + y_dist_ft**2)
            self.dest = [self.droppos, self.dist_to_dest]
            self.yaw = int(
                (angle / (2 * math.pi) * 360)
                if angle >= 0
                else (angle / (2 * math.pi) * 360 + 360)
            )
            return {}
        except KeyError as e:
            raise ServiceUnavailableError("Interop Connection Lost") from e
        except Exception as e:
            raise GeneralError(str(e)) from e

    def quick(self):
        return {
            "result": {
                "yaw": self.yaw,
                "lat": self.lat,
                "lon": self.lon,
                "ground_speed": self.ground_speed,
                "battery": self.battery,
                "destination": self.dest,
                "connection": self.connection,
            }
        }

    def stats(self):
        return {
            "result": {
                "quick": self.quick()["result"],
                "mode": self.mode,
                "commands": [cmd.to_dict() for cmd in self.commands],
                "armed": self.get_armed()["result"],
                "status": self.status,
            }
        }

    # Setup

    def set_home(self):
        return {}

    def calibrate(self):
        return {}

    def restart(self):
        return {}

    def abort(self):
        return {}

    # Flight Mode

    def set_flight_mode(self, flightmode):
        self.mode = flightmode
        return {}

    def get_flight_mode(self):
        return {"result": self.mode}

    # Parameters

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
                    raise InvalidRequestError(
                        "Parameter Value cannot be converted to float"
                    ) from e
                new_params[key] = float(value)
            self.params = new_params
            return {}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def save_params(self):
        try:
            with open(
                os.path.join(os.path.dirname(os.path.abspath(__file__)), "ugv_params.json"),
                "w",
                encoding="utf-8",
            ) as file:
                json.dump(self.params, file)
            return {}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def load_params(self):
        try:
            with open(
                os.path.join(os.path.dirname(os.path.abspath(__file__)), "ugv_params.json"),
                "r",
                encoding="utf-8",
            ) as file:
                self.params = json.load(file)
            return {}
        except Exception as e:
            raise GeneralError(str(e)) from e

    # Commands (Mission)

    def get_commands(self):
        try:
            commands = self.commands
            return {"result": [cmd.to_dict() for cmd in commands]}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def write_commands(self):
        """
        Upload a mission from a file.
        """
        try:
            missionlist = readmission(
                os.path.join(os.path.dirname(os.path.abspath(__file__)), "ugv_mission.txt")
            )
            for command in missionlist:
                self.commands.append(command)
        except Exception as e:
            raise GeneralError(str(e)) from e

    def clear_commands(self):
        self.commands = []
        return {}

    # Armed

    def get_armed(self):
        return {"result": "ARMED" if self.armed else "DISARMED (ARMABLE)"}

    def arm(self):
        self.armed = True  # Motors can be started
        return {}

    def disarm(self):
        self.armed = False
        return {}

    def __repr__(self):
        return "Dummy UGV Handler"
