import os

list_of_directories_to_clean: list = [os.path.join(os.getcwd() + "/assets/images/odlc")]

for direc in list_of_directories_to_clean:
    for file in os.listdir(direc):
        if file != "sample.png":
            os.remove(os.path.join(direc, file))
