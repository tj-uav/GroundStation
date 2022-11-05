import json

filename = input("Enter filename to parse: ")

data = {
    "altitude": [float("inf"), 0, 0, 0],
    "altitude_global": [float("inf"), 0, 0, 0],
    "roll": [float("inf"), 0, 0, 0],
    "pitch": [float("inf"), 0, 0, 0],
    "ground_speed": [float("inf"), 0, 0, 0],
    "air_speed": [float("inf"), 0, 0, 0],
    "hdop": [float("inf"), 0, 0, 0],
    "vdop": [float("inf"), 0, 0, 0],
    "satellites": [float("inf"), 0, 0, 0],
}

with open(filename, "r", encoding="utf-8") as telem_file:
    count = 0
    for line in telem_file:
        count += 1
        timestamp, json_data = line.split(";")
        json_obj = json.loads(json_data)["result"]["quick"]

        altitude = json_obj["altitude"]
        altitude_global = json_obj["altitude_global"]
        roll = json_obj["orientation"]["roll"]
        pitch = json_obj["orientation"]["pitch"]
        ground_speed = json_obj["ground_speed"]
        air_speed = json_obj["air_speed"]
        hdop = json_obj["connection"][0]
        vdop = json_obj["connection"][1]
        satellites = json_obj["connection"][2]

        data["altitude"][3] += altitude
        if altitude < data["altitude"][0]:
            data["altitude"][0] = altitude
        if altitude > data["altitude"][2]:
            data["altitude"][2] = altitude
        data["altitude_global"][3] += altitude_global
        if altitude_global < data["altitude_global"][0]:
            data["altitude_global"][0] = altitude_global
        if altitude_global > data["altitude_global"][2]:
            data["altitude_global"][2] = altitude_global
        data["roll"][3] += roll
        if roll < data["roll"][0]:
            data["roll"][0] = roll
        if roll > data["roll"][2]:
            data["roll"][2] = roll
        data["pitch"][3] += pitch
        if pitch < data["pitch"][0]:
            data["pitch"][0] = pitch
        if pitch > data["pitch"][2]:
            data["pitch"][2] = pitch
        data["ground_speed"][3] += ground_speed
        if ground_speed < data["ground_speed"][0]:
            data["ground_speed"][0] = ground_speed
        if ground_speed > data["ground_speed"][2]:
            data["ground_speed"][2] = ground_speed
        data["air_speed"][3] += air_speed
        if air_speed < data["air_speed"][0]:
            data["air_speed"][0] = air_speed
        if air_speed > data["air_speed"][2]:
            data["air_speed"][2] = air_speed
        data["hdop"][3] += hdop
        if hdop < data["hdop"][0]:
            data["hdop"][0] = hdop
        if hdop > data["hdop"][2]:
            data["hdop"][2] = hdop
        data["vdop"][3] += vdop
        if vdop < data["vdop"][0]:
            data["vdop"][0] = vdop
        if vdop > data["vdop"][2]:
            data["vdop"][2] = vdop
        data["satellites"][3] += satellites
        if satellites < data["satellites"][0]:
            data["satellites"][0] = satellites
        if satellites > data["satellites"][2]:
            data["satellites"][2] = satellites

    data["altitude"][1] = data["altitude"][3] // count
    data["altitude_global"][1] = data["altitude_global"][3] // count
    data["roll"][1] = data["roll"][3] // count
    data["pitch"][1] = data["pitch"][3] // count
    data["ground_speed"][1] = data["ground_speed"][3] // count
    data["air_speed"][1] = data["air_speed"][3] // count
    data["hdop"][1] = data["hdop"][3] // count
    data["vdop"][1] = data["vdop"][3] // count
    data["satellites"][1] = data["satellites"][3] // count

print(data)
