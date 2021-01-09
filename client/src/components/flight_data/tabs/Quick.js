import React, { useState, useEffect } from "react"
import { Button, Box } from "../../UIElements"
import { Row, Column } from "../../Containers"
import io from "socket.io-client";


const Quick = props => {
	const endpoint = "http://127.0.0.1:5000/";
	let socket = io(endpoint);
	console.log(socket.connected)

	const [altitude, setAltitude] = useState(0)
	const [yaw, setYaw] = useState(0)
	const [pitch, setPitch] = useState(0)
	const [roll, setRoll] = useState(0)
	const [groundSpeed, setGroundSpeed] = useState(0)
	const [airspeed, setAirspeed] = useState(0)
	const [distToWP, setDistToWP] = useState(0)
	const [voltage, setVoltage] = useState(0)
	const [throttle, setThrottle] = useState(0)
	const [latLong, setLatLong] = useState(0)

	// const updateData = () => {
	// 	fetch("http://localhost:5000/mav/telem")
	// 		.then(response => response.json())
	// 		.then(data => {
	// 			console.log(data)
	// 			setAltitude(data[0])
	// 			setOrientation(data[1])
	// 			setGroundSpeed(data[2])
	// 			setAirspeed(data[3])
	// 			setText(data[4])
	// 			setBattery(data[5])
	// 			setThrottle(data[6])
	// 			setLatLong(data[7])
	// 		})
	// }

	const updateData = () => {
		socket.emit("message", "Awaiting data")
		socket.on("responseMessage", data => {
			console.log(data);
			setAltitude(data[0]);
			setOrientation(data[1]);
			setGroundSpeed(data[2]);
			setAirspeed(data[3]);
			setText(data[4]);
			setBattery(data[5]);
			setThrottle(data[6]);
			setLatLong(data[7]);
		})
	}

	useEffect(() => {
		const tick = setInterval(() => {
			updateData()
		}, 200)
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
					<Box label="Yaw" content={yaw} />
				</Row>
				<Row>
					<Box label="Pitch" content={pitch} />
					<Box label="Roll" content={roll} />
				</Row>
				<Row>
					<Box label="Ground Speed" content={groundSpeed} />
					<Box label="Airspeed" content={airspeed} />
				</Row>
				<Row>
					<Box label="Dist To WP" content={distToWP} />
					<Box label="Battery Voltage" content={voltage} />
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
