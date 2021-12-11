# import os
import sys
import time
from pymavlink import mavutil, mavparm

# https://github.com/ArduPilot/pymavlink/blob/master/mavparm.py
# https://www.ardusub.com/developers/pymavlink.html

LAST_PARAM_ID = "TKOFF_DIST"

"""
Read in all params from target system (Pixhawk)
Params list gets saved to master.params, a dictionary containing {"param_name": param_value}
"""


def read_all_params(master: mavutil.mavfile):
    master.param_fetch_all()
    while True:
        time.sleep(0.01)
        try:
            message = master.recv_match(type="PARAM_VALUE", blocking=True, timeout=1)
            if message is None:
                break
            param_name = message.param_id
        except Exception as e:
            print(e)
            sys.exit(0)

    assert param_name == LAST_PARAM_ID


"""
Read in a single param from target system (Pixhawk)
Returns None if param not found else {"param_name": param_value}
"""


def read_single_param(master: mavutil.mavfile, name: "str") -> dict:
    master.param_fetch_one(name)
    # TODO: Check if this automatically updates master.params
    message = master.recv_match(type="PARAM_VALUE", blocking=True, timeout=1)
    if message is None:
        return None
    return {message.param_id: message.param_value}


"""
Load params from a file into a dictionary
Returns None if filepath doesn"t exist, otherwise returns dictionary
"""


def load_file(filepath):
    mavparm_handler = mavparm.MAVParmDict()
    mavparm_handler.load(filepath)
    return dict(mavparm_handler)


def diff(filepath1, filepath2):
    handler1 = mavparm.MAVParmDict()
    if filepath2 is not None:
        handler1 = load_file(filepath1)
    handler1.diff(filepath1)


def save_params(filepath):
    pass


"""
Read a single param to the target system (Pixhawk)
Returns True if the param write succeeded otherwise False
"""


def write_param(master, name, value, param_type) -> bool:
    mavparm_handler = mavparm.MAVParmDict()
    return mavparm_handler.mavset(master, name, value, param_type)
