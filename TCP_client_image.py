import socket
import os

IMAGE = "/Users/ramyakannan/Aarya/Basketball.png"

HOST = "127.0.0.1"
PORT = 60000

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((HOST, PORT))

try:
    # open image
    with open(IMAGE, "rb") as file:

        size = os.path.getsize(IMAGE)

        # sending image size to server
        s.sendall(bytearray(("SIZE " + str(size)), "utf8"))
        answer = s.recv(4096)
        answer = answer.decode("utf8")
        print(f"answer = {answer}")

        # send image to server
        while True:
            data = file.read(10000)
            if not data:
                break

            s.sendall(data)

        answer = s.recv(4096)
        print(answer.decode("utf8"))
finally:
    pass
    # s.close
