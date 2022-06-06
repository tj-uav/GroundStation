import json
import logging
import time
from threading import Thread

import errors
from handlers import DummyUAV, ProdUAV
from handlers import DummyUGV, ProdUGV
from handlers import Interop, Image


class GroundStation:
    def __init__(self):
        self.logger = logging.getLogger("main")
        with open("config.json", "r", encoding="utf-8") as file:
            self.config = json.load(file)

        print("╔══ CREATING HANDLERS")
        self.logger.info("CREATING HANDLERS")

        self.interop_telem_thread = self.plane_thread = self.rover_thread = \
            self.retreive_image_thread = None

        self.interop = Interop(self, config=self.config)
        self.image = Image(self, self.config)

        uavconfig = self.config["uav"]["telemetry"]["type"]
        self.uav = DummyUAV if uavconfig == "dummy" else ProdUAV
        self.uav = self.uav(self, self.config)

        ugvconfig = self.config["ugv"]["telemetry"]["type"]
        self.ugv = DummyUGV if ugvconfig == "dummy" else ProdUGV
        self.ugv = self.ugv(self, self.config)

        print("╚═══ CREATED HANDLERS\n")
        self.logger.info("CREATED HANDLERS\n")


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

            "uav_connect": self.uav.connect,
            "uav_update": self.uav.update,
            "uav_quick": self.uav.quick,
            "uav_stats": self.uav.stats,

            "uav_getflightmode": self.uav.get_flight_mode,
            "uav_setflightmode": self.uav.set_flight_mode,  # flightmode

            "uav_getparam": self.uav.get_param,  # key
            "uav_setparam": self.uav.set_param,  # key, value
            "uav_getparams": self.uav.get_params,
            "uav_setparams": self.uav.set_params,  # kwargs
            "uav_saveparams": self.uav.save_params,
            "uav_loadparams": self.uav.load_params,

            "uav_getcommands": self.uav.get_commands,
            "uav_insertcommand": self.uav.insert_command,  # command, lat, lon, alt
            "uav_jumpcommand": self.uav.jump_to_command,  # command
            "uav_clearcommands": self.uav.clear_commands,

            "uav_getarmed": self.uav.get_armed,
            "uav_arm": self.uav.arm,
            "uav_disarm": self.uav.disarm,

            "ugv_connect": self.ugv.connect,
            "ugv_update": self.ugv.update,
            "ugv_quick": self.ugv.quick,
            "ugv_stats": self.ugv.stats,

            "ugv_getflightmode": self.ugv.get_flight_mode,
            "ugv_setflightmode": self.ugv.set_flight_mode,  # flightmode

            "ugv_getparam": self.ugv.get_param,  # key
            "ugv_setparam": self.ugv.set_param,  # key, value
            "ugv_getparams": self.ugv.get_params,
            "ugv_setparams": self.ugv.set_params,  # kwargs
            "ugv_saveparams": self.ugv.save_params,
            "ugv_loadparams": self.ugv.load_params,

            "ugv_getcommands": self.ugv.get_commands,
            "ugv_insertcommand": self.ugv.insert_command,  # command, lat, lon, alt
            "ugv_clearcommands": self.ugv.clear_mission,

            "ugv_getarmed": self.ugv.get_armed,
            "ugv_arm": self.ugv.arm,
            "ugv_disarm": self.ugv.disarm,

            "cv_process": self.image.process_image
        }

        print("╔═══ INITIALIZING HANDLERS")
        self.logger.info("INITIALIZING HANDLERS")
        self.interop.login()
        time.sleep(1)
        self.uav.connect()
        self.ugv.connect()
        self.image.initialize()
        print("╚═══ INITIALIZED HANDLERS\n")
        self.logger.info("INITIALIZED HANDLERS\n")

        self.async_calls()

    def telemetry_thread(self):
        while True:
            if not self.interop.login_status:  # Connection to Interop Server is already lost
                try:
                    self.interop.login()  # Re-initiate connection
                    self.logger.important("[Telemetry] Re-initiated connection with Interop Server")
                except errors.ServiceUnavailableError:
                    self.logger.info("[Telemetry] Unable to re-initiate connection with Interop "
                                     "Server, retrying in one second")
                time.sleep(1)
                continue

            try:
                run = self.interop.submit_telemetry()
            except errors.ServiceUnavailableError:  # Lost connection to Interop
                self.logger.critical("[Telemetry] Lost connection to Interop Server, attempting to "
                                     "re-initiate connection every second")
                continue

            if run:
                self.logger.debug("[Telemetry] %s", run)
            time.sleep(0.1)

    def uav_thread(self):
        while True:
            run = self.uav.update()
            if run:
                self.logger.debug("[UAV] %s", run)
            time.sleep(0.1)

    def ugv_thread(self):
        while True:
            run = self.ugv.update()
            if run:
                self.logger.debug("[UGV] %s", run)
            time.sleep(0.1)

    def image_thread(self):
        if not self.config["uav"]["images"]["type"] == "prod":  # Initialize a socket connection
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

        self.rover_thread = Thread(target=self.ugv_thread)
        self.rover_thread.name = "UGVThread"
        self.rover_thread.daemon = True

        self.retreive_image_thread = Thread(target=self.image_thread)
        self.retreive_image_thread.name = "ImageThread"
        self.retreive_image_thread.daemon = True

        self.interop_telem_thread.start()
        print("╠ STARTED TELEMETRY THREAD")
        self.logger.info("STARTED TELEMETRY THREAD")

        self.plane_thread.start()
        print("╠ STARTED UAV THREAD")
        self.logger.info("STARTED UAV THREAD")

        self.rover_thread.start()
        print("╠ STARTED UGV THREAD")
        self.logger.info("STARTED UGV THREAD")

        self.retreive_image_thread.start()
        print("╠ STARTED IMAGE THREAD")
        self.logger.info("STARTED IMAGE THREAD")

        print("╚═══ STARTED ASYNC THREADS\n")
        self.logger.info("STARTED ASYNC THREADS\n")

    # Calls a function from self.func_map, with the provided parameters
    def call(self, func, *args, log=True):
        result = self.func_map[func](*args)
        if log and self.config["debug_log"]:
            self.logger.log(logging.DEBUG, func + ": " + json.dumps(result, default=str))
        return result
