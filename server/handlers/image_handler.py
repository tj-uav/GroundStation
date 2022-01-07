import logging
import socket
from random import random, randint, choice
import string


class ImageHandler:
    def __init__(self, gs, config):
        self.logger = logging.getLogger("main")
        self.gs = gs
        self.config = config
        print("╠ CREATED IMAGE HANDLER")
        self.logger.info("╠ CREATED IMAGE HANDLER")

    def socket_connect(self):
        while True:  # Restart the socket connection on disconnect
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind((self.config["uav"]["images"]["host"], self.config["uav"]["images"]["port"]))
                s.listen()
                conn, addr = s.accept()
                with conn:
                    self.logger.critical("[Image] Socket connection established with %s:%s", *addr)
                    curr_image = ""
                    while True:
                        resp = conn.recv(4096)
                        if not resp:
                            break
                        resp = resp.decode("utf-8")
                        loc = resp.find(" ")
                        if loc != -1:
                            curr_image += resp[:loc]
                            res = self.gs.image.process_image(curr_image)
                            curr_image = resp[loc + 1:]
                            self.logger.debug("[Image] Successfully retreived image from socket")
                            if res:
                                self.logger.info("[Image] Successfully identified ODLC from Image")
                            conn.sendall(bytes("Image Complete", "utf-8"))
                        else:
                            curr_image += resp
                    self.logger.critical("[Image] Lost socket connection with %s:%s", *addr)

    # When socket connection is not used
    def retreive_images(self):
        # Retreives Image from UAV
        if random() < 0.05:  # Average of 2 seconds
            img = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII="
            return self.process_image(img)  # Dummy Image

    def process_image(self, image):
        if random() < 0.05:  # 5% chance that the image is of an ODLC
            # Dummy Data
            self.gs.call("i_odlcadd",
                         image,
                         "standard",
                         random() * 90,
                         random() * -90,
                         randint(0, 360),
                         choice(['circle', 'semicircle', 'quarter_circle', 'triangle', 'square', 'rectangle', 'trapezoid', 'pentagon', 'hexagon', 'heptagon', 'octagon', 'star', 'cross']),
                         choice(['white', 'gray', 'red', 'blue', 'green', 'yellow', 'purple', 'brown', 'orange']),
                         choice(string.ascii_uppercase + string.digits),
                         choice(['white', 'gray', 'red', 'blue', 'green', 'yellow', 'purple', 'brown', 'orange']),
                         log=False
                         )
            return True
