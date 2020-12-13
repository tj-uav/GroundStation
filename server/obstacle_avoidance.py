import matplotlib.pyplot as plt
import numpy as np
import random
import math
from math import pi, sin, cos, acos
from geopy import distance
import functools
import heapq, time, random
import json

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
      return great_circle_dist(self.lat, self.lon, lat, lon)<=(self.r+radius_tolerance) and z<=(self.z+height_tolerance)
   
   def KMLFriendly(self):
      return [self.lat, self.lon, self.z]

@functools.total_ordering
class Node():
   def __init__(self, lat, lon, z, parent=None, theta=0, phi=pi/2):
      self.lat, self.lon, self.z = lat,lon,z
      self.parent = parent 
      self.phi = phi
      self.theta = theta
   def setF(self, f):
      self.f = f
   def dist(self, n):
      if self.loc() == n.loc(): return 0
      return (great_circle_dist(self.lat, self.lon, n.lat, n.lon) **2 + (n.z-self.z)**2)**0.5
   def loc(self):
      return [self.lat,self.lon,self.z]
   def __hash__(self):
      return int(self.lat*100000000)+int(self.lon)
   def nbrs(self, goal):
      global dPhi, dTheta, MAX_RELATIVE_BANK, MAX_RELATIVE_PITCH, obstacle_list
      lst = []
      brng = bearing(*self.loc()[:2], *goal.loc()[:2])
      for dp in np.arange(-MAX_RELATIVE_PITCH, MAX_RELATIVE_PITCH+dPhi, dPhi):
         if self.phi+dp > MAX_PHI or self.phi+dp < MIN_PHI: continue
         if (self.z + rho*cos(self.phi+dp)) > MAX_ALTITUDE or (self.z + rho*cos(self.phi+dp)) < MIN_ALTITUDE: continue
         # if abs(self.theta-brng) < pi/6:
         #    lst.append(Node(*great_circle_conv(self.lat, self.lon, rho*cos(brng)*sin(self.phi+dp),rho*sin(brng)*sin(self.phi+dp)), self.z + rho*cos(self.phi+dp), self,brng, self.phi+dp))
         for dt in np.arange(-MAX_RELATIVE_BANK, MAX_RELATIVE_BANK+dTheta, dTheta):
            lst.append(Node(*great_circle_conv(self.lat, self.lon, rho*cos(self.theta+dt)*sin(self.phi+dp),rho*sin(self.theta+dt)*sin(self.phi+dp)), self.z + rho*cos(self.phi+dp), self,self.theta+dt, self.phi+dp))

      for obs in obstacle_list:  
         good_nodes = lst.copy()
         for ind, node in enumerate(lst):
            if obs.inMe(*node.loc()):
               good_nodes.remove(node)
         lst = good_nodes.copy()
         
            
      return lst
   def __eq__(self, n):
      global precision
      return self.dist(n)<precision
   def __lt__(self, n):
      return self.f<n.f

# Initial lat/lon + distance north/east (m) -> new lat/lon
def great_circle_conv(lat, lon, dN, dE):
   earth_r = 6378137
   dLat = dN/earth_r
   dLon = dE/(earth_r*cos(pi*lat/180))
   return (lat+dLat*180/pi,lon + dLon * 180/pi)

def great_circle_dist(lat1, lon1, lat2, lon2):
   return distance.great_circle((lat1,lon1),(lat2,lon2)).meters

def aStar(root, goal):
   global rho
   root.parent = None
   f = root.dist(goal)
   openSet = [root]
   path = []
   #waypoints.remove(goal.loc())
   closedSet = set()
   num = 0

   while True:
      node = heapq.heappop(openSet)
      if node in closedSet: continue
      closedSet.add(node)
      for nbr in node.nbrs(goal):
         goal.parent = node
         if nbr == goal:
            nbr.lat = goal.lat
            nbr.lon = goal.lon
            nbr.z = goal.z
            while nbr.parent:
               if abs(nbr.theta-nbr.parent.theta) > 1e-10 or nbr.phi != nbr.parent.phi:
                  path.append(nbr.loc())
               nbr = nbr.parent
            return path[::-1]
         nbr.setF(nbr.dist(goal) - node.dist(goal) + f)
         heapq.heappush(openSet, nbr)

def read_mission(config):
   global obstacle_list, MAX_ALTITUDE, MIN_ALTITUDE
   forKML = []
   waypoints = []
   import requests
   s = requests.Session()
   url = "http://192.168.1.43:8000/api/"
   params = {"username": "testadmin", "password": "testpass"}
   id = 7

   # r = s.post(url+"login", json=params)
   # r = s.get(url+"missions/"+str(id))  
   # r = open('mission.txt', 'r').read()
   # waypoints_file = open('obstacle_test.waypoints', 'r').read().splitlines()[1:]
   # mission_dict = json.loads(r)
   #mission_dict = json.loads(r.text)
   MIN_ALTITUDE = config["flyZones"][0]["altitudeMin"]
   MAX_ALTITUDE = config["flyZones"][0]["altitudeMax"]
   for obstacle in config["stationaryObstacles"]:
      lat = obstacle["latitude"]
      lon = obstacle["longitude"]
      height = obstacle["height"] #* 0.3048
      rad = obstacle["radius"] #* 0.3048  # feet to meters 

      obstacle_list += [Obstacle(lat, lon, height, rad)]

   for waypoint in config["waypoints"]:
      #   waypoint = i.split('\t')
        #   lat = waypoint["latitude"]
        #   lon = waypoint["longitude"]
        #   alt = waypoint["altitude"]

        waypoints.append([waypoint["latitude"], waypoint["longitude"], waypoint["altitude"]])
   return waypoints

def bearing(lat1, long1, lat2, long2):
   lat1 *= pi/180
   lat2 *= pi/180
   long1 *= pi/180
   long2 *= pi/180
   y = sin(long2-long1) * cos(lat2)
   x = cos(lat1) * sin(lat2) - sin(lat1)*cos(lat2)*cos(long2-long1)
   return ((math.atan2(y,x)*180/pi + 360) % 360) * pi/180

def generate_final_path(waypoints):
   final_path = []
   for i in range(1,len(waypoints)):
      goal = Node(*waypoints[i], None)
      root = Node(*waypoints[i-1], goal)
      root.theta = bearing(*root.loc()[:2], *goal.loc()[:2])
      final_path += [root.loc()] + aStar(root, goal)
   return final_path

def writeFile(filename, path):
   write = open(filename, "w+")
   count = 0
   write.write("QGC WPL 110\n")#0\t1\t0\t16\t0\t0\t0\t38.881657\t-77.260719\t118.669998\n")

   for wp in path:
      count += 1
      write.write(str(count) + "\t0\t0\t16\t0.00000000\t0.00000000\t0.00000000\t0.00000000\t" + str(wp[0]) + "\t" + str(wp[1]) + "\t" + str(wp[2]) + "\t1\n")

   write.write(str(count+1)+"\t0\t3\t183\t2.000000\t988.000000\t0.000000\t0.000000\t0.000000\t0.000000\t0.000000\t1\n"+
   str(count+2) + "\t0\t3\t183\t3.000000\t2006.000000\t0.000000\t0.000000\t0.000000\t0.000000\t0.000000\t1\n"+
   str(count+3) + "\t0\t3\t183\t4.000000\t950.000000\t0.000000\t0.000000\t0.000000\t0.000000\t0.000000\t1\n")
   write.close()



def plot_output(orig_path, final_path, obstacles):
    from mpl_toolkits.mplot3d import Axes3D
    import matplotlib.pyplot as plt

    fig = plt.figure()
    axes = fig.add_subplot(111, projection="3d")

    X = [i[0] for i in final_path]
    Y = [i[1] for i in final_path]
    Z = [i[2] for i in final_path]

    X_obstacle = [i.lat for i in obstacles]
    Y_obstacle = [i.lon for i in obstacles]
    R_obstacle = [i.r for i in obstacles]

    up = [i.lon + i.r/288200 for i in obstacles]
    down = [i.lon - i.r/288200 for i in obstacles]
    right = [i.lat + i.r/364000 for i in obstacles]
    left = [i.lat - i.r/364000 for i in obstacles]
    top = [i.z + i.r for i in obstacles]
    bottom = [i.z - i.r for i in obstacles]


    
     
    theta = np.linspace(0, 2*np.pi, 100)

    for i in obstacles:

      x_radius = i.r/364000
      y_radius = i.r/288200

      a = x_radius*np.cos(theta) + i.lat
      b = y_radius*np.sin(theta) + i.lon

      axes.plot(a, b, i.z, color="green")

    Z_obstacle = [i.z for i in obstacles]

    axes.scatter(X_obstacle, Y_obstacle, Z_obstacle, color="yellow", marker="o")
    axes.scatter(X_obstacle, up, Z_obstacle, color="green", marker="o")
    axes.scatter(X_obstacle, down, Z_obstacle,color="green", marker="o")
    axes.scatter(left, Y_obstacle, Z_obstacle, color="green", marker="o")
    axes.scatter(right, Y_obstacle, Z_obstacle, color="green", marker="o")
    axes.scatter(X_obstacle, Y_obstacle, top, color="green", marker="o")
    axes.scatter(X_obstacle, Y_obstacle, bottom, color="green", marker="o")

    X_orig = [i[0] for i in orig_path]
    Y_orig = [i[1] for i in orig_path]
    Z_orig = [i[2] for i in orig_path]
    waypoint_plot_sizes = [100 for i in orig_path]

    for i in range(0, len(final_path)):
      plt.plot(X[i:i+2], Y[i:i+2], Z[i:i+2], 'ro-')

    axes.scatter(X_obstacle,Y_obstacle,Z_obstacle, c="y", marker="o")
    axes.scatter(X_orig, Y_orig, Z_orig, color="blue", marker="o", s=waypoint_plot_sizes)

    axes.set_xlabel("Latitude")
    axes.set_ylabel("Longitude")
    axes.set_zlabel("Altitude")

    plt.show()

# creates optimized path to go through waypoints and avoid obstacles without flying above or below them
# outputs this path in optimized.waypoints
# waypoints and obstacles are both passed in inside a config dict
# see mission.txt for a sample config dict

from mp_help import makeKmlFile
def create_optimized_path(config):
   global obstacle_list
   waypoints = read_mission(config)
   writeFile("original.waypoints",waypoints)
   t0 = time.time()
   final_path = generate_final_path(waypoints)

   path_json = {"waypoints" : []}

   for waypoint in final_path:
      path_json["waypoints"].append({
            "latitude": waypoint[0],
            "longitude": waypoint[1],
            "altitude": waypoint[2]
        })

   writeFile("optimized.waypoints",final_path)
   makeKmlFile("obstacles.kml", [obs.KMLFriendly() for obs in obstacle_list])

   return path_json

   # DEBUGGING/TESTING ONLY 

   # for wp in waypoints: print(wp)
   # print()
   # for wp in final_path: print(wp)
   # print(len(final_path), "waypoints")
   # print(round(time.time()-t0, 3), "seconds")
   # plot_output(waypoints, final_path, obstacle_list)

# print(create_optimized_path(json.loads(open('mission.txt', 'r').read())))