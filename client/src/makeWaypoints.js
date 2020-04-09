function Waypoint(latitude, longitude, altitude) {
    this.type = 'waypoint',
    this.lat = latitude,
    this.lng = longitude,
    this.alt = altitude
}

function SetServo(p, signal) {
    this.type = 'set_servo',
    this.pin = p,
    this.pwm = signal
}

let commands = {'waypoint': 16, 'set_servo': 183}

function makeWaypointFile(array)
{
    result = "QGC WPL 110"

    //variables to store position of last waypoint for different commands
    current_lat = 0
    current_lng = 0
    current_alt = 0
    a = 0
    b = 0
    c = 0
    d = 0
    current_wp = 0
    for(index = 0; index < array.length; index++)
    {
        console.log(array[index])
        type = array[index].type //get command type
        command_number = commands[type] //get associated command number (to be interpreted by MP)
        if(command_number == 16)
        {
            current_lat = array[index].lat
            current_lng = array[index].lng
            current_alt = array[index].alt
        }
        else if(command_number==183)
        {
            a = array[index].pin
            b = array[index].pwm
        }
        line = index + "\t" + current_wp + "\t0\t" + command_number + "\t" + a + "\t" + b + "\t" + c + "\t" + d + "\t" + current_lat + "\t" + current_lng + "\t" + current_alt + "\t1"//create line describing this waypoint
        result += "\n" + line //add line to result
    }

    // Requiring fs module in which writeFile function is defined.
    const fs = require('fs') 

    // Write data to text file 
    fs.writeFile('waypoints.txt', result, (err) => 
    {      
        // In case of a error throw err. 
        if (err) throw err; 
    }) 
}

//main

// let test_input = [new Waypoint(10, 10, 10), new Waypoint(15, 15, 15), new Waypoint(5, 10, 15), new Waypoint(20, 10, 15), new SetServo(5, 1100)]

// makeWaypointFile(test_input)