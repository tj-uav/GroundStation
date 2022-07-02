import json
import re

import requests

CAMEL_TO_SNAKE_PATTERN = re.compile(r"(?<!^)(?=[A-Z])")
REMOVE_CURLY_BRACES_PATTERN = re.compile(r"[{\[].*?[}\]]")
NESTED_GROUPS = ('TKOFF_', 'LAND_', 'BATT', 'BRD_', 'GPS', 'COMPASS_', 'CAN_', 'RC', 'Q_', 'INS_', 'SIM_', 'RPM', 'OSD', 'BARO', 'SERVO', 'RNGFND', 'EK3_')
NESTED_GROUPS_2 = ('RC', 'Q_', 'OSD6_', 'CAN_D3_', 'TKOFF_', 'RPM', 'GPS', 'CAN_D1_', 'COMPASS_', 'EK3_', 'CAN_D2_', 'BATT', 'LAND_', 'OSD', 'OSD5_', 'RNGFND', 'INS_', 'BRD_', 'BARO', 'SIM_', 'SERVO', 'CAN_')


def camel_to_snake(name_in_camel):
    return CAMEL_TO_SNAKE_PATTERN.sub("_", name_in_camel).lower()


def remove_curly_braces(name_with_curly):
    return REMOVE_CURLY_BRACES_PATTERN.sub("", name_with_curly)


url = "https://raw.githubusercontent.com/ArduPilot/ardupilot/5bf7331f979859d73116d1cabb185f946ca4d28d"

# if input_url := input("Enter URL to https://github.com/ArduPilot/ardupilot as a raw.githubusercontent.com URL (leave blank to use ArduPlane 4.2.0): ") != "":
#     url = input_url

files = {}

current_file = ""
current_filename = ""

print("╔═══ EXPANDING PARAMETERS")

initial_file = requests.get(url + "/ArduPlane/Parameters.cpp").text.split("\n")
for line in initial_file:
    if "@" not in line:
        continue
    if "@Group: " in line:
        current_file = line.split("@Group: ")[1]
    if "@Path: " in line:
        current_filenames = line.split("@Path: ")[1].split(",")
        for x, filename in enumerate(current_filenames):
            if filename[:2] == "..":
                current_filenames[x] = filename[2:]
            else:
                current_filenames[x] = "/ArduPlane/" + filename
        files[current_file] = current_filenames

nested_files = {}

for file_group in NESTED_GROUPS:
    nested_files[file_group] = files[file_group]

for name, filenames in nested_files.items():
    print(f"╠ Expanding parameters in {name}")
    for filename in filenames:
        file = requests.get(url + filename).text.split("\n")
        for line in file:
            if "@" not in line:
                continue
            if "@Group: " in line:
                current_file = name + line.split("@Group: ")[1]
            if "@Path: " in line:
                current_filenames = line.split("@Path: ")[1].split(",")
                for x, innerfilename in enumerate(current_filenames):
                    if innerfilename[:2] == "..":
                        current_filenames[x] = filename.rsplit("/", 2)[0] + innerfilename[2:]
                    elif innerfilename[:1] == ".":
                        current_filenames[x] = filename.rsplit("/", 1)[0] + "/" + innerfilename[1:]
                    else:
                        current_filenames[x] = filename.rsplit("/", 1)[0] + "/" + innerfilename
                files[current_file] = current_filenames

nested_files = {}

for file_group in NESTED_GROUPS_2:
    nested_files[file_group] = files[file_group]

for name, filenames in nested_files.items():
    print(f"╠ Expanding parameters in {name}")
    for filename in filenames:
        file = requests.get(url + filename).text.split("\n")
        for line in file:
            if "@" not in line:
                continue
            if "@Group: " in line:
                current_file = name + line.split("@Group: ")[1]
            if "@Path: " in line:
                current_filenames = line.split("@Path: ")[1].split(",")
                for x, innerfilename in enumerate(current_filenames):
                    if innerfilename[:2] == "..":
                        current_filenames[x] = filename.rsplit("/", 2)[0] + innerfilename[2:]
                    elif innerfilename[:1] == ".":
                        current_filenames[x] = filename.rsplit("/", 1)[0] + "/" + innerfilename[1:]
                    else:
                        current_filenames[x] = filename.rsplit("/", 1)[0] + "/" + innerfilename
                files[current_file] = current_filenames

print("╚═══ EXPANDED PARAMETERS\n\n╔═══ RETRIEVING PARAMETERS")

all_params = {}
current_param_name = ""
current_param = {}

for name, filenames in files.items():
    print(f"╠ Retrieving parameters from {name}")
    current_commandlist = {}
    for filename in filenames:
        file = requests.get(url + filename).text.split("\n")
        for line in file:
            if "@" in line:
                if "{" in line:
                    line = remove_curly_braces(line)
                rest_of_line = line.split("@", 1)[1].split(": ", 1)
                # Main Parameter Definition
                if rest_of_line[0] == "Param":
                    if current_param_name:
                        current_commandlist[name + current_param_name] = current_param
                        current_param = {}
                    current_param_name = rest_of_line[1]
                # Min/Max
                elif rest_of_line[0] == "Range":
                    minimum, maximum = rest_of_line[1].split(" ", 1)
                    current_param["min"] = float(minimum)
                    current_param["max"] = float(maximum)
                # Bitmask and Values
                elif rest_of_line[0] in ("Bitmask", "Values"):
                    vals = rest_of_line[1].split(",")
                    dic = {}
                    for val in vals:
                        value, meaning = val.split(":", 1)
                        dic[float(value)] = meaning
                    current_param[rest_of_line[0].lower()] = dic
                # Float Conversion
                elif rest_of_line[0] == "Increment":
                    current_param["increment"] = float(rest_of_line[1])
                # Boolean Conversion
                elif rest_of_line[0] in ("RebootRequired", "ReadOnly", "Volatile"):
                    current_param["reboot"] = True if rest_of_line[1] == "True" else False
                elif rest_of_line[0] == "User":
                    current_param["advanced"] = True if rest_of_line[1] == "Advanced" else False
                elif rest_of_line[0] == "Calibration":
                    current_param["calibration"] = True if rest_of_line[1] == "1" else False
                # To lowercase
                elif rest_of_line[0] in ("DisplayName", "Description", "Increment", "Units"):
                    current_param[rest_of_line[0].lower()] = rest_of_line[1]
                # To snake case
                elif rest_of_line[0] in ("CopyValuesFrom",):
                    current_param[camel_to_snake(rest_of_line[0])] = rest_of_line[1]
                # Ignore: LoggerMessage
                elif rest_of_line[0] in ("LoggerMessage", "Vehicles", "URL", "Field", "FieldBits"):
                    pass
                # Ignore: Logging file
                elif rest_of_line[0][:3] in ("SYS", "ROM"):
                    pass
                # Ignore: File Header
                elif any(rest_of_line[0].startswith(string) for string in ("file", "brief")):
                    pass
                # Ignore: Type hints
                elif any(rest_of_line[0].startswith(string) for string in ("brief", "returns", "instance", "param", "return")):
                    pass
                else:
                    if rest_of_line[0] in ("Group", "Path"):
                        if name in NESTED_GROUPS or name in NESTED_GROUPS_2:
                            continue
                    if name != "":
                        try:
                            print("╠═", name, "- Unknown line: @" + rest_of_line[0], "=", rest_of_line[1])
                        except IndexError:
                            print("╠═", name, "- Unknown line: " + line.strip())
    if current_commandlist:
        all_params[name] = current_commandlist

print("╚═══ RETRIEVED PARAMETERS\n\n╔═══ SAVING PARAMETERS")

with open("parameters.json", "w") as f:
    json.dump(all_params, f, indent=4)

print("╚═══ SAVED PARAMETERS")
