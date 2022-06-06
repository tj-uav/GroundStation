import React, { useState, useEffect } from "react"
import { Box } from "components/UIElements"
import { Row, Column } from "components/Containers"

const Quick = () => {
	const [altitude, setAltitude] = useState(0)
	const [orientation, setOrientation] = useState({ "yaw": 0, "pitch": 0, "roll": 0 })
	const [groundSpeed, setGroundSpeed] = useState(0)
	const [airspeed, setAirspeed] = useState(0)
	const [distToWaypoint, setDistToWaypoint] = useState(0)
	const [battery, setBattery] = useState(0)
	const [throttle, setThrottle] = useState(0)
	const [latLong, setLatLong] = useState({ "lat": 0, "lon": 0 })

	const updateData = () => {
		fetch("http://localhost:5000/uav/quick")
			.then(response => response.json())
			.then(data => {
				setAltitude(data.result.altitude)
				setOrientation({"yaw": data.result.orientation.yaw, "roll": data.result.orientation.roll, "pitch": data.result.orientation.pitch })
				setGroundSpeed(data.result.ground_speed)
				setAirspeed(data.result.air_speed)
				setDistToWaypoint(data.result.dist_to_wp)
				setBattery(data.result.voltage)
				setThrottle(data.result.throttle)
				setLatLong({"lat": data.result.lat, "lon": data.result.lon})
			})
	}

	useEffect(() => {
		const tick = setInterval(() => {
			updateData()
		}, 250)
		return () => clearInterval(tick)
	})

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "calc(100vh - 9.5rem)",
			}}
		>
			<Column style={{ marginBottom: "1rem" }}>
				<Row>
					<Box label="Altitude" content={altitude.toFixed(2) + " ft"} />
					<Row>
						<Box label="Yaw" content={(orientation.yaw) + "\u00B0"} />
						<Box label="Roll" content={(orientation.roll) + "\u00B0"} />
						<Box label="Pitch" content={(orientation.pitch) + "\u00B0"} />
					</Row>
				</Row>
				<Row>
					<Row>
						<Box label="Latitude" content={Math.abs(latLong.lat).toFixed(8) + "\u00B0 N"} />
						<Box label="Longitude" content={Math.abs(latLong.lon).toFixed(8) + "\u00B0 W"} />
					</Row>
				</Row>
				<Row>
					<Box label="Throttle" content={throttle.toFixed(2) + " %"} />
					<Box label="Ground Speed" content={groundSpeed.toFixed(2) + " mph"} />
					<Box label="Airspeed" content={airspeed.toFixed(2) + " mph"} />
				</Row>
				<Row>
					<Box label="Distance to Waypoint" content={distToWaypoint.toFixed(2) + " ft"} />
					<Box label="Battery" content={battery.toFixed(2) + " V"} />
				</Row>
			</Column>
			<Box label="Console + Error Messages" error />
		</div>
	)
}

export default Quick