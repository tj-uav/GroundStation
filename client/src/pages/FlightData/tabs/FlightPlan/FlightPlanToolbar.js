import React, { useEffect, useState } from "react"
import { Button, RadioList } from "components/UIElements"
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

	return (
		<div style={{ marginLeft: 10 }}>
			<Modal open={open} setOpen={setOpen}>
				<ModalHeader>Missing Altitudes</ModalHeader>
				<ModalBody>Some path points don't have a set altitude. Set all the altitudes to save the points to the backend. You're missing altitudes on points: <br /> <br /> {missing.join(", ")}</ModalBody>
			</Modal>
			<RadioList onChange={event => props.setMode(event.target.value)} name="pointMode">
				<RadioList.Option color="#10336B" value="disabled">Don't make points</RadioList.Option>
				<RadioList.Option color="#10336B" value="push">Push Mode</RadioList.Option>
				<RadioList.Option color="#10336B" value="insert">Insertion Mode</RadioList.Option>
			</RadioList>
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

							let path = props.getters.path
							for (const [i, marker] of path.entries()) {
								if (marker.opacity) {
									path = [...path.slice(0, i), { ...marker, opacity: 1 }, ...path.slice(i + 1)]
								}
							}
							props.setters.path(path)

							props.setSaved(true)
							props.setters.pathSave(props.getters.path)
							httppost("/uav/commands/generate", { "waypoints": props.getters.path.map(waypoint => ({ ...waypoint, lon: waypoint.lng, alt: waypoint.alt / 3.281 })) }) // convert feet to meters for altitude
						}}>Click to save</Button>
						<Button style={{ "width": "11.5em" }} onClick={() => {
							props.setters.path(props.getters.pathSave)
							props.setSaved(true)
						}}>Discard Changes</Button>
						<span style={{ color: red }}>You have unsaved points!</span>
				</div>
			)}
		</div>
	)
}

export default FlightPlanToolbar
