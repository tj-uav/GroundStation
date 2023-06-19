import React, { useState } from "react"

import TabBar from "components/TabBar"
import { httpget } from "backend"

import FlightPlanMap from "components/FlightMap"
import FlightPlanToolbar from "./tabs/FlightPlan/FlightPlanToolbar"
import Main from "./tabs/Main"
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
	const [flightBoundary, setFlightBoundary] = useState([
		{lat: 38.31729702009844, lng: -76.55617670782419},
		{lat: 38.31594832826572, lng: -76.55657341657302},
		{lat: 38.31546739500083, lng: -76.55376201277696},
		{lat: 38.31470980862425, lng: -76.54936361414539},
		{lat: 38.31424154692598, lng: -76.54662761646904},
		{lat: 38.31369801280048, lng: -76.54342380058223},
		{lat: 38.31331079191371, lng: -76.54109648475954},
		{lat: 38.31529941346197, lng: -76.54052104837133},
		{lat: 38.31587643291039, lng: -76.54361305817427},
		{lat: 38.31861642463319, lng: -76.54538594175376},
		{lat: 38.31862683616554, lng: -76.55206138505936},
		{lat: 38.31703471119464, lng: -76.55244787859773},
		{lat: 38.31674255749409, lng: -76.55294546866578},
		{lat: 38.31729702009844, lng: -76.55617670782419}
	])
	const [airdropBoundary, setAirdropBoundary] = useState([
		{lat: 38.31442311312976, lng: -76.54522971451763},
		{lat: 38.31421041772561, lng: -76.54400246436776},
		{lat: 38.3144070396263, lng: -76.54394394383165},
		{lat: 38.31461622313521, lng: -76.54516993186949},
		{lat: 38.31442311312976, lng: -76.54522971451763}
	])
	const [uav, setUav] = useState({})
	const [home, setHome] = useState({})
	const [water, setWater] = useState({})

	const [path, setPath] = useState([])
	const [pathSave, setPathSave] = useState([]) // only used for discarding changes
	const [pathSaved, setPathSaved] = useState(true)

	const [placementType, setPlacementType] = useState("waypoint")
	const [placementMode, setPlacementMode] = useState("disabled")
	const [defaultAlt, setDefaultAlt] = useState(250)

	const [currentDistance, setCurrentDistance] = useState(-1)
	const [firstJump, setFirstJump] = useState(-1)
	const [firstPoint, setFirstPoint] = useState(-1)

	const getters = {
		flightBoundary: flightBoundary,
		airdropBoundary: airdropBoundary,
		uav: uav,
		home: home,
		path: path,
		pathSave: pathSave,
		water: water,
		pathSaved: pathSaved,
		placementType: placementType,
		placementMode: placementMode,
		defaultAlt: defaultAlt,
		currentDistance: currentDistance,
		firstJump: firstJump,
		firstPoint: firstPoint
	}

	const setters = {
		flightBoundary: setFlightBoundary,
		airdropBoundary: setAirdropBoundary,
		uav: setUav,
		home: setHome,
		path: setPath,
		pathSave: setPathSave,
		pathSaved: setPathSaved,
		placementType: setPlacementType,
		placementMode: setPlacementMode,
		water: setWater,
		defaultAlt: setDefaultAlt,
		currentDistance: setCurrentDistance,
		firstJump: setFirstJump,
		firstPoint: setFirstPoint
	}

	const display = {
		flightBoundary: ["Mission Boundary", "Mission Boundary"],
		airdropBoundary: ["Air Drop", "Air Drop Boundary"],
		path: ["Waypoint", "Waypoints"],
		home: ["Home", "Home Location"],
		unlim: ["Unlimited Loiter", "Unlimited Loiter"],
		turn: ["Turn Loiter", "Turn Loiter"],
		time: ["Time Loiter", "Time Loiter"],
		jump: ["Jump", "Jump"],
		uav: ["UAV", "UAV Location"],
		water: ["Drop", "Bottle Drop Location"]
	}

	useInterval(500, () => {
		httpget("/uav/quick", response => {
			setUav({
				latlng: {
					lat: response.data.result.lat,
					lng: response.data.result.lon
				},
				heading: response.data.result.orientation.yaw
			})
			setWater({
				lat: response.data.result.lat + 0.1 * response.data.result.ground_speed * Math.sin(response.data.result.orientation.yaw * Math.PI / 180),
				lng: response.data.result.lon + 0.1 * response.data.result.ground_speed * Math.cos(response.data.result.orientation.yaw * Math.PI / 180)
			})
			setHome({
				lat: response.data.result.home.lat,
				lng: response.data.result.home.lon
			})
		})
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
				{/*<Logs />*/}
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
