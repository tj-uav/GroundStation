# GroundStation

TJUAV's Custom Ground Station

## Interop

TJUAV's Ground Station interacts with the [AUVSI SUAS Interop Server](https://github.com/auvsi-suas/interop) as part of the AUVSI SUAS competition. This is required, as of writing, for running the Ground Station backend. 

### Setting Up Interop

Clone the AUVSI SUAS Interop server into the root directory of Ground Station: 
`git clone https://github.com/auvsi-suas/interop`. Next, navigate to the AUVSI SUAS github page, read the introduction, and follow along to set up the Interop server.

The following is just a summary of the setup guide for Interop. Please still read the [AUVSI SUAS Interop Github README](https://github.com/auvsi-suas/interop), as it contains useful information about how each team's station will be set up during the actual competition. This section is just here for the benefit of those with prior experience of reading the README. *However, there is still a section here which addresses errors we encountered during setup.*

You will want Docker installed for this. You may want a basic understanding of Docker, as you may run into some errors. If you do not have Docker installed, search up the page and follow installation instructions, or download it from your linux package manager (you may need to install `docker-compose` as well).

First, go to the Interop server folder:

    cd interop/server

Next, create the Interop database:

    sudo ./interop-server.sh create_db

After that, load testing data into the database:

    sudo ./interop-server.sh load_test_data

Finally, run the server

    sudo ./interop-server.sh up

We found this to be somewhat error prone, so you may want to try the following:

* Adding `user: postgres` to the `interop-db` section in `docker-compose.yml`
* Running the `create_db` command as *full* root. (Use `su` instead of `sudo`)
* If the health check is failing, it may be that you ran `rm_data`, then ran `create_db`. 
`rm_data` only removes the data. It does not delete the database. Run `drop_db`, then start the process over again.

## Server

The backend/server for the Ground Station is written in Python, with Flask as a web server for the frontend to communicate with.
The Interop server must be running before you run the backend. The Interop server is, as of writing, required for running the backend.

### The Virtualenv

First make sure you have the virtualenv python library, run:
`pip install virtualenv`. (Or download it from your distribution's package manager)

Then, to create a virtualenv, run
`python -m venv venv/`
in the server folder `server/`

To activate the venv, for Linux run
`source venv/bin/activate`
and for Windows run
`venv\Scripts\activate`

When inside the venv,
install necessary packages into the venv by running
`pip install -r requirements.txt --user`.
Even if you are running Archlinux (or its derivatives), you'll still want to use pip rather than pacman for this as the packages installed with pip while in the venv will save to the venv rather than for the user or globally.

To exit the virtualenv, run
`deactivate`

### Configuration

In the server, copy the file `sample.config.json` to `config.json`. This file is used for configuration of the backend. If the dummy parameter is true, then the backend will use a dummy MAV handler which generates random data, and if the dummy parameter is false, the server will connect to the UAV using the other configuration data in the file.

### Running the Server

Open a new terminal and run `python main.py` in `server/`.
This starts the backend.
If you make any edits, you will need to end the program and restart the backend.

## Client

The frontend/client for the Ground Station is written in React, along with some other libraries.
The backend (and by extension the Interop server) must be running before the frontend can run. Starting the client without the backend running may result in an error, or silent failure.

### Installing Client Packages

*Note: if npm does not work, you may have to install Node.js. To do so, use this link: https://nodejs.org/en/download/ or download it from your distribution's package manager.*

Run `npm i` in `client/`.
This installs all of the necessary packages (specified in package.json and package-lock.json).<br />

### Starting the Client

Run `npm run start` or `npm start` in `client/`.
This will open the client in your browser. If not, note that it is run on [http://localhost:3000](http://localhost:3000); you can load that in your web browser to connect to the client.

The page will reload if you make edits to the source.
You will also see any linter errors in the console.

## Code Structure

### Frontend

- Main code
  - _index.js_: Frontend entry point
  - _App.js_: Basic app structure; Renders routes/paths and each of their respective tabs
- Tabs
  - _FlightData.js_: Contains general plane data such as position or altitude, and some actions. Loads the Flight Map
  - _Params.js_: Contains a list of parameters that the user can edit and upload to the FC.
  - _Submissions.js_: ODLC submission page; Views all of the ODLCs from the backend, and it has the ability to edit them.
- Components
  - _FlightPlanMap.js_: Contains code for the interactive map used in the FlightPlan tab

### Backend

- Main code
  - _main.py_: Entry point for the backend. Has the Flask server URLs, and initializes other components.
- Interop
  - _interop_handler.py_: Manages Mission data, ODLCs, and Telemetry reports with the Interop server.
  - _sample.config.json_: Provides a sample configuration for the Interop server - use this to create a `config.json` for Interop connection.
- MAV
  - _mav_handler.py_: Manages communication with the UAV and provides ODLC/Telemetry data.
  - _dummy_mav_handler.py_: Simulates MAV data using random numbers.
  - _params.py, params.json_: Manage flight parameters that can be edited using the Client.


## Version Control

Create and check out a new git branch, branched from the `dev` branch, before beginning to work on a new change. When an entire feature is complete (don't open a PR for something that isn't done, unreviewed, or untested, unless it is a draft PR), push the branch to your fork, then open a PR to the `dev` branch; PR's should generally target `dev`. Describe what changes are made, how they are implemented, other notes, and add TJUAV programmers such as [@William](https://github.com/pizzalemon) or [@Krishnan](https://github.com/KrishnanS2006) to review it.

Commit messages should be helpful, and not silly. As a rule of thumb, programmers with knowledge of how the entire Ground Station works should know what your commit does just by the message. Do not commit something that is incomplete, unreviewed, or untested. Commits should represent a working self-contained block of your work.