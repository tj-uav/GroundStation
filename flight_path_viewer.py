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
        prog="UAV flight path generator",
        description="Generates a KML file from a TJUAV log file",
    )
    a.add_argument("in_file", default=None)
    a.add_argument("out_file", default=None)
    args = a.parse_args()
    in_file = args.in_file or stdin
    out_file = args.out_file or stdout
    with open(in_file, "r") as f:
        lines = read_log_file(f)

    # print(k.to_string(prettyprint=True))
    k = gen_doc(lines)
    with open(out_file, "w") as f:
        f.write(k.to_string(prettyprint=True))


if __name__ == "__main__":
    # should_time = False
    # if should_time:
    #     start = time.process_time()
    main()
    # if should_time:
    #     print(f"Finished in {time.process_time() - start:.2f}s")
