# Groundstation setup for Mac:

## Set Up Server

The backend/server for the Ground Station is written in Python Flask as an API for the frontend to communicate with.
To set up the server, first enter the `server` directory:

```bash
cd server
```

### Finding the right Python to use
To correctly set up the server, you will need to use the right version of Python.
Currently, the server is only compatible with Python 3.9+.
To use Python 3.10+, you will need to edit some source code in the `venv` module.

First, download a Python 3.9+ version from [python.org](https://www.python.org/downloads/).
To find the right version of Python to use, run the following command:
```bash
python --version
```

Repeat this command with `python3`, `python3.x`, and `py` until you find the right command to use for your system.
Use this version of Python for the rest of the setup.


### The Virtual Environment

#### Create it

To create a venv, run
```bash
python -m venv venv
```

#### Activate it

This will need to be done each time you run the server.

For Linux and MacOS, run:
```bash
source venv/bin/activate
```

### Configuration

#### Set up configuration

On Linux/MacOS, run:
```bash
cp sample.config.json config.json
```

## Port configs

When running this you must change the port variable to where the plane is connected.

For now, the default options in sample.config.json should be enough to set up the server.

To run the server with the dummy plane (not connected to anything), clear the port variable like so:

```bash

{
    "uav": {
        "telemetry": {
            "port": "",
            "serial": false,
            "log": true
        },
        "images": {
            "type": "prod",
            "url": "http://192.168.1.49:4000",
            "quality": 95
        },
        "home": {
            "lat": 38.315339,
            "lon": -76.548108,
            "alt": 142
        }
    }
}

```

##### Install required packages

install necessary packages into the venv by running
```bash
python -m pip install -r requirements.txt
```

Even if you are running Archlinux (or its derivatives), you'll still want to use pip rather than pacman for this as the 
packages installed with pip while in the venv will save to the venv rather than for the user or globally.

#### Fix dronekit module

If your version of Python (`python --version`) is Python 3.10 or higher, you'll need to edit some module source code.

1) Open the `venv` directory
2) Open the `lib` directory
3) Open the `python3.x` directory
4) Open the `site-packages` directory
5) Open the `dronekit` directory (if this does not exist, make sure you installed the required packages correctly)
6) Open the `__init__.py` in a text editor
7) Search in the file for the `class Parameters` class definition. Only one result should show up (possibly line 2689)
8) Change that line from 

```bash
`class Parameters(collections.MutableMapping, HasObservers):` 
```

to 

```bash
`class Parameters(collections.abc.MutableMapping, HasObservers):`
```

### Running the Server

Open a new terminal and run 
```bash
python app.py
```

If you make any edits, you will need to end the program and restart the backend.

## Client

The frontend/client for the Ground Station is written in React, along with some other libraries.
The backend (and by extension the Interop server) must be running before the frontend can run. Starting the client 
without the backend running may result in an error, or silent failure.

### Installing Client Packages

*Note: if npm does not work, you may have to install Node.js. To do so, use this link: 
https://nodejs.org/en/download/ or download it from your distribution's package manager.

This can be done most easily by using homebrew.

[Download HomeBrew Here](https://brew.sh/)

In a seperate terminal, run the following:

```bash
brew update
```

```bash
brew install node
```

Confirm download by running

```bash
node -v
npm -v
```

### Installing Node Packages

Make a new terminal at the base directory

```bash
cd client
```

```bash
npm i
```

This installs all of the necessary packages (specified in package.json and package-lock.json).<br/>

### Starting the Client

In your terminal at `/client`, run

```bash
npm start
```

This will open the client in your browser. If not, note that it is run on 
[http://localhost:3000](http://localhost:3000); you can load that in your web browser to connect to the client.

The page will reload if you make edits to the source.
You will also see any linter errors in the console.