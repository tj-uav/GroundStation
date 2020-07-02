import React, { useState, useEffect } from "react"
import { Button, Box, Label } from "../UIElements"
import { Row, Column } from "../Containers"

const ServoRow = ({ number, port1, port2, ...props }) => {
	return (
		<Row columns="minmax(0, 4fr) 22fr minmax(0, 4fr) minmax(0, 4fr)" height="2rem">
			<Box content={number} line="200%" />
			<Row gap="0.5rem">
				<Button>Low</Button>
				<Button>Mid</Button>
				<Button>High</Button>
				<Button>Toggle</Button>
			</Row>
			<Box content={port1} line="200%" />
			<Box content={port2} line="200%" />
		</Row>
	)
}

const Servo = props => {
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
			<Row columns="minmax(0, 4fr) 22fr minmax(0, 4fr) minmax(0, 4fr)" height="2rem">
				<Label>Servo</Label>
				<Label>Function</Label>
				<Label>Port(s)</Label>
			</Row>
			<Column style={{ marginBottom: "1rem" }}>
				{new Array(10).fill({}).map((_, index) => {
					return <ServoRow key={index} number={index} port1={1110} port2={1900} />
				})}
			</Column>
			<Box label="Console + Error Messages" error />
		</div>
	)
}

export default Servo
