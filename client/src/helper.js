const Waypoint = (latitude, longitude, altitude) => {
  return {
    type: 'waypoint',
    lat: latitude,
    lng: longitude,
    alt: altitude
  }
}

const SetServo = (p, signal) => {
  return {
    type: 'set_servo',
    pin: p,
    pwm: signal
  }
}

let commands = { 'waypoint': 16, 'set_servo': 183 }

function makeWaypointFile(array) {
  let result = "QGC WPL 110"

  //variables to store position of last waypoint for different commands
  let current_lat = 0
  let current_lng = 0
  let current_alt = 0
  let a = 0
  let b = 0
  let c = 0
  let d = 0
  let current_wp = 0
  for (let index = 0; index < array.length; index++) {
    console.log(array[index])
    let type = array[index].type //get command type
    let command_number = commands[type] //get associated command number (to be interpreted by MP)
    if (command_number === 16) {
      current_lat = array[index].lat
      current_lng = array[index].lng
      current_alt = array[index].alt
    }
    else if (command_number === 183) {
      a = array[index].pin
      b = array[index].pwm
    }
    let line = index + "\t" + current_wp + "\t0\t" + command_number + "\t" + a + "\t" + b + "\t" + c + "\t" + d + "\t" + current_lat + "\t" + current_lng + "\t" + current_alt + "\t1"//create line describing this waypoint
    result += "\n" + line //add line to result
  }

  // Requiring fs module in which writeFile function is defined.
  const fs = require('fs')

  // Write data to text file 
  fs.writeFile('waypoints.txt', result, (err) => {
    // In case of a error throw err. 
    if (err) throw err;
  })
}

//main

// let test_input = [new Waypoint(10, 10, 10), new Waypoint(15, 15, 15), new Waypoint(5, 10, 15), new Waypoint(20, 10, 15), new SetServo(5, 1100)]

// makeWaypointFile(test_input)

export { makeWaypointFile }