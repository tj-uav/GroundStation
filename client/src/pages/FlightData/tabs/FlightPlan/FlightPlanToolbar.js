import React, { useEffect, useState } from "react"
import { Box, Button, RadioList } from "components/UIElements"
import { red } from "theme/Colors"
import { httppost } from "backend"

import { Modal, ModalHeader, ModalBody } from "components/Containers"

const FlightPlanToolbar = props => {
	const [open, setOpen] = useState(false)
	const [missing, setMissing] = useState([])

	useEffect(() => {
		let radio = document.getElementById(props.mode)
		radio.checked = true
	}, [])

	const savePath = (path) => {
		for (const [i, marker] of path.entries()) {
			if (marker.opacity) {
				path = [...path.slice(0, i), { ...marker, opacity: 1 }, ...path.slice(i + 1)]
			}
		}
		props.setters.path(path)

		props.setSaved(true)
		props.setters.pathSave(path)

		httppost("/uav/commands/generate", { "waypoints": path.map(waypoint => ({ ...waypoint, lon: waypoint.lng, alt: waypoint.alt / 3.281 })) }) // convert feet to meters for altitude
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
			<RadioList onChange={event => props.setMode(event.target.value)} name="pointMode">
				<RadioList.Option color="#10336B" value="disabled">Don't make points</RadioList.Option>
				<RadioList.Option color="#10336B" value="push">Push Mode</RadioList.Option>
				<RadioList.Option color="#10336B" value="insert">Insertion Mode</RadioList.Option>
			</RadioList>
			<div style={{ "margin-top": "1em", "display": "flex", "align-items": "center" }}>
				Default Altitude (ft):
				<Box style={{ "width": "10em", "margin-left": "0.5em" }} editable={true} content={props.getters.defaultAlt} onChange={(v) => {
					if (!Number.isNaN(Number(v)) && v.length > 0) {
						if (v.endsWith(".")) {
							props.setters.defaultAlt(100)
						} else {
							props.setters.defaultAlt(Number(v))
						}
						return v
					} else if (v.substring(0, v.length - 1).endsWith(".")) {
						return v.substring(0, v.length - 1)
					} else if (v.length === 0) {
						props.setters.defaultAlt(100)
						return v
					} else if (v.substring(0, Math.max(v.length - 1, 1)) === "-") {
						props.setters.defaultAlt(100)
						return v.substring(0, Math.max(v.length - 1, 1))
					} else if (Number.isNaN(parseFloat(v))) {
						return ""
					}

					return props.getters.defaultAlt
				}} />
			</div>
			{props.getters.path.length === 0 ? null :
				<Button style={{ "margin-top": "1em", "width": "15em" }} onClick={() => {
					props.setters.path([])
					props.setSaved(false)
				}}>Reset path</Button>
			}
			{props.saved == true ? null : (
				<div style={{ "display": "flex", "margin-top": "1em", "gap": "1em", "align-items": "center" }}>
						<Button style={{ "width": "11.5em" }} onClick={() => {
							let miss = []
							for (const [i, value] of props.getters.path.entries()) {
								if (!value.alt) {
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
						<Button style={{ "width": "11.5em" }} onClick={() => {
							props.setters.path(props.getters.pathSave)
							props.setSaved(true)
						}}>Discard Changes</Button>
						<span style={{ color: red }}>You have unsaved points!</span>
				</div>
			)}
			{props.getters.path.length === 0 ? (
				<Button style={{ "width": "11.25em", "margin-top": "2em" }} onClick={() => {
					props.setters.path(props.getters.waypoints.slice())
					props.setSaved(false)
				}}>Use Mission Waypoints As Path</Button>
			) : null}
		</div>
	)
}

export default FlightPlanToolbar
