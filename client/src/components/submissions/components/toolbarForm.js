import React, { useEffect, useRef } from "react"
import { Row, Column } from "components/Containers"
import { Checkbox, Dropdown, Label, Box, Slider } from "components/UIElements"

export const Checkboxes = ({ accept, decline }) => (
	<Row style={{ marginBottom: "1rem" }}>
		<Row height="3rem" gap="0.5rem">
			<Checkbox type="accept" callback={accept} />
			<Checkbox type="decline" callback={decline} />
		</Row>
	</Row>
)

export const Shape = {
	Labels: () => (
		<Row height="2rem" gap="0.5rem">
			<Label columns={1}>Shape</Label>
			<Label columns={1}>Shape Color</Label>
		</Row>
	),
	Inputs: ({ hook: [data, setData] }) => {
		const shape = useRef(null)
		const color = useRef(null)

		useEffect(() => {
			colorize(shape, data.shape === undefined)
			colorize(color, data.shapeColor === undefined)
		}, [shape, color, data])

		return (
			<Row style={{ marginBottom: "1rem" }} height="3rem" gap="0.5rem">
				<Dropdown
					ref={shape}
					selected={data.shape}
					onChange={v => setData({ ...data, shape: v })}
				>
					<span>Square</span>
					<span>Circle</span>
					<span>Star</span>
					<span>Triangle</span>
				</Dropdown>
				<Dropdown
					ref={color}
					selected={data.shapeColor}
					onChange={v => setData({ ...data, shapeColor: v })}
				>
					<span>Red</span>
					<span>Orange</span>
					<span>Yellow</span>
					<span>Green</span>
					<span>Blue</span>
					<span>Purple</span>
				</Dropdown>
			</Row>
		)
	},
}

export const Letter = {
	Labels: () => (
		<Row height="2rem" gap="0.5rem">
			<Label columns={1}>Letter</Label>
			<Label columns={1}>Letter Color</Label>
		</Row>
	),
	Inputs: ({ hook: [data, setData] }) => {
		const letter = useRef(null)
		const color = useRef(null)

		useEffect(() => {
			colorize(letter, !/^[a-z]$/i.test(data.letter))
			colorize(color, data.letterColor === undefined)
		}, [letter, color, data])

		return (
			<Row style={{ marginBottom: "1rem" }} height="3rem" gap="0.5rem">
				<Box
					ref={letter}
					editable="True"
					content={data.letter}
					onChange={v => setData({ ...data, letter: v })}
				/>
				<Dropdown
					ref={color}
					selected={data.letterColor}
					onChange={v => setData({ ...data, letterColor: v })}
				>
					<span>Red</span>
					<span>Black</span>
					<span>Orange</span>
					<span>Yellow</span>
					<span>Green</span>
					<span>Blue</span>
					<span>Purple</span>
				</Dropdown>
			</Row>
		)
	},
}

export const Orientation = ({ hook: [data, setData] }) => (
	<Row style={{ marginBottom: "1rem" }} height="5rem" gap="0.5rem">
		<OrientationSlider
			hook={[data.orientation, v => setData({ ...data, orientation: parseInt(v) })]}
		/>
	</Row>
)

export const Position = ({ hook: [data, setData] }) => {
	const latitude = useRef(null)
	const longitude = useRef(null)
	const parse = v => (!Number.isNaN(parseFloat(v)) ? parseFloat(v) : "")

	useEffect(() => {
		colorize(latitude, !/^-?[0-9.]+$/.test(data.latitude))
		colorize(longitude, !/^-?[0-9.]+$/.test(data.longitude))
	}, [latitude, longitude, data])

	return (
		<Row style={{ marginBottom: "1rem" }} height="5rem" gap="0.5rem">
			<Box
				ref={latitude}
				label="Latitude"
				editable="True"
				content={data.latitude}
				onChange={v => setData({ ...data, latitude: parse(v) })}
			/>
			<Box
				ref={longitude}
				label="Longitude"
				editable="True"
				content={data.longitude}
				onChange={v => setData({ ...data, longitude: parse(v) })}
			/>
		</Row>
	)
}

export const EmergentDesc = ({ hook: [data, setData] }) => (
	<Row height="5rem" gap="0.5rem">
		<Box
			label="Description (emergent objects only)"
			editable="True"
			placeholder={"Enter description"}
			style={{ textAlign: "left" }}
			onChange={v => setData({ ...data, description: v })}
		/>
	</Row>
)

function OrientationSlider({ hook: [value, setValue], ...props }) {
	return (
		<Column gap="0" style={{ display: "initial" }} {...props}>
			<Label>Orientation</Label>
			<Row columns="repeat(4, minmax(0, 1fr))" gap="0.5rem">
				<Box content={value} style={{ marginRight: "0.5rem" }} />
				<Slider
					style={{ gridColumn: "span 3" }}
					min={0}
					max={359}
					initial={value}
					onChange={v => {
						setValue(v)
					}}
					value={value}
				/>
			</Row>
		</Column>
	)
}

function colorize(ref, error) {
	ref.current.style["box-shadow"] = error ? "0 0 2.5px 2.5px red" : ""
}
