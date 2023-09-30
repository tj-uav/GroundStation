import math
import os
import requests  # type: ignore[import]
import time

# useful locations
# WebsterField=38.14469,-76.42799,6.6,315
# StMarysField=38.314622,-76.545611,142,282.3122
# AUVSI_SUAS=38.314622,-76.545611,142,282.3122
# FARM_RC=38.529049,-77.736298,87,253

MAP_DIR = "../client/public/map"  # from server
MAP_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile"
REQUEST_TIMEOUT = 5


def to_radians(angle):
    return angle * math.pi / 180


def convert_to_slippy(lat, lon, zoom):
    lat_rad = to_radians(lat)

    x = to_radians(lon)
    y = math.log(math.tan(lat_rad) + 1 / math.cos(lat_rad))

    x = (1 + x / math.pi) / 2
    y = (1 - y / math.pi) / 2

    x = int(x * (2**zoom))
    y = int(y * (2**zoom))

    return x, y


def download_tiles(lat, lon, side, verbose=False):
    for i in range(0, 19):
        x_start, y_start = convert_to_slippy(lat + 0.5 * side, lon - 0.5 * side, i)
        x_end, y_end = convert_to_slippy(lat - 0.5 * side, lon + 0.5 * side, i)

        for j in range(x_start, x_end + 1):
            directory = f"{MAP_DIR}/{i}/{j}"
            if not os.path.exists(directory):
                os.makedirs(f"{MAP_DIR}/{i}/{j}")

            for k in range(y_start, y_end + 1):
                filename = f"{MAP_DIR}/{i}/{j}/{k}.png"
                if os.path.isfile(filename):
                    print(f"Skipped: [zoom: {i}, x: {j}, y: {k}]\n" if verbose else "-", end="")
                    continue

                url = f"{MAP_URL}/{i}/{k}/{j}.png"
                r = requests.get(url, allow_redirects=False, timeout=REQUEST_TIMEOUT)

                with open(filename, "wb") as file:
                    file.write(r.content)

                print(f"Downloaded: [zoom: {i}, x: {j}, y: {k}]\n" if verbose else "*", end="")

                time.sleep(1 / 2000)


def main():
    lat = 38.1458611
    lon = -76.428038
    side = 0.032

    lat_in = input("Latitude of center? [default: " + str(lat) + "] ")
    if lat_in != "":
        lat = float(lat_in)

    lon_in = input("Longitude of center? [default: " + str(lon) + "] ")
    if lon_in != "":
        lon = float(lon_in)

    side_in = input("Side length? [default: " + str(side) + "] ")
    if side_in != "":
        side = float(side_in)

    download_tiles(lat, lon, side)


if __name__ == "__main__":
    main()
