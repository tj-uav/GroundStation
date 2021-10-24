import React, { useState, useEffect } from "react"

import TabBar from "components/TabBar"
import { httpget } from "backend"

import FlightPlanMap from "components/FlightMap"
import FlightPlanToolbar from "./tabs/FlightPlan/FlightPlanToolbar"
import Quick from "./tabs/Quick"
import Actions from "./tabs/Actions"
import Servo from "./tabs/Servo"

/*
TODO: Home icon
TODO: Waypoint number icon
TODO: Implement marker insertion
TODO: Display current location of plane (use telem, and also need to make plane icon)
TODO: Polyline overlay -> take polyline file (custom file structure) and overlay it onto map (allow for color option in file)
TODO: Commands display in toolbar
TODO: Commands creation in toolbar
TODO: Interactive display list (move around, delete, insert)
TODO: Fix error where waypoint and fence modes display polygon points
T̶O̶D̶O̶:̶ P̶o̶l̶y̶l̶i̶n̶e̶ a̶r̶r̶o̶w̶s̶ s̶h̶o̶w̶i̶n̶g̶ d̶i̶r̶e̶c̶t̶i̶o̶n̶ o̶f̶ w̶a̶y̶p̶o̶i̶n̶t̶s̶
TODO: Display list highlighting (and vice versa)
*/

const FlightData = () => {
	const queryValues = () => {
		httpget("/mav/telem", response => setTelem(response.data))
	}

	const [mode, setMode] = useState("waypoints")
	const [waypoints, setWaypoints] = useState([])
	const [commands, setCommands] = useState([])
	const [fence, setFence] = useState([])
	const [ugvFence, setUgvFence] = useState([])
	const [ugvDrop, setUgvDrop] = useState({})
	const [ugvDrive, setUgvDrive] = useState({})
	const [obstacles, setObstacles] = useState([])
	const [offAxis, setOffAxis] = useState({})
	const [searchGrid, setSearchGrid] = useState([])

	const getters = {
		commands: commands,
		waypoints: waypoints,
		fence: fence,
		ugvFence: ugvFence,
		ugvDrop: ugvDrop,
		ugvDrive: ugvDrive,
		obstacles: obstacles,
		offAxis: offAxis,
		searchGrid: searchGrid
	}

	const setters = {
		commands: setCommands,
		waypoints: setWaypoints,
		fence: setFence,
		ugvFence: setUgvFence,
		ugvDrop: setUgvDrop,
		ugvDrive: setUgvDrive,
		obstacles: setObstacles,
		offAxis: setOffAxis,
		searchGrid: setSearchGrid
	}

	const display = {
		commands: "Command",
		waypoints: "Waypoint",
		fence: "Geofence",
		ugvFence: "UGV Fence",
		ugvDrop: "UGV Drop",
		ugvDrive: "UGV Drive",
		obstacles: "Obstacles",
		offAxis: "Off Axis ODLC",
		searchGrid: "ODLC Search Grid"
	}

	useEffect(() => {
		//        const interval = setInterval(() => {
		//            queryValues();
		//        }, 1000);
		//        return () => clearInterval(interval);
	}, [])

	const setTelem = () => {

	}

	return (
		<div
			style={{
				display: "grid",
				padding: "1rem 1rem 0 1rem",
				gridTemplateColumns: "37rem 100fr",
				gap: "1rem",
				width: "100%",
				height: "auto",
				overflowY: "hidden",
			}}
		>
			<TabBar>
				<Quick />
				<Actions />
				<FlightPlanToolbar
					display={display}
					getters={getters}
					setters={setters}
					mode={mode}
					setMode={setMode}
					tabName={"Flight Plan"}
				/>
				<Servo />
			</TabBar>
			<FlightPlanMap
				display={display}
				getters={getters}
				setters={setters}
				mode={mode}
				setMode={setMode}
			/>
		</div>
	)
}

export default FlightData
