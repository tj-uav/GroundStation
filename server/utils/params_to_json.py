import json
import os

filename = input("Enter filename to parse (in server/assets/params/): ")

with open(
    os.path.join(os.getcwd(), "assets", "params", filename), "r", encoding="utf-8"
) as params_file:
    params = {}
    for line in params_file:
        param, value = line.strip().split(",")
        params[param] = float(value)

    with open(
        os.path.join(os.getcwd(), "assets", "params", "plane.json"), "w", encoding="utf-8"
    ) as params_json_file:
        json.dump(params, params_json_file, indent=4)

print("Saved to plane.json!")
