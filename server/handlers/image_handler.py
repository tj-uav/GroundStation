from random import random, randint, choice
import string


class ImageHandler:
    def __init__(self, gs):
        self.gs = gs

    def retreive_images(self):
        # Retreives Image from UAV
        if random() < 0.05:  # Average of 2 seconds
            img = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII="
            return self.process_image(img)  # Dummy Image

    def process_image(self, image):
        if random() < 0.05:
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
            return "New ODLC Detected"
