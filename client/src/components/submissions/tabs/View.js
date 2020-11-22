import React from "react"
import styled from "styled-components"
import { darker } from "theme/Colors"

import { Box, Checkbox } from "../../UIElements"
import { Row, Column } from "../../Containers"

const ViewRow = ({ info, number, active: [active, setActive], data: [data, setData] }) => (
	<ViewRowContainer clicked={active === number} onClick={() => setActive(number)}>
		<Checkbox
			style={{ gridArea: "accept" }}
			type="accept"
			callback={() => {
				setData(
					data
						.filter(v => !v.submitted)
						.map((v, i) => (i === number ? { ...v, submitted: true } : v))
						.concat(...data.filter(v => v.submitted))
				)
				setActive(undefined)
			}}
		/>
		<Checkbox style={{ gridArea: "decline" }} type="decline" />
		<Box style={{ gridRow: "span 2" }} />
		<Row height="4rem">
			<Box content={info.shape} label="Shape" line="250%" />
			<Box content={info.letter} label="Letter" line="250%" />
			<Box content={info.orientation} label="Orientation" line="250%" />
		</Row>
		<Row height="4rem">
			<Box content={info.shapeColor} label="Shape Color" line="250%" />
			<Box content={info.letterColor} label="Letter Color" line="250%" />
			<Box content={`${info.latitude} / ${info.longitude}`} label="Position" line="250%" />
		</Row>
	</ViewRowContainer>
)

const ViewRowContainer = styled.div`
	display: grid;
	height: calc(9rem + 16px);
	gap: 1rem;
	grid-template-columns: 3rem 9rem auto;
	grid-template-rows: 1fr 1fr;
	grid-template-areas:
		"accept image  upper"
		"decline image lower";
	background: ${({ clicked }) => (clicked ? "#00000015" : darker)};
	padding: 8px ${({ clicked }) => (clicked ? 0 : 0)}px;
`

const View = ({ unsubmitted, data: [data, setData], active: [active, setActive] }) => {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "calc(100vh - 9.5rem)",
			}}
		>
			<Container>
				{unsubmitted.map((row, i) => (
					<ViewRow
						key={i}
						number={i}
						info={row}
						active={[active, setActive]}
						data={[data, setData]}
					/>
				))}
			</Container>
		</div>
	)
}

export default View

const Container = styled(Column).attrs({
	height: "unset",
	gap: "4rem",
})`
	overflow-y: auto;
	margin-bottom: 2rem;
`
