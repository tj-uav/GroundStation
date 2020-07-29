import React, { useState, useEffect } from "react"
import { Button, Box, Label, Slider, Dropdown } from "../../UIElements"
import { Row, Column } from "../../Containers"

const actions = {
	actions: ["actions"],
	waypoint: ["waypoints"],
	flight: [
		"Manual",
		"CIRCLE",
		"STABILIZE",
		"TRAINING",
		"ACRO",
		"FBWA",
		"FBWB",
		"CRUISE",
		"AUTOTUNE",
		"Auto",
		"RTL",
		"Loiter",
		"AVOID_ADSB",
		"Guided",
		"QSTABILIZE",
		"QHOVER",
		"QLOITER",
		"QLAND",
		"QRTL",
		"INITIALIZING",
		"QStabilize",
		"QHover",
		"QLoiter",
		"QLand",
	],
	mount: ["mount"],
}

const LabelledSlider = ({ for: label, hook, ...props }) => {
	const [value, setValue] = hook

	return (
		<Column gap="0" style={{ display: "initial" }} {...props}>
			<Label>{label}</Label>
			<Row columns="repeat(4, minmax(0, 1fr))" gap="0.5rem">
				<Box content={value} style={{ marginRight: "0.5rem" }} />
				<Slider
					style={{ gridColumn: "span 3" }}
					initial={value}
					onChange={e => {
						console.log(e.target.value)
						setValue(e.target.value)
					}}
				/>
			</Row>
		</Column>
	)
}

const DropdownRow = ({ with: buttons, ...props }) => {
	const indent = index => (index === 0 ? { marginRight: "0.5rem" } : null)

	return (
		<Row height="2rem" gap="0.5rem" {...props}>
			{buttons.map((button, index) => {
				return index === 0 ? (
					<Dropdown
						initial={button.name}
						children={actions[button.name.toLowerCase()].map(o => (
							<span>{o}</span>
						))}
					/>
				) : (
					<Button key={index} style={indent(index)}>
						{button.name}
					</Button>
				)
			})}
		</Row>
	)
}

const Actions = props => {
	const [speed, setSpeed] = useState(0)
	const [altitude, setAltitude] = useState(0)
	const [loiterRate, setLoiterRate] = useState(0)

	const updateData = () => {}

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
			<Column>
				<Row id="labels" height="2rem" gap="0.5rem">
					<Label columns={1}>Dropdown</Label>
					<Label columns={3}>Functions</Label>
				</Row>
			</Column>

			<Column style={{ marginBottom: "1rem" }}>
				<DropdownRow
					with={[
						{ name: "Actions" },
						{ name: "Do Action" },
						{ name: "Auto" },
						{ name: "Set Home Alt" },
					]}
				/>

				<DropdownRow
					with={[
						{ name: "Waypoint" },
						{ name: "Set Waypoint" },
						{ name: "Loiter" },
						{ name: "Restart Mission" },
					]}
				/>

				<DropdownRow
					with={[
						{ name: "Flight" },
						{ name: "Set Mode" },
						{ name: "RTL" },
						{ name: "Raw View" },
					]}
				/>

				<DropdownRow
					with={[
						{ name: "Mount" },
						{ name: "Set Mount" },
						{ name: "Clear Track" },
						{ name: "Arm or Disarm" },
					]}
				/>

				<LabelledSlider for="Speed" hook={[speed, setSpeed]} />
				<LabelledSlider for="Altitude" hook={[altitude, setAltitude]} />
				<LabelledSlider for="Loiter Rate" hook={[loiterRate, setLoiterRate]} />
			</Column>
			<Box label="Console + Error Messages" error />
		</div>
	)
}

export default Actions
