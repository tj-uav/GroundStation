import React, { useEffect, useState } from "react"
import { Box, Button, Dropdown, RadioList } from "components/UIElements"
import { red } from "theme/Colors"
import { httppost } from "backend"

import { Modal, ModalHeader, ModalBody } from "components/Containers"
import Commands from "commands"

const FlightPlanToolbar = props => {
	const [open, setOpen] = useState(false)
	const [missing, setMissing] = useState([])

	useEffect(() => {
		let radio = document.getElementById(props.getters.mode)
		radio.checked = true
	}, [])

	const savePath = (path) => {
		for (const [i, marker] of path.entries()) {
			if (marker.opacity) {
				path = [...path.slice(0, i), { ...marker, opacity: 1 }, ...path.slice(i + 1)]
			}
		}
		props.setters.path(path)

		props.setters.pathSave(path)
		props.setters.pathSaved(true)

		httppost("/uav/commands/generate", {"waypoints": path.map(waypoint => ({
				...waypoint,
				lat: waypoint.lat ?? 0.0,  // if jump
				lon: waypoint.lng ?? 0.0,  // if jump
				alt: (waypoint.alt ?? 0.0) / 3.281,  // altitude to m
				p3: (waypoint.p3 ?? 0.0) / 3.281,  // loiter radius to m
		})) })
	}

	return (
		<div style={{ marginLeft: 10 }}>
			<Modal open={open} setOpen={setOpen}>
				<ModalHeader>Missing Altitudes</ModalHeader>
				<ModalBody>Some path points don't have a set altitude. Set all the altitudes to save the points to the backend. You're missing altitude{missing.length > 1 ? "s" : ""} on point{missing.length > 1 ? "s" : ""}: <br /> <br /> {missing.map(i => i + 1).join(", ")} <br />
				<br /><Button style={{ "width": "15em" }} onClick={() => {
					let path = props.getters.path.slice()
					for (let i of missing) {
						path[i].alt = props.getters.defaultAlt
					}

					setOpen(false)
					savePath(path)
				}}>Set as default ({props.getters.defaultAlt} ft)</Button></ModalBody>
			</Modal>
			<div style={{ marginBottom: "1rem", width: "10em" }}>
				<Dropdown initial={"Disabled"} onChange={(v) => {
					props.setters.placementMode(v)
				}}>
					<span value="disabled">Disable</span>
					<span value="push">Push</span>
					<span value="insert">Insert</span>
				</Dropdown>
			</div>
			<RadioList onChange={event => { props.setters.mode(event.target.value); console.log(event.target.value) }} name="pointMode">
				<RadioList.Option color="#10336B" value="waypoint">Waypoints</RadioList.Option>
				<RadioList.Option color="#10336B" value="jump">Add Jump</RadioList.Option>
				<RadioList.Option color="#10336B" value="unlimLoiter">Unlimited Loiter</RadioList.Option>
				<RadioList.Option color="#10336B" value="turnLoiter">Turn Loiter</RadioList.Option>
				<RadioList.Option color="#10336B" value="timeLoiter">Time Loiter</RadioList.Option>
			</RadioList>
			<div style={{ "margin-top": "1em", "display": "flex", "align-items": "center" }}>
				Default Altitude (ft):
				<Box style={{ "width": "10em", "margin-left": "0.5em" }} editable={true} content={props.getters.defaultAlt} onChange={(v) => {
					if (!Number.isNaN(Number(v)) && v.length > 0) {
						if (v.endsWith(".")) {
							props.setters.defaultAlt(125)
						} else {
							props.setters.defaultAlt(Number(v))
						}
						return v
					} else if (v.substring(0, v.length - 1).endsWith(".")) {
						return v.substring(0, v.length - 1)
					} else if (v.length === 0) {
						props.setters.defaultAlt(125)
						return v
					} else if (v.substring(0, Math.max(v.length - 1, 1)) === "-") {
						props.setters.defaultAlt(125)
						return v.substring(0, Math.max(v.length - 1, 1))
					} else if (Number.isNaN(parseFloat(v))) {
						return ""
					}

					return props.getters.defaultAlt
				}} />
			</div>
			<Button disabled={props.getters.path.length === 0} style={{ "margin-top": "1em", "width": "15em" }} onClick={() => {
				props.setters.path([])
				props.setters.pathSaved(false)
			}}>Clear path</Button>
			<div style={{ "display": "flex", "margin-top": "1em", "gap": "1em", "align-items": "center" }}>
					<Button style={{ "width": "11.5em" }} disabled={props.getters.pathSaved} onClick={() => {
						let miss = []
						for (const [i, value] of props.getters.path.entries()) {
							if (!value.alt && value.cmd !== Commands.jump) {
								miss.push(i)
							}
						}
						if (miss.length > 0) {
							setMissing(miss)
							setOpen(true)
							return
						}

						savePath(props.getters.path)
					}}>Click to save</Button>
					<Button style={{ "width": "11.5em" }} disabled={props.getters.pathSaved} onClick={() => {
						console.log(props.getters.pathSave)
						props.setters.path(structuredClone(props.getters.pathSave))
						props.setters.pathSaved(true)
					}}>Discard Changes</Button>
					{props.getters.pathSaved ? null :
						<span style={{ color: red }}>You have unsaved points!</span>
					}
			</div>
		</div>
	)
}

export default FlightPlanToolbar
