import pymavlink

SERIAL_PORT = '/dev/ttyACM0'
BAUDRATE = 115200

class MavHandler:
    def __init__(self, dummy=False, simulate=False):
        self.dummy = dummy
        self.simulate = simulate

    def connect(self):
        if self.dummy: pass
        if self.simulate: self.vehicle = connect('tcp:127.0.0.1:5760', wait_ready=True)
        else: self.vehicle = connect(SERIAL_PORT, wait_ready=True, baud=BAUDRATE)

    def telemetry(self):
        if self.dummy: return {'lat':38.8170,'lon':-77.1679,'alt':100,'pitch':15,'roll':20,'yaw':25}
        loc = self.vehicle.location.global_frame
        angle = self.vehicle.attitude
        return {'lat':loc.lat, 'lon':loc.lon, 'alt':loc.alt,
                    'pitch':angle.pitch, 'roll':angle.roll, 'yaw':angle.yaw}