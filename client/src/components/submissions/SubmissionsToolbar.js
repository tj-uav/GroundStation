import React, { useState, useEffect } from "react"
import { Button, Box, Label, Slider, Dropdown, Checkbox } from "../UIElements"
import { Row, Column } from "../Containers"
import styled from "styled-components"

const OrientationSlider = ({ for: label, hook, ...props }) => {
	const [value, setValue] = hook

	return (
		<Column gap="0" style={{ display: "initial" }} {...props}>
			<Label>{label}</Label>
			<Row columns="repeat(4, minmax(0, 1fr))" gap="0.5rem">
				<Box content={value} style={{ marginRight: "0.5rem" }} />
				<Slider
					style={{ gridColumn: "span 3" }}
					min={0}
					max={359}
					initial={value}
					onChange={e => {
						setValue(e.target.value)
					}}
				/>
			</Row>
		</Column>
	)
}

const SubmissionsToolbar = props => {
	const [orientation, setOrientation] = useState(0)

	const updateData = () => {}

	useEffect(() => {
		const tick = setInterval(() => {
			updateData()
		}, 250)
		return () => clearInterval(tick)
	})

	return (
		<Container>
			<Box />
			<ContentContainer>
				<Column>
					<Row height="3rem" gap="0.5rem">
						<Checkbox type="accept" />
						<Checkbox type="decline" />
					</Row>
					<Row height="2rem" gap="0.5rem">
						<Label columns={1}>Shape</Label>
						<Label columns={1}>Shape Color</Label>
					</Row>
				</Column>

				<Column style={{ marginBottom: "1rem" }}>
					<Row height="3rem" gap="0.5rem">
						<Dropdown>
							<span>Square</span>
							<span>Circle</span>
							<span>Star</span>
							<span>Triangle</span>
						</Dropdown>
						<Dropdown>
							<span>Red</span>
							<span>Orange</span>
							<span>Yellow</span>
							<span>Green</span>
							<span>Blue</span>
							<span>Purple</span>
						</Dropdown>
					</Row>
				</Column>

				<Column>
					<Row height="2rem" gap="0.5rem">
						<Label columns={1}>Letter</Label>
						<Label columns={1}>Letter Color</Label>
					</Row>
				</Column>

				<Column style={{ marginBottom: "1rem" }}>
					<Row height="3rem" gap="0.5rem">
						<Box editable="True" content={"A"} />
						<Dropdown>
							<span>Red</span>
							<span>Black</span>
							<span>Orange</span>
							<span>Yellow</span>
							<span>Green</span>
							<span>Blue</span>
							<span>Purple</span>
						</Dropdown>
					</Row>
				</Column>

				<Column style={{ marginBottom: "1rem" }}>
					<Row height="5rem" gap="0.5rem">
						<OrientationSlider for="Orientation" hook={[orientation, setOrientation]} />
					</Row>
				</Column>

				<Column style={{ marginBottom: "1rem" }}>
					<Row height="5rem" gap="0.5rem">
						<Box label="Latitude" editable="True" content={0} />
						<Box label="Longitude" editable="True" content={0} />
					</Row>
				</Column>

				<Column style={{ marginBottom: "1rem" }}>
					<Row height="5rem" gap="0.5rem">
						<Box
							label="Description (emergent objects only)"
							editable="True"
							content={"Enter description"}
						/>
					</Row>
				</Column>
			</ContentContainer>
		</Container>
	)
}

const ContentContainer = styled.div`
	display: flex;
	flex-direction: column;
	height: calc(100vh - 9.5rem);
`

const Container = styled.div`
	display: grid;
	gap: 1rem;
	grid-template-columns: 29rem auto;
	grid-template-rows: 29rem auto;
`

export default SubmissionsToolbar
