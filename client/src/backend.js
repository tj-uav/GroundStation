import axios from 'axios'
import { makeWaypointFile } from './helper.js'

const httpget = async (endpoint, func) => {
  axios.get(endpoint, {
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  }).then(function (response) {
    func(response);
  });
}

const load = (filetype) => {
  console.log("Loading " + filetype);
  return [[50, 60], [70, 80]]
}

const save = (filetype, data) => {
  console.log("Saving " + data + " to " + filetype);
  if (filetype === "waypoints") {
    makeWaypointFile(data)
  }
}

const read = (filetype) => {
  console.log("Reading " + filetype);
  return [[10, 20], [30, 40]]
}

const write = (filetype, data) => {
  console.log("Writing " + data + " to " + filetype);
}


export { httpget, load, save, read, write };