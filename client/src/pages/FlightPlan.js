import React, { useState } from "react"
import FlightPlanMap from "../components/flight_data/FlightPlanMap.js"
import FlightPlanToolbar from "../components/flight_plan/FlightPlanToolbar.js"

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

const FlightPlan = props => {
	const [mode, setMode] = useState("waypoints")
	const [waypoints, setWaypoints] = useState([])
	const [commands, setCommands] = useState([])
	const [polygons, setPolygons] = useState([[]])
	const [fence, setFence] = useState([])

	const getters = {
		commands: commands,
		waypoints: waypoints,
		polygons: polygons,
		fence: fence,
	}

	const setters = {
		commands: setCommands,
		waypoints: setWaypoints,
		polygons: setPolygons,
		fence: setFence,
	}

	const display = {
		commands: "Command",
		waypoints: "Waypoint",
		polygons: "Polygon",
		fence: "Geofence",
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
			<FlightPlanToolbar
				display={display}
				getters={getters}
				setters={setters}
				mode={mode}
				setMode={setMode}
			/>
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

export default FlightPlan
