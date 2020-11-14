from dronekit import connect

SERIAL_PORT = '/dev/ttyACM0'
BAUDRATE = 115200

class MavHandler:
    def __init__(self, dummy=False, port=None, serial=False):
        self.dummy = dummy
        self.port = port
        self.serial = serial

    def connect(self):
        print("Connecting")
        if not self.dummy:
            if self.serial:
                self.vehicle = connect(self.port, wait_ready=True, baud=BAUDRATE)
            else:
                self.vehicle = connect(self.port, wait_ready=True)
        print("Connected")

    def telemetry(self):
        print("Requesting telemetry data")
        if self.dummy:
            return {'lat':38.8170,'lon':-77.1679,'alt':100,'pitch':15,'roll':20,'yaw':25}
        loc = self.vehicle.location.global_frame
        angle = self.vehicle.attitude
        return {'lat':loc.lat, 'lon':loc.lon, 'alt':loc.alt,
                    'pitch':angle.pitch, 'roll':angle.roll, 'yaw':angle.yaw}

