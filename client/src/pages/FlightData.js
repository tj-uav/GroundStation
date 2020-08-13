import React, { useState, useEffect } from "react"
import { Switch, Route, Redirect, useRouteMatch, useLocation } from "react-router-dom"

import { httpget } from "../backend.js"

import FlightPlanMap from "../components/flight_data/FlightPlanMap"
import TabBar from "../components/TabBar"
import Quick from "../components/flight_data/tabs/Quick"
import Actions from "../components/flight_data/tabs/Actions"
import All from "../components/flight_data/tabs/All"
import Servo from "../components/flight_data/tabs/Servo"
import { Row } from "../components/Containers"
import { Button } from "../components/UIElements"

const FlightData = () => {
	const [telem, setTelem] = useState([])
	const queryValues = () => {
		httpget("/mav/telem", response => setTelem(response.data))
	}

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

	useEffect(() => {
		//        const interval = setInterval(() => {
		//            queryValues();
		//        }, 1000);
		//        return () => clearInterval(interval);
	}, [])

	return (
		<div
			style={{
				display: "grid",
				padding: "1rem",
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
				<All />
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
