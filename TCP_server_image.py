import socket

HOST = "127.0.0.1"
PORT = 60000

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.bind((HOST, PORT))
s.listen()
print("Starting")
conn, addr = s.accept()
print(conn)

try:
    # Making a new image file
    with open("/Users/ramyakannan/Aarya/ReceivedFile.png", "wb") as file:

        # receving size of the picture
        data = conn.recv(4096)
        txt = data.decode("utf8")
        tmp = txt.split()
        size = int(tmp[1])
        print("Size: " + str(size))
        conn.sendall(b"GOT SIZE")

        # Receiving bits of the picture and putting them together in a different file.
        btsrecvd = 0
        while True:
            data = conn.recv(10000)
            btsrecvd += len(data)
            file.write(data)

            if btsrecvd == size:
                conn.sendall(b"GOT ENTIRE IMAGE")
                print("Recieved entire image")
                break
finally:
    conn.close()
