import React, { useEffect, useRef } from "react"
import { Row, Column } from "components/Containers"
import { Checkbox, Dropdown, Label, Box, Slider } from "components/UIElements"

import { shapes, colors } from "./constants"

export const Checkboxes = ({ accept, save, decline, vertical, disabled }) => (
	<Row style={{ marginBottom: "1rem" }}>
		{vertical ?
				<Column width="4rem" gap="0.5rem">
					<Checkbox type="accept" callback={accept} disabled={disabled} />
					<Checkbox type="save" callback={save} disabled={disabled} />
					<Checkbox type="decline" callback={decline} disabled={disabled} />
				</Column>
			:
				<Row height="3rem" gap="0.5rem">
					<Checkbox type="accept" callback={accept} disabled={disabled} />
					<Checkbox type="save" callback={save} disabled={disabled} />
					<Checkbox type="decline" callback={decline} disabled={disabled} />
				</Row>
		}
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

		return (
			<Row style={{ marginBottom: "1rem" }} height="3rem" gap="0.5rem">
				<Dropdown
					ref={shape}
					initial={shapes[data.shape-1]}
					onChange={v => setData({ ...data, shape: v })}
				>
					{shapes.map((c, i) => {
						return (
							<span value={i+1}>{c}</span>
						)
					})}
				</Dropdown>
				<Dropdown
					ref={color}
					initial={colors[data.shape_color-1]}
					onChange={v => setData({ ...data, shape_color: v })}
				>
					{colors.map((c, i) => {
						return (
							<span value={i+1}>{c}</span>
						)
					})}
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

		return (
			<Row style={{ marginBottom: "1rem" }} height="3rem" gap="0.5rem">
				<Box
					ref={letter}
					editable="True"
					content={data.alphanumeric}
					onChange={v => {
						let value = v
						if (v.length >= 1) {
							value = v[v.length-1].toUpperCase()
							let ascii = value.charCodeAt()
							if (ascii < 65 || ascii > 90) {
								value = data.alphanumeric
							}
						} else if (v.length === 0) {
							value = data.alphanumeric
						}

						setData({ ...data, alphanumeric: value })
						return value
					}}
				/>
				<Dropdown
					ref={color}
					initial={colors[data.alphanumeric_color-1]}
					onChange={v => setData({ ...data, alphanumeric_color: v })}
				>
					{colors.map((c, i) => {
						return (
							<span value={i+1}>{c}</span>
						)
					})}
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

	return (
		<Row style={{ marginBottom: "1rem" }} height="5rem" gap="0.5rem">
			<Box
				ref={latitude}
				label="Latitude"
				editable="True"
				content={data.latitude}
				onChange={v => {
					if (!Number.isNaN(Number(v)) && v.length > 0) {
						if (v.endsWith(".")) {
							errorShadow(latitude, true)
							setData({ ...data, latitude: null })
						} else {
							errorShadow(latitude, false)
							setData({ ...data, latitude: Number(v) })
						}
						return v
					} else if (v.substring(0, v.length-1).endsWith(".")) {
						errorShadow(latitude, true)
						return v.substring(0, v.length-1)
					} else if (v.length ===0) {
						errorShadow(latitude, true)
						setData({ ...data, latitude: null })
						return v
					} else if (v.substring(0, Math.max(v.length-1, 1)) === "-") {
						errorShadow(latitude, true)
						setData({ ...data, latitude: null })
						return v.substring(0, Math.max(v.length-1, 1))
					} else if (Number.isNaN(parseFloat(v))) {
						errorShadow(latitude, true)
						return ""
					}

					errorShadow(latitude, false)
					return data.latitude
				}}
			/>
			<Box
				ref={longitude}
				label="Longitude"
				editable="True"
				content={data.longitude}
				onChange={v => {
					if (!Number.isNaN(Number(v)) && v.length > 0) {
						if (v.endsWith(".")) {
							errorShadow(longitude, true)
							setData({ ...data, longitude: null })
						} else {
							errorShadow(longitude, false)
							setData({ ...data, longitude: Number(v) })
						}
						return v
					} else if (v.substring(0, v.length-1).endsWith(".")) {
						errorShadow(longitude, true)
						return v.substring(0, v.length-1)
					} else if (v.length == 0) {
						errorShadow(longitude, true)
						setData({ ...data, longitude: null })
						return v
					} else if (v.substring(0, Math.max(v.length-1, 1)) === "-") {
						errorShadow(longitude, true)
						setData({ ...data, longitude: null })
						return v.substring(0, Math.max(v.length-1, 1))
					} else if (Number.isNaN(parseFloat(v))) {
						errorShadow(longitude, true)
						return ""
					}

					errorShadow(longitude, false)
					return data.longitude
				}}
			/>
		</Row>
	)
}

export const EmergentDesc = ({ hook: [data, setData] }) => (
	<Row height="10rem" gap="0.5rem">
		<Box
			label="Description"
			editable="True"
			line="150%"
			placeholder={"Enter description"}
			style={{ textAlign: "left", "padding-top": "1em", "padding-bottom": "1em" }}
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
					max={315}
					initial={value}
					onChange={v => {
						setValue(v)
					}}
					step={45}
					value={value}
				/>
			</Row>
		</Column>
	)
}

const errorShadow = (ref, error) => {
	ref.current.style["box-shadow"] = error ? "0 0 2.5px 2.5px red" : ""
}