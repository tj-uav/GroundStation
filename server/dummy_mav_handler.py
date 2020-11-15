import random

class DummyMavHandler:
    def __init__(self, port=None, serial=False):
        self.port = port
        self.serial = serial

    def connect(self):
        print("Created dummy mav handler")

    def update(self):
        self.altitude = random.random() * 100
        self.orientation = {
            self.yaw: random.randint(0, 360),
            self.roll: random.randint(0, 360),
            self.pitch: random.randint(0, 360)
        },
        self.ground_speed = random.random() * 100
        self.air_speed = random.random() * 100
        self.dist_to_wp = random.random() * 100
        self.voltage = random.random() * 16
        self.throttle = random.randint(0, 100)
        self.lat = -random.random() * 100
        self.lon = -random.random() * 100


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
