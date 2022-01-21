import React, { useState, useEffect } from "react"
import { Box } from "components/UIElements"
import { Row, Column } from "components/Containers"

const Quick = () => {
	const [altitude, setAltitude] = useState(0)
	const [throttle, setThrottle] = useState(0)
	const [orientation, setOrientation] = useState({ "yaw": 0, "pitch": 0, "roll": 0 })
	const [latLong, setLatLong] = useState({ "lat": 0, "lon": 0 })
	const [groundSpeed, setGroundSpeed] = useState(0)
	const [airspeed, setAirspeed] = useState(0)
	const [battery, setBattery] = useState([16, 16])
	const [temperature, setTemperature] = useState([25, 25, 25, 25])
	const [waypoint, setWaypoint] = useState([1, 0])
	const [connection, setConnection] = useState([95, 0, 95])

	const updateData = () => {
		fetch("http://localhost:5000/uav/quick")
			.then(response => response.json())
			.then(data => {
				setAltitude(data.result.altitude)
				setThrottle(data.result.throttle)
				setOrientation({"yaw": data.result.orientation.yaw, "roll": data.result.orientation.roll, "pitch": data.result.orientation.pitch })
				setLatLong({"lat": data.result.lat, "lon": data.result.lon})
				setGroundSpeed(data.result.ground_speed)
				setAirspeed(data.result.air_speed)
				setBattery(data.result.battery)
				setTemperature(data.result.temperature)
				setWaypoint(data.result.waypoint)
				setConnection(data.result.connection)
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
			<Column style={{ marginBottom: "1rem", gap: "0.5rem" }}>
				<Row style={{ gap: "1rem" }}>
					<Row>
						<Box label="Altitude" content={altitude.toFixed(2) + " ft"} />
						<Box label="Throttle" content={throttle.toFixed(2) + " %"} />
					</Row>
					<Row>
						<Box label="Roll" content={(orientation.roll) + "\u00B0"} />
						<Box label="Pitch" content={(orientation.pitch) + "\u00B0"} />
						<Box label="Yaw" content={(orientation.yaw) + "\u00B0"} />
					</Row>
				</Row>
				<Row style={{ gap: "1rem" }}>
					<Box label="Latitude" content={Math.abs(latLong.lat).toFixed(8) + "\u00B0 N"} />
					<Box label="Longitude" content={Math.abs(latLong.lon).toFixed(8) + "\u00B0 W"} />
				</Row>
				<Row style={{ gap: "1rem" }}>
					<Row>
						<Box label="Ground Speed" content={groundSpeed.toFixed(2) + " mph"} />
						<Box label="Airspeed" content={airspeed.toFixed(2) + " mph"} />
					</Row>
					<Row>
						<Box label="Left Battery" content={battery[0].toFixed(2) + "V"} />
						<Box label="Right Battery" content={battery[1].toFixed(2) + "V"} />
					</Row>
				</Row>
				<Row style={{ gap: "1rem" }}>
					<Row>
						<Box label="Left Motor" content={temperature[0].toFixed(2) + "\u00B0 C"} />
						<Box label="ESC" content={temperature[1].toFixed(2) + "\u00B0 C"} />
					</Row>
					<Row>
						<Box label="Right Motor" content={temperature[2].toFixed(2) + "\u00B0 C"} />
						<Box label="ESC" content={temperature[3].toFixed(2) + "\u00B0 C"} />
					</Row>
				</Row>
				<Row style={{ gap: "1rem" }}>
					<Row>
						<Box label="Waypoint #" content={"#" + (waypoint[0] + 1).toFixed(0)} />
						<Box label="Distance" content={waypoint[1].toFixed(2) + " ft"} />
					</Row>
					<Row>
						<Box label="GPS HDOP" content={connection[0].toFixed(2)} />
						<Box label="Satellites" content={connection[1].toFixed(0)} />
						<Box label="Link %" content={connection[2].toFixed(0) + " %"} />
					</Row>
				</Row>
			</Column>
			<Column style={{ marginBottom: "1rem", gap: "0.5rem" }}>
				<Box label="" content={"⬆️  UAV                            |                            UGV  ⬇️"} transparent={true} />
			</Column>
			<Column style={{ marginBottom: "1rem", gap: "0.5rem" }}>
				<Row style={{ gap: "1rem" }}>
					<Row>
						<Box label="Current State" content={"Ground Travel"} />
						<Box label="Next Objective" content={"Reach Destination"} />
						<Box label="To Destination" content={waypoint[1].toFixed(2) + " ft"} />
					</Row>
				</Row>
				<Row style={{ gap: "1rem" }}>
					<Box label="Latitude" content={Math.abs(latLong.lat).toFixed(8) + "\u00B0 N"} />
					<Box label="Longitude" content={Math.abs(latLong.lon).toFixed(8) + "\u00B0 W"} />
				</Row>
				<Row style={{ gap: "1rem" }}>
					<Row>
						<Box label="Ground Speed" content={groundSpeed.toFixed(2) + " mph"} />
						<Box label="Yaw" content={(orientation.yaw) + "\u00B0"} />
					</Row>
					<Row>
						<Box label="GPS HDOP" content={connection[0].toFixed(2)} />
						<Box label="Satellites" content={connection[1].toFixed(0)} />
						<Box label="Link %" content={connection[2].toFixed(0) + " %"} />
					</Row>
				</Row>
			</Column>
		</div>
	)
}

export default Quick