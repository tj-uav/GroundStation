import json
import time
from threading import Thread

from interop_handler import InteropHandler
from uav_handler import UAVHandler
from dummy_uav_handler import DummyUAVHandler


class GroundStation:

    def __init__(self, socket):
        with open("config.json", "r") as file:
            self.config = json.load(file)

        self.interop = InteropHandler(self, config=self.config)
        self.interop_telem_thread = self.update_thread = None

        dummy_uav = self.config["uav"]["dummy"]

        if dummy_uav:
            self.uav = DummyUAVHandler(self, self.config, socket)
        else:
            self.uav = UAVHandler(self, self.config, socket)

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
            "m_disarm": self.uav.disarm
        }
        self.uav.connect()

        self.async_calls()

    def telemetry_thread(self):
        while True:
            run = self.interop.submit_telemetry()
            # print("Telemetry:", run)
            time.sleep(0.1)

    def mav_thread(self):
        while True:
            run = self.uav.update()
            # print("MAV:", run)
            time.sleep(0.1)

    def async_calls(self):
        self.interop_telem_thread = Thread(target=self.telemetry_thread)
        self.interop_telem_thread.daemon = True

        self.update_thread = Thread(target=self.mav_thread)
        self.update_thread.daemon = True

        time.sleep(5)
        print("STARTED ASYNC THREADS")
        self.interop_telem_thread.start()
        self.update_thread.start()

    # Calls a function from self.func_map, with the provided parameters
    def call(self, func, *args):
        return self.func_map[func](*args)
