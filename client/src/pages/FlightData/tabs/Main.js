import React, { useState } from "react"
import { Box, Button, Dropdown, Label } from "components/UIElements"
import { Row, Column } from "components/Containers"

import styled from "styled-components"
import { ReactComponent as RawUAV } from "icons/uav.svg"
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
				<Label className="paragraph" style={{ "font-size": "2.1em", color: "black", "margin-top": "auto", "margin-bottom": 0 }}><b>UAV</b></Label>
				<UAV />
			</StyledDiv>
			<Column style={{ marginBottom: "1rem", gap: "0.5rem" }}>
				<Row style={{ gap: "1rem" }}>
					<Row>
						<Box label="Roll" content={(Aorientation.roll.toFixed(2)) + "\u00B0"} />
						<Box label="Pitch" content={(Aorientation.pitch.toFixed(2)) + "\u00B0"} />
						<Box label="Yaw" content={(Aorientation.yaw.toFixed(2))  + "\u00B0"} />
					</Row>
					<Row>
						<Box label=" " content={Astatus} />
						<Box label=" " content={Aarmed} />
					</Row>
				</Row>
				<Row style={{ gap: "1rem" }}>
					<Row>
						<Box label="Latitude" content={AlatLong.lat.toFixed(7) + "\u00B0"} />
						<Box label="Longitude" content={AlatLong.lon.toFixed(7) + "\u00B0"} />
					</Row>
					<Row>
						<Box label="Ground Speed"
							 content={((AspeedIsInKnots ? 0.868976 : 1) * AgroundSpeed).toFixed(2) + (AspeedIsInKnots ? " knots" : " mph")}
							 onClick={() => {setAspeedIsInKnots(!AspeedIsInKnots)}}
							 style={{ cursor: "pointer" }}
							 title="Speed from GPS." />
						<Box label="Airspeed"
							 content={((AspeedIsInKnots ? 0.868976 : 1) * Aairspeed).toFixed(2) + (AspeedIsInKnots ? " knots" : " mph")}
							 onClick={() => {setAspeedIsInKnots(!AspeedIsInKnots)}}
							 style={{ cursor: "pointer" }}
							 title="Speed measured from plane sensors." />
					</Row>
				</Row>
				<Row style={{ gap: "1rem" }}>
					<Row>
						<Box label="Altitude"
							 content={AaltitudeIsGlobal ? AaltitudeGlobal.toFixed(2) + " ft MSL" : Aaltitude.toFixed(2) + " ft AGL"}
							 onClick={() => {setAaltitudeIsGlobal(!AaltitudeIsGlobal)}}
							 style={{ cursor: "pointer" }}
							 title="The plane's altitude. MSL refers to above mean sea level. AGL is the height from the home position's altitude." />
						<Box label="Distance" content={AdistFromHome.toFixed(2) + " ft"} title="The distance from the plane to its Home location." />
					</Row>
					<Row>
						<Box label="Ebay Batt" content={AebayBattery.toFixed(2) + "V"} />
						<Box label="Flight Batt" content={AflightBattery.toFixed(2) + "V"} />
						<Box label="Mode" content={Amode} title="The flight mode the plane is in, including RTL, Auto, and Manual." />
					</Row>
				</Row>
				<Row style={{ gap: "1rem" }}>
					<Row>
						<Box label="Waypoint #" content={"#" + (Awaypoint[0] + 1).toFixed(0)} title="The waypoint number the plane is traveling to." />
						<Box label="Distance to WP" content={Awaypoint[1].toFixed(2) + " ft"} title="The distance to the next waypoint." />
					</Row>
					<Row>
						<Box label="GPS HDOP" content={Aconnection[0].toFixed(2)} title="Horizontal dilution of precision. The higher, the less accurate the GPS is." />
						<Box label="GPS VDOP" content={Aconnection[1].toFixed(2)} title="Vertical dilution of precision. The higher, the less accurate the GPS is." />
						<Box label="Satellites" content={Aconnection[2].toFixed(0)} title="The number of satellites the plane is using. 4 at a minimum, 6 is reasonable, 8 is good, and 10 is very accurate." />
					</Row>
				</Row>
			</Column>
			<Column>
				<Row id="labels1" height="2rem" gap="0.5rem">
					<Label columns={1}>Flight Mode</Label>
				</Row>
			</Column>

			<Column style={{ marginBottom: "1rem" }}>
				<Row height="3rem">
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
					<Button onClick={() => { setAmode("MANUAL"); httppost("/uav/mode/set", { "mode": "MANUAL" }) }} title="Switch the plane mode to Manual.">Manual</Button>
					<Button onClick={() => { setAmode("AUTO"); httppost("/uav/mode/set", { "mode": "AUTO" }) }} title="Switch the plane mode to Auto.">Auto</Button>
					<Button onClick={() => { setAmode("RTL"); httppost("/uav/mode/set", { "mode": "RTL" }) }} title="Switch the plane mode to RTL.">RTL</Button>
					<Button onClick={() => { setAmode("LOITER"); httppost("/uav/mode/set", { "mode": "LOITER" }) }} title="Switch the plane mode to Loiter.">Loiter</Button>
				</Row>
			</Column>
			<Column>
				<Row id="labels4" height="2rem" gap="0.5rem">
					<Label columns={1}>Configuration</Label>
				</Row>
			</Column>
			<Column style={{ marginBottom: "1rem" }}>
				<Row height="2.5rem">
					<Button warning={true} color={darkred} onClick={() => httppost("/uav/sethome")} title="Set the plane home position.">Set home</Button>
					<Button warning={true} color={darkred} onClick={() => httppost("/uav/calibrate")}>Calibration?</Button>
					<Button warning={true} color={darkred} onClick={() => httppost(Aarmed === "ARMED" ? "/uav/disarm" : "/uav/arm")} title={Aarmed === "ARMED" ? "Disarm the plane." : "Arm the plane."}>{Aarmed === "ARMED" ? "Disarm" : "Arm"}</Button>
					<Button warning={true} color={darkred} onClick={() => httppost("/uav/restart")} title="Restart the Pixhawk.">Restart</Button>
				</Row>
			</Column>
			<Column>
				<Row id="labels2" height="2rem" gap="0.5rem">
					<Label columns={1}>Waypoints (Current: {Awaypoint[0]})</Label>
				</Row>
			</Column>
			<Column style={{ marginBottom: "1rem" }}>
				<Row height="2.5rem">
					<Row>
						<Box
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
							style={{ textAlign: "center", height: "2.5rem" }}
							line="250%"
							editable
						/>
						<Button onClick={() => httppost("/uav/commands/jump", { "command": waypointNum })}>Go!</Button>
					</Row>
					<Button onClick={() => httppost("/uav/commands/jump", { "command": 1 })}>Waypoints (#1?)</Button>
					<Button onClick={() => httppost("/uav/commands/jump", { "command": 20 })}>Odlc (#20?)</Button>
					<Button onClick={() => httppost("/uav/commands/jump", { "command": 50 })}>Map (#50?)</Button>
				</Row>
			</Column>
			<Column>
				<Row id="labels3" height="2rem" gap="0.5rem">
					<Label columns={1}>Mission</Label>
				</Row>
			</Column>
			<Column style={{ marginBottom: "1rem" }}>
				<Row height="2.5rem">
					<Button href="http://localhost:5000/uav/commands/view" newTab={true} title="Open the plane Pixhawk mission file in a new tab.">View</Button>
					<Button onClick={() => httppost("/uav/commands/write")} title="Write the Pixhawk mission file to the plane.">Write</Button>
					<Button onClick={() => httppost("/uav/commands/load")} title="Load the Pixhawk mission file from the plane into the backend.">Load</Button>
					<Button onClick={() => httppost("/uav/commands/clear")} title="Clear the mission file in the backend, but not the plane.">Clear</Button>
					<Button warning={true} color={darkred} onClick={() => httppost("/uav/terminate")} title="Make the plane terminate (force it to crash), if configured.">Terminate</Button>
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
`

const StyledDiv = styled.div`
	display: flex;
	margin-bottom: 1em;
`

export default Main