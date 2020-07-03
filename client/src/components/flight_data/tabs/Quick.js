import React, { useState, useEffect } from "react"
import { Button, Box } from "../../UIElements"
import { Row, Column } from "../../Containers"

const Quick = props => {
	const [altitude, setAltitude] = useState(0)
	const [orientation, setOrientation] = useState(0)
	const [groundSpeed, setGroundSpeed] = useState(0)
	const [airspeed, setAirspeed] = useState(0)
	const [text, setText] = useState(0)
	const [battery, setBattery] = useState(0)
	const [throttle, setThrottle] = useState(0)
	const [latLong, setLatLong] = useState(0)

	const updateData = () => {
		setAltitude(Math.floor(Math.random() * 200) + 100)
		setOrientation(Math.floor(Math.random() * 360))
		setGroundSpeed(Math.floor(Math.random() * 50) + 25)
		setAirspeed(Math.floor(Math.random() * 50) + 25)
		setText("N/A")
		setBattery(Math.floor(Math.random() * 100))
		setThrottle(Math.floor(Math.random() * 100))
		setLatLong([Math.floor(Math.random() * 360), Math.floor(Math.random() * 360)])
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
