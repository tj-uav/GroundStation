import React, { useState } from "react"
import { Box, Button, Dropdown, Label } from "components/UIElements"
import { Row, Column } from "components/Containers"

import styled from "styled-components"
import { ReactComponent as RawUAV } from "icons/uav.svg"
import { ReactComponent as RawUAVbw } from "icons/uav-bw.svg"
import { httpget, httppost } from "../../../backend"
import { useInterval } from "../../../util"
import { darkred } from "../../../theme/Colors"

const actions = {
	waypoint: [0, 1, 2, 3, 4]
}

const Modes = ["Manual", "Auto", "Loiter", "RTL", "Takeoff", "Land", "Circle", "Stabilize"]

const Main = () => {
	const [Aarmed, setAarmed] = useState("")
	const [Aorientation, setAorientation] = useState({ "yaw": 0, "pitch": 0, "roll": 0 })
	const [AlatLong, setAlatLong] = useState({ "lat": 0, "lon": 0 })
	const [Aaltitude, setAaltitude] = useState(0)
	const [AaltitudeGlobal, setAaltitudeGlobal] = useState(0)
	const [AaltitudeIsGlobal, setAaltitudeIsGlobal] = useState(false)
	const [AebayBattery, setAebayBattery] = useState(16.8)
	const [AflightBattery, setAflightBattery] = useState(50.4)
	const [AgroundSpeed, setAgroundSpeed] = useState(0)
	const [Aairspeed, setAairspeed] = useState(0)
	const [AspeedIsInKnots, setAspeedIsInKnots] = useState(false)
	const [Astatus, setAstatus] = useState("")
	const [Amode, setAmode] = useState("")
	const [Awaypoint, setAwaypoint] = useState([1, 0])
	const [AdistFromHome, setAdistFromHome] = useState(0)
	const [Aconnection, setAconnection] = useState([95, 0, 95])

	useInterval(400, () => {
		httpget("/uav/stats", response => {
			let data = response.data

			setAarmed(data.result.armed)
			setAorientation({"yaw": data.result.quick.orientation.yaw, "roll": data.result.quick.orientation.roll, "pitch": data.result.quick.orientation.pitch })
			setAlatLong({"lat": data.result.quick.lat, "lon": data.result.quick.lon})
			setAaltitude(data.result.quick.altitude)
			setAaltitudeGlobal(data.result.quick.altitude_global)
			setAebayBattery(data.result.quick.battery[0])
			setAflightBattery(data.result.quick.battery[1])
			setAgroundSpeed(data.result.quick.ground_speed)
			setAairspeed(data.result.quick.air_speed)
			setAstatus(data.result.status)
			setAmode(data.result.mode)
			setAwaypoint(data.result.quick.waypoint)
			setAdistFromHome(data.result.quick.dist_from_home)
			setAconnection(data.result.quick.connection)
		})
	})

	const [waypointNum, setWaypointNum] = useState(1)

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "calc(100vh - 9.5rem)",
			}}
		>
			<StyledDiv>
				<Label className="paragraph" style={{ "font-size": "2.1em", color: "black", "margin-top": "auto", "margin-bottom": 0 }}><b>UAV&emsp;</b></Label>
				{Aarmed.includes("DISARMED") ? <UAVbw onClick={() => httppost("/uav/arm")} title="Disarmed - Click to Arm" /> : <UAV onClick={() => httppost("/uav/disarm")} title="Armed - Click to Disarm" />}
			</StyledDiv>
			<Column style={{ marginBottom: "1rem", gap: "1.5rem" }}>
				<Row style={{ gap: "1rem" }}>
					<Row>
						<Box label="Roll" content={(Aorientation.roll.toFixed(2)) + "\u00B0"} />
						<Box label="Pitch" content={(Aorientation.pitch.toFixed(2)) + "\u00B0"} />
						<Box label="Yaw" content={(Aorientation.yaw.toFixed(2))  + "\u00B0"} />
					</Row>
					<Row>
						<Box label=" " content={Astatus} />
						<div>
							<Label>&nbsp;</Label>
							<Dropdown
								initial={Modes.find(m => m.toUpperCase() === Amode)}
								onChange={i => {
									let m = Modes[i].toUpperCase()
									if (m === "LAND") {
										httppost("/uav/commands/insert", { "command": "LAND", "lat": 0.0, "lon": 0.0, alt: 0.0 })
									} else {
										httppost("/uav/mode/set", { "mode": m })
									}
									setAmode(m)
								}}
							>
								{Modes.map((v, i) => {
									return (
										<span value={i}>{v}</span>
									)
								})}
							</Dropdown>
						</div>
					</Row>
				</Row>
				<Row style={{ gap: "1rem" }}>
					<Row>
						<Box label="Latitude" content={AlatLong.lat.toFixed(7) + "\u00B0"} />
						<Box label="Longitude" content={AlatLong.lon.toFixed(7) + "\u00B0"} />
					</Row>
					<Row style={{ gap: "0.1rem" }}>
						<Box label="Altitude"
							 content={Aaltitude.toFixed(2) + " ft AGL"}
							 title="The plane's altitude, from the home position's altitude." />
						<Box label=" "
							 content={AaltitudeGlobal.toFixed(2) + " ft MSL"}
							 title="The plane's altitude, above mean sea level." />
					</Row>
				</Row>
				<Row style={{ gap: "1rem" }}>
					<Row style={{ gap: "0.1rem" }}>
						<Box label="Ground Speed"
							 content={AgroundSpeed.toFixed(2) + " mph"}
							 title="Speed from GPS, in miles per hour." />
						<Box label=" "
							 content={(0.868976 * AgroundSpeed).toFixed(2) + " knots"}
							 title="Speed from GPS, in knots." />
					</Row>
					<Row style={{ gap: "0.1rem" }}>
						<Box label="Air Speed"
							 content={Aairspeed.toFixed(2) + " mph"}
							 title="Speed measured from plane sensors, in miles per hour." />
						<Box label=" "
							 content={(0.868976 * Aairspeed).toFixed(2) + " knots"}
							 title="Speed measured from plane sensors, in knots." />
					</Row>
				</Row>
				<Row style={{ gap: "1rem" }} columns="minmax(0, 2fr) minmax(0, 1.05fr)">
					<Row columns="minmax(0, 3.5fr) minmax(0, 3fr) minmax(0, 3fr) minmax(0, 1.75fr)">
						<Box label="From Home" content={AdistFromHome.toFixed(0) + " ft"} title="The distance from the plane to its Home location." />
						<Box label="HDOP" content={(Aconnection[0] / 100).toFixed(2) + " m"} title="Horizontal dilution of precision. The higher, the less accurate the GPS is." />
						<Box label="VDOP" content={(Aconnection[1] / 100).toFixed(2) + " m"} title="Vertical dilution of precision. The higher, the less accurate the GPS is." />
						<Box label="# Sats" content={Aconnection[2].toFixed(0)} title="The number of satellites the plane is using. 4 at a minimum, 6 is reasonable, 8 is good, and 10 is very accurate." />
					</Row>
					<Row style={{ gap: "0.1rem" }}>
						<Box label="Flight Batt" content={AflightBattery.toFixed(2) + "V"} />
						<Box label="Ebay Batt" content={AebayBattery.toFixed(2) + "V"} />
					</Row>
				</Row>
				<Row height="2.75rem" style={{ gap: "0.5rem" }}>
					<Row>
						<Box label="Waypoint #" content={"#" + (Awaypoint[0] + 1).toFixed(0)} title="The waypoint number the plane is traveling to." />
						<Box label="Distance To WP" content={Awaypoint[1].toFixed(2) + " ft"} title="The distance to the next waypoint." />
					</Row>
					<Row style={{ gap: "1rem" }}>
						<Row>
							<div>
								<Box
									label="Jump"
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
										setWaypointNum(parseInt(newvalue))
										return newvalue
									}}
									onKeyDown={e => {
										if (e.nativeEvent.key === "Enter") e.preventDefault()
										e.stopPropagation()
									}}
									placeholder="#"
									style={{ textAlign: "center" }}
									line="300%"
									editable
								/>
							</div>
							<div>
								<Label>&nbsp;</Label>
								<Button onClick={() => httppost("/uav/commands/jump", { "command": waypointNum })} style={{ height: "2.85rem" }}>Go!</Button>
							</div>
						</Row>
						<Row>
							<div>
								<Label>&nbsp;</Label>
								<Button warning={true} color={darkred} style={{ height: "2.85rem" }} onClick={() => httppost("/uav/terminate")} title="Make the plane terminate (force it to crash), if configured.">Terminate</Button>
							</div>
						</Row>
					</Row>
				</Row>
			</Column>
		</div>
	)
}

const UAV = styled(RawUAV)`
	height: 5em;
	width: 7em;
	margin-right: 0;
	margin-left: auto;
	margin-bottom: -2em;
	cursor: pointer;
`

const UAVbw = styled(RawUAVbw)`
	height: 5em;
	width: 7em;
	margin-right: 0;
	margin-left: auto;
	margin-bottom: -2em;
	cursor: pointer;
`

const StyledDiv = styled.div`
	display: flex;
	margin-bottom: 1em;
`

export default Main