# GroundStation
Development Branch

TJUAV's custom UI ground station

## Virtual Environment

### Create a virtualenv

First make sure you have the virutalenv python library, run:
`pip3 install virutalenv`

Then, to create a virtualenv, run:
`python3 -m venv venv/`
in the outermost folder (GroundStation/)

### Get into the venv

For Linux run:
`venv/bin/activate`
and for Windows run:
`venv\Scripts\activate`

Inside the venv:
install necessary packages into the venv run:
'pip3 install -r requirements.txt --user'

To exit the virtualenv, run:
`deactivate`

## Available Scripts

In the project directory, you can run:

### `npm i`

*Note: if npm does not work, you have to install Node.js. To do so, use this link: https://nodejs.org/en/download/*

Run the above command in client/.
Installs all of the necessary packages (specified in package-lock.json).<br />

### `npm i <package name>`

Run the above command in client/.
Installs the package that you specify (and adds it to package-lock.json).<br />

### `npm start`

Run the above command in client/.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `python main.py`

Open a new terminal and run the above command in server/.
Starts the backend.
If you make any edits, you will need to end the program and restart the backend.

## Code Structure

### Frontend

- Main code
  - _index.js_: Contains the main code for the frontend.
  - _App.js_: Contains the main code for the frontend.
- Tabs
  - _FlightData.js_: Contains the plane's live telemetry data
  - _FlightPlan.js_: Used to plan out waypoint missons.
  - _Params.js_: Contains a list of parameters that the user can edit and upload to the FC.
  - _Submissions.js_: Displays all submissions that were made to the interop server.
- Components
  - _FlightPlanMap.js_: Contains code for the interactive map used in the FlightPlan tab
  - _FlightPlanToolbar.js_: Contains code for the toolbar used in the FlightPlan tab

### Backend

- Main code
  - _main.py_: Contains the main code for the backend, which runs everything necessary.
- Interop
  - _interop_handler.py_: Manages Mission data, ODLCs, and Telemetry reports with the official interop server.
  - _sample.config.json_: Provides a sample configuration for the Interop server - use this to create a `config.json` for Interop connection.
- MAV
  - _mav_handler.py_: Manages communication with the UAV and provides ODLC/Telemetry data.
  - _dummy_mav_handler.py_: Simulates MAV data using random numbers.
  - _params.py_/_params.json_: Manage flight parameters that can be edited using the Client.


## Version Control

Generally, check out to a new git branch before beginning to work on a new change. Then, push all of these changes to that branch on the repo, and head over to the GitHub to create a new pull request. You can also fork the repository and merge it back in using a pull request after the changes are complete. When an entire feature is complete, create a pull request into the `master` branch, describe what changes are made, how they are implemented, or other notes, and add some other TJUAV programmers like [@Ganesh](https://github.com/gnanduru1), [@Jason Klein](https://github.com/Jklein64), or [@Srikar Gouru](https://github.com/srikarg89) to review it.

### Note

If working on the GroundStation frontend, you will want to set [#frontend-development](https://github.com/tj-uav/GroundStation/tree/frontend-development) as your base branch instead of [master](https://github.com/tj-uav/GroundStation/tree/master) until it gets merged. If working on the GroundStation backend, you will want to set [#backend-development](https://github.com/tj-uav/GroundStation/tree/backend-development) as your base branch.
