import React, { useEffect, useState } from "react"
import { Box, Button, Dropdown, RadioList, Label } from "components/UIElements"
import { red } from "theme/Colors"
import { httppost } from "backend"

import { Row, Column, Modal, ModalHeader, ModalBody } from "components/Containers"
import Commands from "commands"

const FlightPlanToolbar = props => {
	const [open, setOpen] = useState(false)
	const [missing, setMissing] = useState([])

	const [modeText, setModeText] = useState("")

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

	useEffect(() => {
		if (props.getters.placementMode === "distance") {
			if (props.getters.currentDistance !== -1) {
				setModeText("Distance: " + props.getters.currentDistance.toFixed(2) + " ft")
			} else if (props.getters.firstPoint === -1) {
				setModeText("Select a start waypoint")
			} else {
				setModeText("Select an end waypoint")
			}
		} else if (["push", "insert"].includes(props.getters.placementMode)) {
			if (props.getters.placementType === "jump") {
				if (props.getters.firstJump === -1) {
					setModeText("Select a start waypoint")
				} else {
					setModeText("Select an end waypoint")
				}
			} else {
				setModeText("Click anywhere to " + props.getters.placementMode)
			}
		} else {
			setModeText("")
		}
	}, [props.getters.placementMode, props.getters.placementType, props.getters.firstJump, props.getters.firstPoint, props.getters.currentDistance])

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


			<Column style={{ marginBottom: "1rem", gap: "1.5rem" }}>
				<Row columns="minmax(0, 3fr) minmax(0, 5fr) minmax(0, 4fr)">
					<div style={{ "display": "flex", "alignItems": "center" }}>
						<span>Mode: </span>
					</div>
					<Dropdown initial={"Disabled"} onChange={(v) => {
						props.setters.placementMode(v)
						if (v !== "distance") {
							props.setters.currentDistance(-1)
						}
					}}>
						<span value="disabled">Disabled</span>
						<span value="push">Push</span>
						<span value="insert">Insert</span>
						<span value="distance">Distance Calc</span>
					</Dropdown>
					<div style={{ "display": "flex", "alignItems": "center" }}>
						<span>{modeText}</span>
					</div>
				</Row>
				<Row columns="minmax(0, 3fr) minmax(0, 5fr) minmax(0, 4fr)">
					<div style={{ "display": "flex", "alignItems": "center" }}>
						<span>Type: </span>
					</div>
					<Dropdown initial={"Waypoint"} onChange={(v) => {
						props.setters.placementType(v)
					}}>
						<span value="waypoint">Waypoint</span>
						<span value="jump">Jump</span>
						<span value="unlimLoiter">Unlimited Loiter</span>
						<span value="turnLoiter">Turn Loiter</span>
						<span value="timeLoiter">Time Loiter</span>
					</Dropdown>
					&nbsp;
				</Row>
				<Row columns="minmax(0, 3fr) minmax(0, 5fr) minmax(0, 4fr)">
					<div style={{ "display": "flex", "alignItems": "center" }}>
						<span>Default Altitude:</span>
					</div>
					<Box editable={true} content={props.getters.defaultAlt} onChange={(v) => {
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
					<div style={{ "display": "flex", "alignItems": "center" }}>
						<span>ft</span>
					</div>
				</Row>
				<br />
				{props.getters.pathSaved ? <span>&nbsp;</span> :
					<span style={{ color: red }}>You have unsaved points!</span>
				}
				<Row>
					<Row height="2.75rem"  columns="minmax(0, 4fr) minmax(0, 3fr) minmax(0, 3fr) minmax(0, 3fr) minmax(0, 3fr)">
						<div style={{ "display": "flex", "alignItems": "center" }}>
							<span>Current Path:</span>
						</div>
						<Button style={{ width: "auto" }} disabled={props.getters.path.length === 0} onClick={() => {
							props.setters.path([])
							props.setters.pathSaved(false)
						}}>Clear</Button>
						&nbsp;
						&nbsp;
						&nbsp;
					</Row>
				</Row>
				<Row>
					<Row height="2.75rem" columns="minmax(0, 4fr) minmax(0, 3fr) minmax(0, 3fr) minmax(0, 3fr) minmax(0, 3fr)">
						<div style={{ "display": "flex", "alignItems": "center" }}>
							<span>Mission File:</span>
						</div>
						<Button href="http://localhost:5000/uav/commands/view" newTab={true} title="Open the plane Pixhawk mission file in a new tab.">View</Button>
						<Button disabled={props.getters.pathSaved} onClick={() => {
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
						}}>Save To</Button>
						<Button disabled={props.getters.pathSaved} onClick={() => {
							console.log(props.getters.pathSave)
							props.setters.path(structuredClone(props.getters.pathSave))
							props.setters.pathSaved(true)
						}}>Reset To</Button>
						<Button onClick={() => httppost("/uav/commands/clear")} title="Clear the mission file in the backend, but not the plane.">Clear</Button>
					</Row>
				</Row>
				<Row>
					<Row height="2.75rem" columns="minmax(0, 4fr) minmax(0, 3fr) minmax(0, 3fr) minmax(0, 3fr) minmax(0, 3fr)">
						<div style={{ "display": "flex", "alignItems": "center" }}>
							<span>Plane: </span>
						</div>
						<Button onClick={() => httppost("/uav/commands/write")} title="Write the Pixhawk mission file to the plane.">Write To</Button>
						<Button onClick={() => httppost("/uav/commands/load")} title="Load the Pixhawk mission file from the plane into the backend.">Load From</Button>
						<Button onClick={() => httppost("/uav/sethome")} title="Set the plane's home location to the competition requirement.">Set Home</Button>
						&nbsp;
					</Row>
				</Row>
			</Column>
		</div>
	)
}

export default FlightPlanToolbar
