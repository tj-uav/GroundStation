import collections
import logging
from io import TextIOBase
from typing import Any


# https://stackoverflow.com/a/37952182/11317931
class FIFOIO(TextIOBase):
    def __init__(self, size, *args):
        self.maxsize = size
        TextIOBase.__init__(self, *args)
        self.deque = collections.deque()

    def getvalue(self):
        return list(filter(None, map(str.strip, "".join(self.deque).split("\n"))))[::-1]

    def write(self, x):
        self.deque.append(x)
        self.shrink()

    def shrink(self):
        if self.maxsize is None:
            return
        size = len(self.deque)
        while size > self.maxsize:
            x = self.deque.popleft()
            size -= len(x)


def log_level(self, message: Any, *args, **kwargs):
    # disable pylint checks for using `self._log`
    # pylint: disable=W0212
    if self.isEnabledFor(logging.INFO + 5):
        self._log(logging.INFO + 5, message, args, **kwargs)


def log_root(message: Any, *args, **kwargs):
    logging.log(logging.INFO + 5, message, *args, **kwargs)


logging.addLevelName(logging.INFO + 5, "IMPORTANT")
setattr(logging, "IMPORTANT", logging.INFO + 5)
setattr(logging.getLoggerClass(), "important", log_level)
setattr(logging, "important", log_root)

logger: logging.Logger = logging.getLogger("groundstation")
logger.setLevel(logging.DEBUG)

autopilot: logging.Logger = logging.getLogger("autopilot")
autopilot.setLevel(logging.DEBUG)

telemetry: logging.Logger = logging.getLogger("telemetry")
telemetry.setLevel(logging.INFO)

formatter: logging.Formatter = logging.Formatter(
    "[%(levelname)-9s] (%(name)-13s) %(asctime)s  %(message)-500s"
)
telem_formatter = logging.Formatter("%(asctime)s;%(message)s")

# console_handler = logging.StreamHandler(sys.stdout)
# console_handler.setLevel(logging.IMPORTANT)
# console_handler.setFormatter(formatter)
# logger.addHandler(console_handler)

file_handler: logging.FileHandler = logging.FileHandler("logs/info.log", mode="w")
file_handler.setLevel(logging.INFO)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)
autopilot.addHandler(file_handler)

debug_file_handler: logging.FileHandler = logging.FileHandler("logs/debug.log", mode="w")
debug_file_handler.setLevel(logging.DEBUG)
debug_file_handler.setFormatter(formatter)
logger.addHandler(debug_file_handler)
autopilot.addHandler(debug_file_handler)

telem_file_handler: logging.FileHandler = logging.FileHandler("logs/telem.log", mode="w")
telem_file_handler.setLevel(logging.INFO)
telem_file_handler.setFormatter(telem_formatter)
telemetry.addHandler(telem_file_handler)

ROLLING_LOGS: FIFOIO = FIFOIO(10)
string_handler: logging.StreamHandler = logging.StreamHandler(ROLLING_LOGS)
string_handler.setLevel(logging.INFO)
string_handler.setFormatter(formatter)
logger.addHandler(string_handler)
autopilot.addHandler(string_handler)

logger.info("STARTED LOGGING")
