from dronekit import connect

SERIAL_PORT = '/dev/ttyACM0'
BAUDRATE = 115200

class MavHandler:
    def __init__(self, port=None, serial=False):
        self.port = port
        self.serial = serial

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

        # TODO: Use actual dronekit commands for these
        self.altitude = loc.alt
        self.orientation = {
            'yaw': angle.yaw,
            'roll': angle.roll,
            'pitch': angle.pitch
        },
        self.ground_speed = random.random() * 100
        self.air_speed = random.random() * 100
        self.dist_to_wp = random.random() * 100
        self.voltage = random.random() * 16
        self.throttle = random.randint(0, 100)
        self.lat = loc.lat
        self.lon = loc.lon


    def quick(self):
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
        paramsObj = self.vehicle.parameters
        return {k,v: for k,v in self.vehicle.parameters.items()}

    def setParam(self, key, value):
        self.vehicle.parameters[key] = value

    def getParam(self):
        return self.vehicle.parameters[key]

    def setParams(self, **kwargs):
        newParams = {key:value for key, value in vehicle.parameters.items()}
        for key, value in kwargs.items():
            newParams[key] = value

        vehicle.parameters = newParams

    
