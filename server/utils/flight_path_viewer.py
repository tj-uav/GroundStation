from datetime import datetime
from json import loads
from fastkml import kml, geometry
import argparse
from sys import stdin, stdout

LOG_FILE = "flight3_telem_2023_04_16T14.51.15.log"
# color order: alpha, blue, green, red


def read_log_file(f):
    lines = []
    for line in f:
        timestamp, data = line.split(";", 1)
        timestamp = datetime.strptime(timestamp, "%Y-%m-%d %H:%M:%S,%f")
        data = loads(data)["result"]["quick"]
        lines.append((timestamp, data))
    lines.sort()
    return lines


def gen_doc(entries, step=10):
    k = kml.KML()
    d = kml.Document()
    k.append(d)
    path = kml.Folder()
    all_coords = []
    for i in range(0, len(entries), step):
        t, data = entries[i]
        p = kml.Placemark()
        time = kml.TimeStamp()
        time.timestamp = t
        p.timeStamp = time.timestamp
        # print(p.to_string(prettyprint=True))
        pt = (data["lon"], data["lat"], data["altitude"])
        all_coords.append(pt)
        p.geometry = geometry.Geometry(
            geometry=geometry.Point(*pt),
            altitude_mode="relativeToGround",
        )
        path.append(p)
    d.append(path)
    line_path = kml.Placemark(name="UAV flight path")
    line_path.geometry = geometry.Geometry(
        geometry=geometry.LineString(
            all_coords,
        ),
        altitude_mode="relativeToGround",
    )
    d.append(line_path)
    return k


def main():
    a = argparse.ArgumentParser(
        description="Generates a KML file (to load in Google Earth) from a TJUAV log file",
    )
    a.add_argument("in_file", nargs="?", default=None)
    a.add_argument("out_file", nargs="?", default=None)
    args = a.parse_args()
    in_file = open(args.in_file, "r") if args.in_file else stdin
    out_file = open(args.out_file, "w") if args.out_file else stdout
    lines = read_log_file(in_file)

    # print(k.to_string(prettyprint=True))
    k = gen_doc(lines)
    out_file.write(k.to_string(prettyprint=True))


if __name__ == "__main__":
    # should_time = False
    # if should_time:
    #     start = time.process_time()
    main()
    # if should_time:
    #     print(f"Finished in {time.process_time() - start:.2f}s")
