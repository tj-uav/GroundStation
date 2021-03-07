import React, { useState, useEffect } from "react"
import { Box } from "components/UIElements"
import { Row, Column } from "components/Containers"

const Quick = () => {
	const [altitude, setAltitude] = useState(0)
	const [orientation, setOrientation] = useState(0)
	const [groundSpeed, setGroundSpeed] = useState(0)
	const [airspeed, setAirspeed] = useState(0)
	const [text, setText] = useState(0)
	const [battery, setBattery] = useState(0)
	const [throttle, setThrottle] = useState(0)
	const [latLong, setLatLong] = useState(0)

	const updateData = () => {
		fetch("http://localhost:5000/mav/telem")
			.then(response => response.json())
			.then(data => {
				console.log(data)
				setAltitude(data[0])
				setOrientation(data[1])
				setGroundSpeed(data[2])
				setAirspeed(data[3])
				setText(data[4])
				setBattery(data[5])
				setThrottle(data[6])
				setLatLong(data[7])
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
					<Box label="Altitude" content={altitude} />
					<Box label="Orientation" content={orientation} />
				</Row>
				<Row>
					<Box label="Ground Speed" content={groundSpeed} />
					<Box label="Airspeed" content={airspeed} />
				</Row>
				<Row>
					<Box label="Text" content={text} />
					<Box label="Battery" content={battery} />
				</Row>
				<Row>
					<Box label="Throttle" content={throttle} />
					<Box label="Latitude / Longitude" content={latLong} />
				</Row>
			</Column>
			<Box label="Console + Error Messages" error />
		</div>
	)
}

export default Quick