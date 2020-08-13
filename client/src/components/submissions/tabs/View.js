import React from "react"
import styled from "styled-components"

import { Box, Checkbox } from "../../UIElements"
import { Row, Column } from "../../Containers"

const ViewRow = ({ shape, shapeColor, letter, letterColor, orientation, field }) => {
	return (
		<ViewRowContainer>
			<Checkbox style={{ gridArea: "accept" }} type="accept" />
			<Checkbox style={{ gridArea: "decline" }} type="decline" />
			<Box style={{ gridRow: "span 2" }} />
			<Row height="4rem">
				<Box content={shape} label="Shape" line="250%" />
				<Box content={letter} label="Letter" line="250%" />
				<Box content={orientation} label="Orientation" line="250%" />
			</Row>
			<Row height="4rem">
				<Box content={shapeColor} label="Shape Color" line="250%" />
				<Box content={letterColor} label="Letter Color" line="250%" />
				<Box content={field} label="Field" line="250%" />
			</Row>
		</ViewRowContainer>
	)
}

const ViewRowContainer = styled.div`
	display: grid;
	height: 9rem;
	gap: 1rem;
	grid-template-columns: 3rem 9rem auto;
	grid-template-rows: 1fr 1fr;
	grid-template-areas:
		"accept image  upper"
		"decline image lower";
`

const View = props => {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "calc(100vh - 9.5rem)",
			}}
		>
			<Container>
				<ViewRow
					shape={"Square"}
					shapeColor={"Blue"}
					letter={"A"}
					letterColor={"Red"}
					orientation={420}
					field={"VIEW: IDK wut this is"}
				/>
				<ViewRow
					shape={"Square"}
					shapeColor={"Blue"}
					letter={"A"}
					letterColor={"Red"}
					orientation={420}
					field={"VIEW: IDK wut this is"}
				/>
				<ViewRow
					shape={"Square"}
					shapeColor={"Blue"}
					letter={"A"}
					letterColor={"Red"}
					orientation={420}
					field={"VIEW: IDK wut this is"}
				/>
				<ViewRow
					shape={"Square"}
					shapeColor={"Blue"}
					letter={"A"}
					letterColor={"Red"}
					orientation={420}
					field={"VIEW: IDK wut this is"}
				/>
				<ViewRow
					shape={"Square"}
					shapeColor={"Blue"}
					letter={"A"}
					letterColor={"Red"}
					orientation={420}
					field={"VIEW: IDK wut this is"}
				/>
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
