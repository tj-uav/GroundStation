import os

map_images = os.path.join(os.getcwd() + "/assets/map_images")
odlc_images = os.path.join(os.getcwd() + "/assets/odlc_images")

for direc in [map_images, odlc_images]:
    for file in os.listdir(direc):
        if file != "sample.png":
            os.remove(os.path.join(direc, file))
