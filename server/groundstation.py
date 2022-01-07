import json
import socket
import time
from threading import Thread
import logging

from handlers.dummy_uav_handler import DummyUAVHandler
from handlers.image_handler import ImageHandler
from handlers.interop_handler import InteropHandler
from handlers.uav_handler import UAVHandler


class GroundStation:
    def __init__(self, s):
        self.logger = logging.getLogger("main")
        with open("config.json", "r") as file:
            self.config = json.load(file)

        self.interop_telem_thread = self.uav_update_thread = self.retreive_image_thread = None

        self.interop = InteropHandler(self, config=self.config)
        self.interop_telem_thread = self.plane_thread = self.image_thread = None

        if self.config["uav"]["telemetry"]["dummy"]:
            self.uav = DummyUAVHandler(self, self.config, s)
        else:
            self.uav = UAVHandler(self, self.config, s)

        self.image = ImageHandler(self)

        self.interop.login()

        self.func_map = {
            "i_login": self.interop.login,
            "i_data": self.interop.get_data,  # key
            "i_telemetry": self.interop.get_telemetry,

            "i_odlcget": self.interop.odlc_get_queue,  # filter_val
            "i_odlcadd": self.interop.odlc_add_to_queue,  # 8/9
            "i_odlcedit": self.interop.odlc_edit,  # 1/10
            "i_odlcreject": self.interop.odlc_reject,  # id_
            "i_odlcsubmit": self.interop.odlc_submit,  # id_
            "i_odlcsave": self.interop.odlc_save_queue,  # filename
            "i_odlcload": self.interop.odlc_load_queue,  # filename

            "i_mapadd": self.interop.map_add,  # name, image
            "i_mapsubmit": self.interop.map_submit,  # name

            "m_connect": self.uav.connect,
            "m_update": self.uav.update,
            "m_quick": self.uav.quick,
            "m_stats": self.uav.stats,

            "m_getflightmode": self.uav.get_flight_mode,
            "m_setflightmode": self.uav.set_flight_mode,  # flightmode

            "m_getparam": self.uav.get_param,  # key
            "m_setparam": self.uav.set_param,  # key, value
            "m_getparams": self.uav.get_params,
            "m_setparams": self.uav.set_params,  # kwargs
            "m_saveparams": self.uav.save_params,
            "m_loadparams": self.uav.load_params,

            "m_getcommands": self.uav.get_commands,
            "m_insertcommand": self.uav.insert_command,  # command, lat, lon, alt
            "m_clearcommands": self.uav.clear_mission,

            "m_getarmed": self.uav.get_armed,
            "m_arm": self.uav.arm,
            "m_disarm": self.uav.disarm,

            "cv_process": self.image.process_image
        }

        time.sleep(5)

        self.uav.connect()
        self.async_calls()

    def telemetry_thread(self):
        while True:
            run = self.interop.submit_telemetry()
            if run != {}:
                self.logger.debug("[Telemetry] %s", run)
            time.sleep(0.1)

    def uav_thread(self):
        while True:
            run = self.uav.update()
            if run != {}:
                self.logger.debug("[Plane] %s", run)
            time.sleep(0.1)

    def image_thread(self):
        if self.config["uav"]["images"]["connection"]:  # Initialize a socket connection
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind((self.config["uav"]["images"]["host"], self.config["uav"]["images"]["port"]))
                s.listen()
                conn, addr = s.accept()
                with conn:
                    self.logger.warning("[Image] Socket connection established with " + addr)
                    curr_image = ""
                    while True:
                        resp = conn.recv(1024)
                        if not resp:
                            break
                        resp = resp.decode("utf-8")
                        loc = resp.find(" ")
                        if loc != -1:
                            curr_image += resp[:loc]
                            res = self.image.process_image(curr_image)
                            curr_image = resp[loc + 1:]
                            self.logger.debug("[Image] Successfully retreived image from socket")
                            if res:
                                self.logger.info("[Image] Successfully identified ODLC from Image")
                            conn.sendall(bytes("Image Complete", "utf-8"))
                        else:
                            curr_image += resp
                    self.logger.warning("[Image] Lost socket connection with " + addr)
        else:  # Use a dummy connection
            while True:
                run = self.image.retreive_images()
                if run:
                    self.logger.info("[Image] Successfully identified ODLC from Image")
                time.sleep(0.1)

    def async_calls(self):
        self.interop_telem_thread = Thread(target=self.telemetry_thread)
        self.interop_telem_thread.name = "InteropThread"
        self.interop_telem_thread.daemon = True

        self.plane_thread = Thread(target=self.uav_thread)
        self.plane_thread.name = "UAVThread"
        self.plane_thread.daemon = True

        self.retreive_image_thread = Thread(target=self.image_thread)
        self.retreive_image_thread.name = "ImageThread"
        self.retreive_image_thread.daemon = True

        self.interop_telem_thread.start()
        self.plane_thread.start()
        self.retreive_image_thread.start()
        print("STARTED ASYNC THREADS")
        self.logger.info("STARTED ASYNC THREADS")

    # Calls a function from self.func_map, with the provided parameters
    def call(self, func, *args, log=True):
        result = self.func_map[func](*args)
        if log:
            self.logger.log(logging.DEBUG, func + ": " + json.dumps(result))
        return result
