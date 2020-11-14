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

    def get_location(self):
        if self.dummy: return [38.8170,-77.1679,100]
        loc = self.vehicle.location.global_frame
        return [loc.lat, loc.lon, loc.alt]
    
    def get_attitude(self):
        if self.dummy: return [15,20,25]
        attitude = self.vehicle.attitude
        return [attitude.pitch, attitude.yaw, attitude.roll]