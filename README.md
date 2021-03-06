# GroundStation

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

Import the auvsi interop server, instructions at:
https://tjuav.gitbook.io/tjuav/software/python/package-installation-w-pip/interop-library

To exit the virtualenv, run:
`deactivate`

## Available Scripts

In the project directory, you can run:

### `npm i`

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

TODO

## Version Control

Generally, check out to a new git branch before beginning to work on a new change.  When finished working, push all of these changes to that branch on the repo, then head over to the GitHub and create a new pull request.  Describe what changes are made, how they are implemented, or other notes, and add some other TJUAV programmers like [@Ganesh](https://github.com/gnanduru1), [@Jason Klein](https://github.com/Jklein64), or [@Srikar Gouru](https://github.com/srikarg89) to review it.

### Note

If working on the GroundStation frontend, you will want to set [#frontend-development](https://github.com/tj-uav/GroundStation/tree/frontend-development) as your base branch instead of [master](https://github.com/tj-uav/GroundStation/tree/master) until it gets merged.
