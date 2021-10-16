import random

from dronekit import connect, Command
from pymavlink import mavutil

SERIAL_PORT = '/dev/ttyACM0'
BAUDRATE = 115200

COMMANDS = {
    "TAKEOFF": mavutil.mavlink.MAV_CMD_NAV_TAKEOFF,
    "WAYPOINT": mavutil.mavlink.MAV_CMD_NAV_WAYPOINT,
    "LAND": mavutil.mavlink.MAV_CMD_NAV_LAND,
    "GEOFENCE": mavutil.mavlink.MAV_CMD_NAV_FENCE_POLYGON_VERTEX_INCLUSION
}


class MavHandler:
    def __init__(self, config):
        self.config = config
        self.port = self.config['mav']['port']
        self.serial = self.config['mav']['serial']
        self.vehicle = None
        self.altitude = self.orientation = self.ground_speed = self.air_speed = self.dist_to_wp = \
            self.voltage = self.battery_level = self.throttle = self.lat = self.lon = \
            self.mode = None

    def connect(self):
        print("Connecting")
        if self.serial:
            self.vehicle = connect(self.port, wait_ready=True, baud=BAUDRATE)
        else:
            self.vehicle = connect(self.port, wait_ready=True)
        print("Connected")

    def update(self):
        loc = self.vehicle.location.global_frame
        angle = self.vehicle.attitude
        battery = self.vehicle.battery

        # TODO: Use actual dronekit commands for these
        self.altitude = loc.alt
        self.orientation = {
                               'yaw': angle.yaw,
                               'roll': angle.roll,
                               'pitch': angle.pitch
                           },
        self.ground_speed = self.vehicle.groundspeed
        self.air_speed = self.vehicle.airspeed
        self.dist_to_wp = random.random() * 100
        self.voltage = battery.voltage
        self.battery_level = battery.level
        self.throttle = random.randint(0, 100)
        self.lat = loc.lat
        self.lon = loc.lon

        self.mode = self.vehicle.mode

    def set_flight_mode(self, flightmode):
        self.vehicle.mode = flightmode

    def quick(self):
        self.update()
        print("Requesting quick data")
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

    def params(self):
        # params_obj = self.vehicle.parameters
        return dict(self.vehicle.parameters.items())

    def set_param(self, key, value):
        self.vehicle.parameters[key] = value

    def get_param(self, key):
        return self.vehicle.parameters[key]

    def set_params(self, **kwargs):
        new_params = dict(self.vehicle.parameters.items())
        for key, value in kwargs.items():
            new_params[key] = value

        self.vehicle.parameters = new_params

    def clear_mission(self):
        self.vehicle.commands.clear()
        self.vehicle.commands.upload()

    def get_commands(self):
        commands = self.vehicle.commands
        commands.download()
        return [cmd.to_dict() for cmd in commands]

    def insert_command(self, command, lat, lon, alt):
        new_cmd = Command(0, 0, 0, mavutil.mavlink.MAV_FRAME_GLOBAL_RELATIVE_ALT,
                          COMMANDS[command], 0, 0, 0, 0, 0, 0, lat, lon, alt)

        cmds = self.vehicle.commands
        cmds.download()
        cmds.add(new_cmd)
        cmds.upload()

    def arm(self):
        self.vehicle.armed = True

    def disarm(self):
        self.vehicle.armed = False
