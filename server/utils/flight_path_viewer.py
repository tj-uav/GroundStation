from datetime import datetime
from json import loads
from fastkml import kml, geometry
import argparse
from sys import stdin, stdout


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
    try:
        in_file = open(args.in_file, "r") if args.in_file else stdin
    except FileNotFoundError:
        print("input file does not exist")
        exit(1)
    try:
        out_file = open(args.out_file, "w") if args.out_file else stdout
    except FileNotFoundError:
        print("output file does not exist")
        exit(2)

    try:
        lines = read_log_file(in_file)
    except Exception as e:
        print(f"input file format error: {e}")
        exit(3)
    try:
        k = gen_doc(lines)
    except Exception:
        print("input file format error: incorrect JSON format")
        exit(4)
    out_file.write(k.to_string(prettyprint=True))


if __name__ == "__main__":
    main()
