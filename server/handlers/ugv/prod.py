from __future__ import annotations
import json
import logging
import math
import os
import typing
from typing import Optional

from dronekit import connect, Command, VehicleMode, Vehicle
from pymavlink import mavutil as uavutil

from errors import GeneralError, InvalidRequestError, InvalidStateError
from handlers.utils import decorate_all_functions, log

if typing.TYPE_CHECKING:
    from groundstation import GroundStation

SERIAL_PORT = "/dev/ttyACM0"
BAUDRATE = 115200

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


def download_mission(vehicle):
    """
    Downloads the current mission and returns it in a list.
    It is used in save_mission() to get the file information to save.
    """
    missionlist = []
    cmds = vehicle.commands
    cmds.download()
    cmds.wait_ready()
    for cmd in cmds:
        missionlist.append(cmd)
    return missionlist


@decorate_all_functions(log, logging.getLogger("groundstation"))
class UGVHandler:
    mph = 2.23694
    ft = 3.28084

    def __init__(self, gs, config):
        self.logger = logging.getLogger("groundstation")
        self.gs: GroundStation = gs
        self.config = config
        self.port = self.config["ugv"]["telemetry"]["port"]
        self.serial = self.config["ugv"]["telemetry"]["serial"]
        self.update_thread = None
        self.vehicle: Optional[Vehicle] = None
        self.yaw = (
            self.ground_speed
        ) = (
            self.droppos
        ) = (
            self.dest
        ) = (
            self.dist_to_dest
        ) = self.battery = self.lat = self.lon = self.connection = self.mode = self.gps = None
        self.mode = VehicleMode("MANUAL")
        self.commands = []
        self.armed = False
        self.status = "BOOT"
        print("╠ CREATED UGV HANDLER")
        self.logger.info("CREATED UGV HANDLER")

    # Basic Methods

    def connect(self):
        try:
            if self.serial:
                self.vehicle = connect(self.port, wait_ready=True, baud=BAUDRATE)
            else:
                self.vehicle = connect(self.port, wait_ready=True)
            self.update()
            self.insert_command("WAYPOINT")
            print("╠ INITIALIZED UGV HANDLER")
            self.logger.info("INITIALIZED UGV HANDLER")
            return {}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def update(self):
        try:
            # Global Relative Frame uses absolute Latitude/Longitude and relative Altitude
            loc = self.vehicle.location.global_relative_frame
            rpy = self.vehicle.attitude  # Roll, Pitch, Yaw
            battery = self.vehicle.battery
            self.yaw = rpy.yaw * 180 / math.pi
            self.yaw += 360 if self.yaw < 0 else 0
            self.ground_speed = self.vehicle.groundspeed * self.mph
            self.battery = battery.voltage  # * 0.001  # Millivolts to volts?
            self.lat = loc.lat
            self.lon = loc.lon
            self.gps = self.vehicle.gps_0
            self.connection = [self.gps.eph, self.gps.epv, self.gps.satellites_visible]
            self.mode = self.vehicle.mode
            if not self.droppos:
                self.droppos = self.gs.interop.get_data("ugv")
                self.droppos = self.droppos["result"]
            x_dist = self.droppos["drop"]["latitude"] - self.lat
            y_dist = self.droppos["drop"]["longitude"] - self.lon
            # Conversion from decimal degrees to miles
            x_dist_ft = x_dist * (math.cos(self.lat * math.pi / 180) * 69.172) * 5280
            y_dist_ft = y_dist * 69.172 * 5280
            self.dist_to_dest = math.sqrt(x_dist_ft**2 + y_dist_ft**2)
            self.dest = [self.droppos, self.dist_to_dest]
            self.mode = self.vehicle.mode
            self.armed = self.vehicle.armed
            return {}
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
                "mode": self.mode.name,
                "commands": [cmd.to_dict() for cmd in self.commands],
                "armed": self.get_armed()["result"],
                "status": self.vehicle.system_status.state,
            }
        }

    # Setup

    def set_home(self):
        try:
            return {}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def calibrate(self):
        try:
            return {}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def restart(self):
        try:
            return {}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def abort(self):
        try:
            return {}
        except Exception as e:
            raise GeneralError(str(e)) from e

    # Flight Mode

    def set_flight_mode(self, flightmode):
        try:
            self.mode = self.vehicle.mode = VehicleMode(flightmode)
            return {}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def get_flight_mode(self):
        try:
            self.mode = self.vehicle.mode.name
            return {"result": self.mode}
        except Exception as e:
            raise GeneralError(str(e)) from e

    # Parameters

    def get_param(self, key):
        try:
            return {"result": self.vehicle.parameters[key]}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def get_params(self):
        try:
            return {
                "result": dict(
                    (keys, values) for keys, values in tuple(self.vehicle.parameters.items())
                )
            }
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
                    raise InvalidRequestError(
                        "Parameter Value cannot be converted to float"
                    ) from e
                self.vehicle.parameters[key] = value
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
                json.dump(self.vehicle.parameters, file)
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
                self.vehicle.parameters = json.load(file)
            return {}
        except Exception as e:
            raise GeneralError(str(e)) from e

    # Commands (Mission)

    def get_commands(self):
        try:
            cmds = self.vehicle.commands
            cmds.download()
            cmds.wait_ready()
            return {"result": [cmd.to_dict() for cmd in cmds]}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def load_commands(self):
        """
        Upload a mission from a file.
        """
        try:
            missionlist = readmission("handlers/pixhawk/uav/uav_mission.txt")
            cmds = self.vehicle.commands
            cmds.clear()
            for command in missionlist:
                cmds.add(command)
            self.vehicle.commands.upload()
            return {}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def clear_commands(self):
        try:
            self.vehicle.commands.clear()
            self.vehicle.commands.upload()
            return {}
        except Exception as e:
            raise GeneralError(str(e)) from e

    # Armed

    def get_armed(self):
        try:
            if self.vehicle.armed:
                return {"result": "ARMED"}
            elif self.vehicle.is_armable:
                return {"result": "DISARMED (ARMABLE)"}
            else:
                return {"result": "DISARMED (NOT ARMABLE)"}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def arm(self):
        try:
            if not self.vehicle.is_armable:
                raise InvalidStateError("Vehicle is not armable")
            self.vehicle.armed = True  # Motors can be started
            return {}
        except InvalidStateError as e:
            raise InvalidStateError(str(e)) from e
        except Exception as e:
            raise GeneralError(str(e)) from e

    def disarm(self):
        try:
            self.vehicle.armed = False
            return {}
        except Exception as e:
            raise GeneralError(str(e)) from e

    def __repr__(self):
        return "UGV Handler"
