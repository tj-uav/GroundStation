import React, { useState } from "react"

import TabBar from "components/TabBar"
import { httpget } from "backend"

import FlightPlanMap from "components/FlightMap"
import FlightPlanToolbar from "./tabs/FlightPlan/FlightPlanToolbar"
import Main from "./tabs/Main"
import Logs from "./tabs/Logs"
import { useInterval } from "../../util"
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
	const [flightBoundary, setFlightBoundary] = useState([])
	const [airdropBoundary, setAirdropBoundary] = useState([])
	const [uav, setUav] = useState({})

	const [path, setPath] = useState([])
	const [pathSave, setPathSave] = useState([]) // only used for discarding changes
	const [pathSaved, setPathSaved] = useState(true)

	const [mode, setMode] = useState("waypoint")
	const [previousMode, setPreviousMode] = useState("disabled")
	const [placementMode, setPlacementMode] = useState("push")
	const [defaultAlt, setDefaultAlt] = useState(125)

	const getters = {
		flightBoundary: flightBoundary,
		airdropBoundary: airdropBoundary,
		uav: uav,
		path: path,
		pathSave: pathSave,
		pathSaved: pathSaved,
		mode: mode,
		previousMode: previousMode,
		placementMode: placementMode,
		defaultAlt: defaultAlt
	}

	const setters = {
		flightBoundary: setFlightBoundary,
		airdropBoundary: setAirdropBoundary,
		uav: setUav,
		path: setPath,
		pathSave: setPathSave,
		pathSaved: setPathSaved,
		mode: setMode,
		previousMode: setPreviousMode,
		placementMode: setPlacementMode,
		defaultAlt: setDefaultAlt
	}

	const display = {
		flightBoundary: "Mission Flight Boundary",
		airdropBoundary: "Air Drop Boundary",
		path: "Mission Path",
		home: "Home Waypoint",
		unlim: "Unlimited Loiter",
		turn: "Turn Loiter",
		time: "Time Loiter",
		jump: "Jump",
		uav: "UAV"
	}

	useInterval(500, () => {
		httpget("/uav/quick", response => setUav({
			latlng: {
				lat: response.data.result.lat,
				lng: response.data.result.lon
			},
			heading: response.data.result.orientation.yaw
		}))
	})

	return (
		<div
			style={{
				display: "grid",
				padding: "0 1rem 0 1rem",
				gridTemplateColumns: "37rem 100fr",
				gap: "1rem",
				width: "100%",
				height: "auto",
				overflowY: "hidden"
			}}
		>
			<TabBar>
				<Main />
				<FlightPlanToolbar
					display={display}
					getters={getters}
					setters={setters}
					tabName={"Map"}
				/>
				<Servo />
				<Logs />
			</TabBar>
			<FlightPlanMap
				display={display}
				getters={getters}
				setters={setters}
			/>
		</div>
	)
}

export default FlightData
