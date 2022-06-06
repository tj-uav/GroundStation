import json
import logging
import time
from threading import Thread

from handlers.flight.uav.dummy import DummyUAVHandler
from handlers.images.image_handler import ImageHandler
from handlers.interop.interop_handler import InteropHandler
from handlers.flight.uav.prod import UAVHandler


class GroundStation:
    def __init__(self):
        self.logger = logging.getLogger("main")
        with open("config.json", "r") as file:
            self.config = json.load(file)

        self.interop_telem_thread = self.uav_update_thread = self.retreive_image_thread = None

        print("╔══ CREATING HANDLERS")
        self.logger.info("CREATING HANDLERS")
        self.interop = InteropHandler(self, config=self.config)
        self.interop_telem_thread = self.plane_thread = self.retreive_image_thread = None
        if self.config["uav"]["telemetry"]["dummy"]:
            self.uav = DummyUAVHandler(self, self.config)
        else:
            self.uav = UAVHandler(self, self.config)
        self.image = ImageHandler(self, self.config)

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
        print("╚═══ CREATED HANDLERS\n")
        self.logger.info("CREATED HANDLERS\n")

        print("╔═══ INITIALIZING HANDLERS")
        self.logger.info("INITIALIZING HANDLERS")
        self.interop.login()
        time.sleep(1)
        self.uav.connect()
        self.image.initialize()
        print("╚═══ INITIALIZED HANDLERS\n")
        self.logger.info("INITIALIZED HANDLERS\n")

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
        if not self.config["uav"]["images"]["dummy"]:  # Initialize a socket connection
            self.image.socket_connect()
        else:  # Use a dummy connection
            while True:
                run = self.image.retreive_images()
                if run:
                    self.logger.info("[Image] Successfully identified ODLC from Image")
                time.sleep(0.1)

    def async_calls(self):
        print("╔═══ STARTING ASYNC THREADS")
        self.logger.info("STARTING ASYNC THREADS")
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
        print("╠ STARTED TELEMETRY THREAD")
        self.logger.info("STARTED TELEMETRY THREAD")

        self.plane_thread.start()
        print("╠ STARTED UAV THREAD")
        self.logger.info("STARTED UAV THREAD")

        self.retreive_image_thread.start()
        print("╠ STARTED IMAGE THREAD")
        self.logger.info("STARTED IMAGE THREAD")

        print("╚═══ STARTED ASYNC THREADS\n")
        self.logger.info("STARTED ASYNC THREADS\n")

    # Calls a function from self.func_map, with the provided parameters
    def call(self, func, *args, log=True):
        result = self.func_map[func](*args)
        if log:
            self.logger.log(logging.DEBUG, func + ": " + json.dumps(result, default=str))
        return result
