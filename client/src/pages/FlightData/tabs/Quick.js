import React, { useState, useEffect } from "react"
import { Box, Label } from "components/UIElements"
import { Row, Column } from "components/Containers"

import styled from "styled-components"
import { ReactComponent as RawUGV } from "icons/ugv.svg"
import { ReactComponent as RawUAV } from "icons/uav.svg"
import { httpget } from "../../../backend"

const Quick = () => {
	const [Aarmed, setAarmed] = useState("")
	const [Aorientation, setAorientation] = useState({ "yaw": 0, "pitch": 0, "roll": 0 })
	const [AlatLong, setAlatLong] = useState({ "lat": 0, "lon": 0 })
	const [Aaltitude, setAaltitude] = useState(0)
	const [Abattery, setAbattery] = useState(16)
	const [AgroundSpeed, setAgroundSpeed] = useState(0)
	const [Aairspeed, setAairspeed] = useState(0)
	const [Astatus, setAstatus] = useState("")
	const [Amode, setAmode] = useState("")
	const [Awaypoint, setAwaypoint] = useState([1, 0])
	const [Aconnection, setAconnection] = useState([95, 0, 95])

	const [Garmed, setGarmed] = useState("")
	const [GgroundSpeed, setGgroundSpeed] = useState(0)
	const [Gyaw, setGyaw] = useState(0)
	const [GlatLong, setGlatLong] = useState({ "lat": 0, "lon": 0 })
	const [Gstatus, setGstatus] = useState("")
	const [Gmode, setGmode] = useState("")
	const [Gdestination, setGdestination] = useState(0)
	const [Gbattery, setGbattery] = useState(16)
	const [Gconnection, setGconnection] = useState([95, 0, 95])

	const updateData = () => {
		httpget("/uav/stats", response => {
				let data = response.data

				setAarmed(data.result.armed)
				setAorientation({"yaw": data.result.quick.orientation.yaw, "roll": data.result.quick.orientation.roll, "pitch": data.result.quick.orientation.pitch })
				setAlatLong({"lat": data.result.quick.lat, "lon": data.result.quick.lon})
				setAaltitude(data.result.quick.altitude)
				setAbattery(data.result.quick.battery)
				setAgroundSpeed(data.result.quick.ground_speed)
				setAairspeed(data.result.quick.air_speed)
				setAstatus(data.result.status)
				setAmode(data.result.mode)
				setAwaypoint(data.result.quick.waypoint)
				setAconnection(data.result.quick.connection)
			})
		httpget("/ugv/stats", response => {
				let data = response.data

				setGarmed(data.result.armed)
				setGgroundSpeed(data.result.quick.ground_speed)
				setGyaw(data.result.quick.yaw)
				setGlatLong({"lat": data.result.quick.lat, "lon": data.result.quick.lon})
				setGstatus(data.result.status)
				setGmode(data.result.mode)
				setGdestination(data.result.quick.destination[1])
				setGbattery(data.result.quick.battery)
				setGconnection(data.result.quick.connection)
			})
	}

	useEffect(() => {
		const tick = setInterval(() => {
			updateData()
		}, 500)
		return () => clearInterval(tick)
	}, [])

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "calc(100vh - 9.5rem)",
			}}
		>
			<StyledDiv>
				<Label className="paragraph" style={{ "font-size": "2em", color: "black", "margin-top": "auto", "margin-bottom": 0 }}>UAV</Label>
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
						<Box label=" " content={Aarmed} />
					</Row>
				</Row>
				<Row style={{ gap: "1rem" }}>
					<Row>
						<Box label="Latitude" content={Math.abs(AlatLong.lat).toFixed(8) + "\u00B0"} />
						<Box label="Longitude" content={Math.abs(AlatLong.lon).toFixed(8) + "\u00B0"} />
					</Row>
					<Row>
						<Box label="Altitude" content={Aaltitude.toFixed(2) + " ft"} />
						<Box label="Battery (6S)" content={Abattery.toFixed(2) + "V"} />
					</Row>
				</Row>
				<Row style={{ gap: "1rem" }}>
					<Row>
						<Box label="Ground Speed" content={AgroundSpeed.toFixed(2) + " mph"} />
						<Box label="Airspeed" content={Aairspeed.toFixed(2) + " mph"} />
					</Row>
					<Row>
						<Box label="Status" content={Astatus} />
						<Box label="Mode" content={Amode} />
					</Row>
				</Row>
				<Row style={{ gap: "1rem" }}>
					<Row>
						<Box label="Waypoint #" content={"#" + (Awaypoint[0] + 1).toFixed(0)} />
						<Box label="Distance" content={Awaypoint[1].toFixed(2) + " ft"} />
					</Row>
					<Row>
						<Box label="GPS HDOP" content={Aconnection[0].toFixed(2)} />
						<Box label="GPS VDOP" content={Aconnection[1].toFixed(2)} />
						<Box label="Satellites" content={Aconnection[2].toFixed(0)} />
					</Row>
				</Row>
			</Column>
			<StyledDiv style={{marginTop: "1rem"}}>
				<Label className="paragraph" style={{"font-size": "2em", "color": "black"}}>UGV</Label>
				<UGV />
			</StyledDiv>
			<Column style={{ marginBottom: "1rem", gap: "0.5rem" }}>
				<Row style={{ gap: "1rem" }}>
					<Row>
						<Box label="Ground Speed" content={GgroundSpeed.toFixed(2) + " mph"} />
						<Box label="Yaw" content={Gyaw + "\u00B0"} />
					</Row>
					<Row>
						<Box label=" " content={Garmed} />
					</Row>
				</Row>
				<Row style={{ gap: "1rem" }}>
					<Row>
						<Box label="Latitude" content={Math.abs(GlatLong.lat).toFixed(8) + "\u00B0"} />
						<Box label="Longitude" content={Math.abs(GlatLong.lon).toFixed(8) + "\u00B0"} />
					</Row>
					<Row>
						<Box label="Status" content={Gstatus} />
						<Box label="Mode" content={Gmode} />
					</Row>
				</Row>
				<Row style={{ gap: "1rem" }}>
					<Row>
						<Box label="To Destination" content={Gdestination.toFixed(2) + " ft"} />
						<Box label="Battery" content={Gbattery.toFixed(2) + "V"} />
					</Row>
					<Row>
						<Box label="GPS HDOP" content={Gconnection[0].toFixed(2)} />
						<Box label="GPS VDOP" content={Gconnection[1].toFixed(2)} />
						<Box label="Satellites" content={Gconnection[2].toFixed(0)} />
					</Row>
				</Row>
			</Column>
		</div>
	)
}

const UAV = styled(RawUAV)`
	height: 6em;
	width: 8em;
	margin-right: 0;
	margin-left: auto;
	margin-bottom: -2em;
`

const UGV = styled(RawUGV)`
	height: 4em;
	width: 5em;
	margin-right: 0;
	margin-left: auto;
	margin-bottom: -1em;
`

const StyledDiv = styled.div`
	display: flex;
	margin-bottom: 1em;
`

export default Quick