import math
import os
import requests
import time

# https://tile.openstreetmap.org/{z}/{x}/{y}.png

# window position and zoom for the auvsi suas base, webster field
# zoom 17
# top lat: 38.15163
# bot lat: 38.14177

def main():
    lon = -76.428038
    lat = 38.1458611
    deg_distance = 0.016
    zoom = 17

    lon_in = input("Longitude of center? [default: " + str(lon) + "] ")
    if lon_in != "":
        lon = float(lon_in)

    lat_in = input("Latitude of center? [default: " + str(lat) + "] ")
    if lat_in != "":
        lat = float(lat_in)

    zoom_deg_in = input("Zoom and degree? [default: " + str(zoom) + " " + str(deg_distance) + "] ")
    if zoom_deg_in != "":
        zoom_in, deg_in = zoom_deg_in.split()
        if zoom_in != "" and deg_in != "":
            zoom = int(zoom_in)
            deg_distance = float(deg_in)

    print()
    for i in range(9, 19):
        zoom_deg = deg_distance * (2**(zoom - i))
        # assuming in northwest hemisphere
        x1, y1 = convert_to_slippy(lat + deg_distance, lon - deg_distance, i)
        x2, y2 = convert_to_slippy(lat - deg_distance, lon + deg_distance, i)

        for j in range(x1, x2 + 1):
            for k in range(y1, y2 + 1):
                if not os.path.isfile(f"./map/{i}/{j}/{k}.png"):
                    if not os.path.exists(f"./map/{i}/{j}"):
                        os.makedirs(f"./map/{i}/{j}")

                    print("Downloading: [x: " + str(j) + ", y: " + str(k) + ", zoom: " + str(i) + "]")
                    url = f"https://tile.openstreetmap.org/{i}/{j}/{k}.png"
                    r = requests.get(url, allow_redirects=False)
                    file = open(f"./map/{i}/{j}/{k}.png", "wb")
                    file.write(r.content)
                    file.close()

                    time.sleep(1/1000)

def convert_to_slippy(lat, lon, zoom):
    x = lon*math.pi/180
    y = math.log(math.tan(lat*math.pi/180) + 1/math.cos(lat*math.pi/180)) # natural log

    x = (1 + x/math.pi)/2
    y = (1 - y/math.pi)/2

    x = int(x * (2**zoom))
    y = int(y * (2**zoom))

    return (x, y)

if __name__ == "__main__":
    main()