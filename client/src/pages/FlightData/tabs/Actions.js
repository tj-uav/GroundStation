import React, { useState, useEffect, useRef } from "react"
import { Button, Box, Label, Slider, Dropdown } from "components/UIElements"
import { Row, Column } from "components/Containers"
import regexParse from "regex-parser"
import { darkred } from "../../../theme/Colors"
import { httpget, httppost } from "../../../backend"

const actions = {
	waypoint: [0, 1, 2, 3, 4]
}

const Actions = () => {
	const [Aaltitude, setAaltitude] = useState(0)
	const [Athrottle, setAthrottle] = useState(0)
	const [Aorientation, setAorientation] = useState({ "yaw": 0, "pitch": 0, "roll": 0 })
	const [AlatLong, setAlatLong] = useState({ "lat": 0, "lon": 0 })
	const [Amode, setAmode] = useState("")
	const [Aarmed, setAarmed] = useState("")
	const [Astatus, setAstatus] = useState("")
	const [AgroundSpeed, setAgroundSpeed] = useState(0)
	const [Aairspeed, setAairspeed] = useState(0)
	const [Abattery, setAbattery] = useState(16)
	const [Awaypoint, setAwaypoint] = useState([1, 0])
	const [Aconnection, setAconnection] = useState([95, 0, 95])

	const [Gcurrent, setGcurrent] = useState("")
	const [Gnext, setGnext] = useState("")
	const [Gwaypoint, setGwaypoint] = useState(0)
	const [Gyaw, setGyaw] = useState(0)
	const [GlatLong, setGlatLong] = useState({ "lat": 0, "lon": 0 })
	const [GgroundSpeed, setGgroundSpeed] = useState(0)
	const [Gconnection, setGconnection] = useState([95, 0, 95])

	const updateData = () => {
		httpget("/uav/stats")
			.then(response => response.data)
			.then(data => {
				setAaltitude(data.result.quick.altitude)
				setAthrottle(data.result.quick.throttle)
				setAorientation({"yaw": data.result.quick.orientation.yaw, "roll": data.result.quick.orientation.roll, "pitch": data.result.quick.orientation.pitch })
				setAlatLong({"lat": data.result.quick.lat, "lon": data.result.quick.lon})
				setAmode(data.result.mode)
				setAarmed(data.result.armed)
				setAstatus(data.result.status)
				setAgroundSpeed(data.result.quick.ground_speed)
				setAairspeed(data.result.quick.air_speed)
				setAbattery(data.result.quick.battery)
				// setAtemperature(data.result.quick.temperature)
				setAwaypoint(data.result.quick.waypoint)
				setAconnection(data.result.quick.connection)
			})
		httpget("/ugv/stats")
			.then(response => response.data)
			.then(data => {
				setGcurrent(data.result.quick.states[0])
				setGnext(data.result.quick.states[1])
				setGwaypoint(data.result.quick.states[2])
				setGyaw(data.result.quick.yaw)
				setGlatLong({"lat": data.result.quick.lat, "lon": data.result.quick.lon})
				setGgroundSpeed(data.result.quick.ground_speed)
				setGconnection(data.result.quick.connection)
			})
	}

	useEffect(() => {
		const tick = setInterval(() => {
			updateData()
		}, 250)
		return () => clearInterval(tick)
	})

	const inputBox = useRef(null)

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "calc(100vh - 9.5rem)",
			}}
		>
			<Column>
				<Row id="labels1" height="2rem" gap="0.5rem">
					<Label columns={1}>Flight Modes (Current: {Amode})</Label>
				</Row>
			</Column>

			<Column style={{ marginBottom: "1rem" }}>
				<Row>
					<Button onClick={() => httppost("/uav/mode/set", {"mode": "MANUAL"})}>MANUAL</Button>
					<Button onClick={() => httppost("/uav/mode/set", {"mode": "AUTO"})}>AUTO</Button>
					<Button color={darkred} onClick={() => httppost("/uav/mode/set", {"mode": "TAKEOFF"})}>TAKEOFF</Button>
					<Button color={darkred} onClick={() => httppost("/uav/commands/insert", {"command": "LAND", "lat": 38.14469, "lon": -76.42799, alt: 6.6})}>LAND</Button>
				</Row>
				<Row>
					<Button onClick={() => httppost("/uav/mode/set", {"mode": "STABILIZE"})}>STABILIZE</Button>
					<Button onClick={() => httppost("/uav/mode/set", {"mode": "LOITER"})}>LOITER</Button>
					<Button onClick={() => httppost("/uav/mode/set", {"mode": "CIRCLE"})}>CIRCLE</Button>
					<Button onClick={() => httppost("/uav/mode/set", {"mode": "RTL"})}>RTL</Button>
				</Row>
			</Column>

			<Column>
				<Row id="labels2" height="2rem" gap="0.5rem">
					<Label columns={1}>Waypoints (Current: {Awaypoint[0]})</Label>
				</Row>
			</Column>
			<Column style={{ marginBottom: "1rem" }}>
				<Row>
					<Row>
						<Box
							ref={inputBox}
							content=""
							onChange={v => {
								let value = v
								let newvalue = ""
								if (value.length > 3) {
									value = v.substring(0, 3)
								}
								console.log(value)
								if (value.length >= 1) {
									for (let i = 0; i < value.length; i++) {
										let ascii = value.charCodeAt(i)
										if (ascii >= 48 && ascii <= 57) {
											newvalue += value[i]
										}
									}
								}
								return newvalue
							}}
							onKeyDown={e => {
								if (e.nativeEvent.key === "Enter") e.preventDefault()
								e.stopPropagation()
							}}
							placeholder="#"
							style={{ textAlign: "center" }}
							line="330%"
							editable
						/>
						<Button onClick={() => httppost("/uav/commands/jump", {"command": inputBox})}>GO!</Button>
					</Row>
					<Button onClick={() => httppost("/uav/commands/jump", {"command": 1})}>WAYPOINTS (#1)</Button>
					<Button onClick={() => httppost("/uav/commands/jump", {"command": 20})}>ODLC (#20)</Button>
					<Button onClick={() => httppost("/uav/commands/jump", {"command": 50})}>MAP (#50)</Button>
				</Row>
			</Column>

			<Column>
				<Row id="labels3" height="2rem" gap="0.5rem">
					<Label columns={1}>Mission</Label>
				</Row>
			</Column>
			<Column style={{ marginBottom: "1rem" }}>
				<Row>
					{/*<Button>START</Button>*/}
					{/*<Button>RESTART</Button>*/}
					<Button>LOAD</Button>
					<Button>SAVE</Button>
					<Button>CLEAR</Button>
					<Button color={darkred}>ABORT LANDING</Button>
				</Row>
			</Column>

			<Column>
				<Row id="labels4" height="2rem" gap="0.5rem">
					<Label columns={1}>Configuration</Label>
				</Row>
			</Column>
			<Column style={{ marginBottom: "1rem" }}>
				<Row>
					<Button color={darkred}>SET HOME ALT</Button>
					<Button color={darkred}>CALIBRATION</Button>
					<Button color={darkred} onClick={() => httppost((Aarmed === "ARMED" ? "/uav/disarm" : "/uav/arm"), {"command": inputBox.value})}>{Aarmed === "ARMED" ? "DISARM" : "ARM"}</Button>
					<Button color={darkred}>RESTART</Button>
				</Row>
			</Column>
			<Box label="" content="LEVEL" />
		</div>
	)
}

export default Actions
