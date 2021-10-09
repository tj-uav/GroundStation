import time
import random
import threading

class DummyMavHandler:
    def __init__(self, config, socketio):
        self.config = config
        self.port = self.config['mav']['port']
        self.socketio = socketio

    def connect(self):
        print("Created dummy mav handler")
        self.update()
        self.update_thread = threading.Thread(target=self.constant_updating)
        self.update_thread.daemon = True
        self.update_thread.start()


    def constant_updating(self):
        while True:
            self.update()
            print("Emitting")
            self.socketio.emit("get_data", {"HELLO": "HIII"})
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
        self.lat = random.random() * 180 - 90
        self.lon = random.random() * 180 - 90


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
        with open("params.json", "r") as f:
            return json.load(f)

    def setParam(self, key, value):
        return
    
    def getCommands(self):
        return []
    
    def insertCommand(self, command, lat, lon, alt, ind=-1):
        return
        