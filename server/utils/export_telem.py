import os.path
import shutil
import sys

if not os.path.exists(os.path.join(os.getcwd(), "logs", "telem.log")):
    with open(os.path.join(os.getcwd(), "logs", "telem.log"), "x", encoding="utf-8") as f:
        pass
    print("telem.log not found - created")
    sys.exit()

with open(os.path.join(os.getcwd(), "logs", "telem.log"), "r", encoding="utf-8") as file:
    line1: str = file.readline()
    if not line1:
        print("telem.log is empty")
        sys.exit()
    timestamp: str = (
        line1.split(";")[0].split(",")[0].replace(" ", "T").replace("-", "_").replace(":", ".")
    )
    shutil.copyfile("logs/telem.log", f"logs/telem_{timestamp}.log")
