from pymavlink import mavutil

# https://github.com/ArduPilot/pymavlink/blob/master/mavparm.py
# https://www.ardusub.com/developers/pymavlink.html

LAST_PARAM_ID = 'TKOFF_DIST'

"""
Read in all params from target system (Pixhawk)
Params list gets saved to master.params, which is a dictionary containing {'param_name': param_value}
"""
def read_all_params(master: mavutil.mavfile):
    master.param_fetch_all()
    while True:
        time.sleep(0.01)
        try:
            message = master.recv_match(type='PARAM_VALUE', blocking=True, timeout=1)
            if message is None:
                break
            param_name = message.to_dict()['param_id']
        except Exception as e:
            print(e)
            exit(0)

    assert(param_name == LAST_PARAM_ID)


"""
Read in a single param from target system (Pixhawk)
Returns None if param not found else {'param_name': param_value}
"""
def read_single_param(master: mavutil.mavfile, name: 'str') -> dict:
    master.param_fetch_one(name)
    # TODO: Check if this automatically updates master.params
    message = master.recv_match(type='PARAM_VALUE', blocking=True, timeout=1)
    if message is None:
        # Invalid parameter name, so return None
        return None
    message = message.to_dict()
    return {message['param_id']: message['param_value']}


def load_file(filename):
    # TODO: Load params from file
    return


def compare_files(filename1, filename2):
    params1 = load_file(filename1)
    params2 = load_file(filename2)
    # TODO: Compare the params
    return


"""
Read a single param to the target system (Pixhawk)
Returns True if the write succeeded otherwise False
"""
def write_param(mav, name, value, param_type) -> bool:
    master.param_set_send(name, value, param_type)

    message = master.recv_match(type='PARAM_VALUE', blocking=True)
    if message is None:
        print("Unable to write param value")
        return False
    message = message.to_dict()
    assert(message['param_id'] == name)
    if message['param_value'] != value:
        print("Read check after writing param failed")
        return False
    return True
    # TODO: Read the param again to confirm that the write worked
