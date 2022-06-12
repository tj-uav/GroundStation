import React, { useState } from "react"

import TabBar from "components/TabBar"
import { httpget } from "backend"

import FlightPlanMap from "components/FlightMap"
import FlightPlanToolbar from "./tabs/FlightPlan/FlightPlanToolbar"
import Quick from "./tabs/Quick"
import Actions from "./tabs/Actions"
import Logs from "./tabs/Logs"
import { useInterval } from "../../util"

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
	const [mode, setMode] = useState("disabled")
	const [saved, setSaved] = useState(true)
	const [defaultAlt, setDefaultAlt] = useState(100)

	const [waypoints, setWaypoints] = useState([])
	const [commands, setCommands] = useState([])
	const [fence, setFence] = useState([])
	const [ugvFence, setUgvFence] = useState([])
	const [ugvDrop, setUgvDrop] = useState({})
	const [ugvDrive, setUgvDrive] = useState({})
	const [obstacles, setObstacles] = useState([])
	const [offAxis, setOffAxis] = useState({})
	const [searchGrid, setSearchGrid] = useState([])
	const [path, setPath] = useState([])
	const [pathSave, setPathSave] = useState([]) // only used for discarding changes
	const [uav, setUav] = useState({})
	const [ugv, setUgv] = useState({})

	const getters = {
		commands: commands,
		waypoints: waypoints,
		fence: fence,
		ugvFence: ugvFence,
		ugvDrop: ugvDrop,
		ugvDrive: ugvDrive,
		obstacles: obstacles,
		offAxis: offAxis,
		searchGrid: searchGrid,
		path: path,
		pathSave: pathSave,
		uav: uav,
		ugv: ugv,
		defaultAlt: defaultAlt
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
		searchGrid: setSearchGrid,
		path: setPath,
		pathSave: setPathSave,
		uav: setUav,
		ugv: setUgv,
		defaultAlt: setDefaultAlt
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
		searchGrid: "ODLC Search Grid",
		path: "Mission Path",
		uav: "UAV",
		ugv: "UGV"
	}

	useInterval(500, () => {
		httpget("/uav/quick", response => setUav({
			latlng: {
				lat: response.data.result.lat,
				lng: response.data.result.lon
			},
			heading: response.data.result.orientation.yaw
		}))
		httpget("/ugv/quick", response => setUgv({
			latlng: {
				lat: response.data.result.lat,
				lng: response.data.result.lon
			},
			heading: response.data.result.yaw
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
				<Quick />
				<Actions />
				{/*<Servo />*/}
				<FlightPlanToolbar
					display={display}
					getters={getters}
					setters={setters}
					mode={mode}
					saved={saved}
					setSaved={setSaved}
					setMode={setMode}
					tabName={"Map"}
				/>
				<Logs />
			</TabBar>
			<FlightPlanMap
				display={display}
				getters={getters}
				setters={setters}
				mode={mode}
				saved={saved}
				setSaved={setSaved}
				setMode={setMode}
			/>
		</div>
	)
}

export default FlightData
