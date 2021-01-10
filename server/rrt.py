import random, math, pygame
from pygame.locals import *
from math import pi, sin, cos, acos, sqrt, atan2
import functools

#constants
XDIM = 640
YDIM = 480
WINSIZE = [XDIM, YDIM]
EPSILON = 7.0
NUMNODES = 5000

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

MAX_RELATIVE_BANK = pi/12
MAX_RELATIVE_PITCH = pi/12

dPhi = pi/12
dTheta = pi/12
MIN_PHI = 0
MAX_PHI = pi

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

def dist(p1, p2):
    return sqrt((p1[0]-p2[0])*(p1[0]-p2[0])+(p1[1]-p2[1])*(p1[1]-p2[1]))

def step_from_to(p1,p2):
    if p1.dist(p2) < EPSILON:
        return p2
    else:
        theta = atan2(p2.lat-p1.lat,p2.lon-p1.lon)
        return Node(p1.lat + EPSILON*sin(theta), p1.lon + EPSILON*cos(theta))

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
    goal = Node(100, 100)

    nodes.append(Node(YDIM / 2.0, XDIM / 2.0)) # Start in the center
#    nodes.append((0.0,0.0)) # Start in the corner

    i = 0
    while i < NUMNODES:
        rand = Node(random.random()*YDIM, random.random()*XDIM)
        nn = nodes[0]
        for p in nodes:
            if rand.dist(p) < rand.dist(nn):
                nn = p
        newnode = step_from_to(nn,rand)
        nodes.append(newnode)
        newnode.parent = nn
        pygame.draw.line(screen,white,(nn.lon, nn.lat),(newnode.lon, newnode.lat))
        pygame.display.update()
    #        print i, "    ", nodes
        if goal.dist(newnode) < 20.0:
            goal.parent = newnode
            break
        i += 1
    
    path = [(goal.lon, goal.lat)]
    curr = goal
    while curr.parent != None:
        par = curr.parent
        path.append((par.lon, par.lat))
        pygame.draw.line(screen,red,(curr.lon, curr.lat),(par.lon, par.lat))
        pygame.display.update()
        curr = par
    print(path)

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