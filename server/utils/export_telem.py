import shutil

with open("../logs/telem.log", "r", encoding="utf-8") as file:
    line1: str = file.readline()
    timestamp: str = (
        line1.split(";")[0].split(",")[0].replace(" ", "T").replace("-", "_").replace(":", ".")
    )
    shutil.copyfile("../logs/telem.log", f"logs/telem_{timestamp}.log")
