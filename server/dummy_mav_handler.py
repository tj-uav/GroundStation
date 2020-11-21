import time
import random
import threading

class DummyMavHandler:
    def __init__(self, port=None):
        self.port = port

    def connect(self):
        print("Created dummy mav handler")
        self.update_thread = threading.Thread(target=self.constant_updating)
        self.update_thread.daemon = True
        self.update_thread.start()


    def constant_updating(self):
        while True:
            self.update()
            time.sleep(0.1)


    def update(self):
        self.altitude = random.random() * 100
        self.orientation = {
            'yaw': random.randint(0, 360),
            'roll': random.randint(0, 360),
            'pitch': random.randint(0, 360)
        }
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
