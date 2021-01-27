import random, math, pygame
from pygame.locals import *
from math import pi, sin, cos, acos, sqrt, atan2
from geopy import distance
import functools

#constants
XDIM = 640
YDIM = 480
WINSIZE = [XDIM, YDIM]
EPSILON = 7.0
NUMNODES = 10000

base_lat = 38.147250  # base coords from AUVSI rules
base_long = -76.426444

obstacle_list = []

# constants in METERS
# waypoint precision
# rho is inversely related to speed of algorithm
precision = 30
rho = 10

# buffer zone around obstacles
# set this based off GPS accuracy
radius_tolerance = 0
height_tolerance = 50

MAX_RELATIVE_BANK = pi/6
MAX_RELATIVE_PITCH = pi/12

dPhi = pi/12
dTheta = pi/12
MIN_PHI = 0
MAX_PHI = pi

class Obstacle():
    # obstacle at x,y with radius r
    def __init__(self, lat, lon, z, r):
        self.lat = lat
        self.lon = lon
        self.z = z
        self.r = r

    # for debugging
    def __str__(self):
        return "Center: ({}. {}), Radius: {}".format(round(self.lat, 3), round(self.lon, 3), round(self.r, 3))

    def inMe(self, lat, lon, z):
        global radius_tolerance, height_tolerance
        return dist((self.lat, self.lon), (lat, lon))<=(self.r+radius_tolerance) and z<=(self.z+height_tolerance)
    
    def KMLFriendly(self):
        return [self.lat, self.lon, self.z]

@functools.total_ordering
class Node():
    def __init__(self, lat, lon, z=100, parent=None, theta=0, phi=pi/2):
        self.lat, self.lon, self.z = lat, lon, z
        self.parent = parent 
        self.phi = phi
        self.theta = theta
    def setF(self, f):
        self.f = f
    def dist(self, n):
        # if self != None:
        #     if self.loc() == n.loc():
        #         return 0
        # return (great_circle_dist(self.lat, self.lon, n.lat, n.lon) **2 + (n.z-self.z)**2)**0.5
        return sqrt(((self.lon-n.lon)**2)+((self.lat-n.lat)**2))
    def loc(self):
        return [self.lat,self.lon,self.z]
    def getHeading(self):
        if self.parent != None:
            return atan2(self.lat - self.parent.lat, self.lon - self.parent.lon)
    def __hash__(self):
        return int(self.lat*100000000)+int(self.lon)
    # def nbrs(self, goal):
    #     nodes = []
    #     i = 0
    #     while i < NUMNODES:
    #         rand = (random.random()*XDIM, random.random()*YDIM)
    #         nn = nodes[0]
    #         for p in nodes:
    #             if dist(p,rand) < dist(nn,rand):
    #                 nn = p
    #         newnode = step_from_to(nn,rand)
    #         nodes.append(newnode)
    #     #        print i, "    ", nodes
    #         i += 1
    # def __eq__(self, n):
    #     global precision
    #     return self.dist(n)<precision
    def __lt__(self, n):
        return self.f<n.f
    def __str__(self):
        return str(self.loc())

def dist(p1, p2):
    return sqrt((p1[0]-p2[0])*(p1[0]-p2[0])+(p1[1]-p2[1])*(p1[1]-p2[1]))

def great_circle_conv(lat, lon, dN, dE):
    earth_r = 6378137
    dLat = dN/earth_r
    dLon = dE/(earth_r*cos(pi*lat/180))
    return (lat+dLat*180/pi, lon + dLon * 180/pi)

def great_circle_dist(lat1, lon1, lat2, lon2):
    return distance.great_circle((lat1,lon1),(lat2,lon2)).meters

def step_from_to(p1,p2):
    if p1.dist(p2) < EPSILON:
        p2.parent = p1
        return p2
    else:
        theta = atan2(p2.lat-p1.lat,p2.lon-p1.lon)
        return Node(p1.lat + EPSILON*sin(theta), p1.lon + EPSILON*cos(theta), parent=p1)

def writeFile(filename, path):
    write = open(filename, "w+")
    count = 0
    write.write("QGC WPL 110\n")#0\t1\t0\t16\t0\t0\t0\t38.881657\t-77.260719\t118.669998\n")

    for wp in path:
        count += 1
        write.write(str(count) + "\t0\t0\t16\t0.00000000\t0.00000000\t0.00000000\t0.00000000\t" + str(wp[0]) + "\t" + str(wp[1]) + "\t" + "100.0" + "\t1\n")

    write.write(str(count+1)+"\t0\t3\t183\t2.000000\t988.000000\t0.000000\t0.000000\t0.000000\t0.000000\t0.000000\t1\n"+
    str(count+2) + "\t0\t3\t183\t3.000000\t2006.000000\t0.000000\t0.000000\t0.000000\t0.000000\t0.000000\t1\n"+
    str(count+3) + "\t0\t3\t183\t4.000000\t950.000000\t0.000000\t0.000000\t0.000000\t0.000000\t0.000000\t1\n")
    write.close()

def main():
    #initialize and prepare screen
    pygame.init()
    screen = pygame.display.set_mode(WINSIZE)
    pygame.display.set_caption('RRT    TJUAV    January 2021')
    pygame
    white = 255, 240, 200
    black = 20, 20, 40
    red = 255, 0, 0
    screen.fill(black)

    nodes = []
    start = (38.147250, -76.426444)
    goalNode = Node(100, 100)
    # obs_coord = great_circle_conv(start[0], start[1], 50, -50)
    # print(obs_coord)
    # obs = Obstacle(obs_coord[0], obs_coord[1], 100, 30)

    nodes.append(Node(YDIM / 2.0, XDIM / 2.0)) # Start in the center
#    nodes.append((0.0,0.0)) # Start in the corner
    obs = Obstacle(YDIM / 2.0 - 50, XDIM / 2.0 - 50, 100, 30)

    pygame.draw.circle(screen, white, (XDIM / 2.0 - 50, YDIM / 2.0 - 50), 30)

    i = 0
    while i < NUMNODES:
        rand = Node(random.random()*YDIM, random.random()*XDIM)
        nn = nodes[0]
        for p in nodes:
            rand.parent = p
            if p.parent != None:
                if rand.getHeading() - p.getHeading() < MAX_RELATIVE_BANK:
                    if rand.dist(p) < rand.dist(nn):
                        nn = p
        newnode = step_from_to(nn,rand)
        new_loc = newnode.loc()
        # print(obs.inMe(new_loc[0], new_loc[1], 100))
        if not obs.inMe(new_loc[0], new_loc[1], 100):
            if nn.parent == None or abs(newnode.getHeading() - nn.getHeading()) < MAX_RELATIVE_BANK:
                nodes.append(newnode)
                newnode.parent = nn
                pygame.draw.line(screen,white,(nn.lon, nn.lat),(newnode.lon, newnode.lat))
                pygame.display.update()
            #        print i, "    ", nodes
                if goalNode.dist(newnode) < EPSILON:
                    goalNode.parent = newnode
                    break
        i += 1
    
    path = [(goalNode.lat, goalNode.lon)]
    curr = goalNode
    while curr.parent != None:
        par = curr.parent
        path.append((par.lat, par.lon))
        pygame.draw.line(screen,red,(curr.lon, curr.lat),(par.lon, par.lat))
        pygame.display.update()
        curr = par
    path = path[::-1]
    geopath = [start]
    for node in range(len(path) - 1):
        dN = path[node][0] - path[node+1][0]
        dE = path[node+1][1] - path[node][1]
        curr = geopath[-1]
        geopath.append(great_circle_conv(curr[0], curr[1], dN, dE))

    print(geopath)
    writeFile("rrt_points.waypoints", geopath)

    done = 0
    while not done:
        for e in pygame.event.get():
            if e.type == QUIT or (e.type == KEYUP and e.key == K_ESCAPE):
                print("Leaving because you said so\n")
                done = 1
                break

# if python says run, then we should run
if __name__ == '__main__':
    main()