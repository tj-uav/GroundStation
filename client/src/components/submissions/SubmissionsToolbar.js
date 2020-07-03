import React, { useState, useEffect } from "react"
import { Button, Box, Label, Slider } from "../UIElements"
import { Row, Column } from "../Containers"

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
			{buttons.map((button, index) => (
				<Button key={index} style={indent(index)}>
					{button.name}
				</Button>
			))}
		</Row>
	)
}

const SubmissionsToolbar = props => {
	const [orientation, setOrientation] = useState(0)

	const updateData = () => { }

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
					<Label columns={1}>Shape</Label>
					<Label columns={1}>Shape Color</Label>
				</Row>
			</Column>

			<Column style={{ marginBottom: "1rem" }}>
				<Row id="labels" height="3rem" gap="0.5rem">
					<Button>Dropdown</Button>
					<Button>Dropdown</Button>
				</Row>
			</Column>

			<Column>
				<Row id="labels" height="2rem" gap="0.5rem">
					<Label columns={1}>Letter</Label>
					<Label columns={1}>Letter Color</Label>
				</Row>
			</Column>

			<Column style={{ marginBottom: "1rem" }}>
				<Row id="labels" height="3rem" gap="0.5rem">
					<Box editable="True" content={"A"} />
					<Button>Dropdown</Button>
				</Row>
			</Column>

			<Column style={{ marginBottom: "1rem" }}>
				<Row id="labels" height="5rem" gap="0.5rem">
					<LabelledSlider for="Orientation" hook={[orientation, setOrientation]} />
				</Row>
			</Column>

			<Column style={{ marginBottom: "1rem" }}>
				<Row id="labels" height="5rem" gap="0.5rem">
					<Box label="Latitude" editable="True" content={0} />
					<Box label="Longitude" editable="True" content={0} />
				</Row>
			</Column>

			<Column style={{ marginBottom: "1rem" }}>
				<Row id="labels" height="5rem" gap="0.5rem">
					<Box label="Description (emergent objects only)" editable="True" content={"Enter description"} />
				</Row>
			</Column>

			{/* <LabelledSlider for="Speed" hook={[speed, setSpeed]} />
				<LabelledSlider for="Altitude" hook={[altitude, setAltitude]} />
				<LabelledSlider for="Loiter Rate" hook={[loiterRate, setLoiterRate]} /> */}

			{/* <Box label="Console + Error Messages" error /> */}
		</div>
	)
}

export default SubmissionsToolbar
