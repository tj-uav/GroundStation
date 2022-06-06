from dronekit import connect
from dronekit_sitl import SITL


print("Start simulator (SITL)")
sitl = SITL()
sitl.download('plane', '3.3.0', verbose=True)
sitl_args = ['--model', 'quad', ]
sitl.launch(sitl_args, await_ready=True, restart=True)
connection_string = sitl.connection_string()

print(f"Connecting to vehicle on: {connection_string}")
vehicle = connect(connection_string, wait_ready=True)

print(f"Autopilot Firmware version: {vehicle.version}")
print(f"Autopilot capabilities (supports ftp): {vehicle.capabilities.ftp}")
print(f"Global Location: {vehicle.location.global_frame}")
print(f"Global Location (relative altitude): {vehicle.location.global_relative_frame}")
print(f"Local Location: {vehicle.location.local_frame}")
print(f"Attitude: {vehicle.attitude}")
print(f"Velocity: {vehicle.velocity}")
print(f"GPS: {vehicle.gps_0}")
print(f"Groundspeed: {vehicle.groundspeed}")
print(f"Airspeed: {vehicle.airspeed}")
print(f"Gimbal status: {vehicle.gimbal}")
print(f"Battery: {vehicle.battery}")
print(f"EKF OK?: {vehicle.ekf_ok}")
print(f"Last Heartbeat: {vehicle.last_heartbeat}")
print(f"Rangefinder: {vehicle.rangefinder}")
print(f"Rangefinder distance: {vehicle.rangefinder.distance}")
print(f"Rangefinder voltage: {vehicle.rangefinder.voltage}")
print(f"Heading: {vehicle.heading}")
print(f"Is Armable?: {vehicle.is_armable}")
print(f"System status: {vehicle.system_status.state}")
print(f"Mode: {vehicle.mode.name}")
print(f"Armed: {vehicle.armed}")

vehicle.close()

sitl.stop()
print("Completed")
