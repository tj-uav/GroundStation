import React from "react"
import { Box } from "components/UIElements"
import { Row, Column } from "components/Containers"

const SubmittedRow = ({ info }) => {
	return (
		<Column gap="1rem">
			<Row height="4rem">
				<Box content={info.shape} label="Shape" line="250%" />
				<Box content={info.letter} label="Letter" line="250%" />
				<Box content={info.orientation} label="Orientation" line="250%" />
			</Row>
			<Row height="4rem">
				<Box content={info.shapeColor} label="Shape Color" line="250%" />
				<Box content={info.letterColor} label="Letter Color" line="250%" />
				<Box
					content={`${info.latitude} / ${info.longitude}`}
					label="Position"
					line="250%"
				/>
			</Row>
		</Column>
	)
}

const Submitted = ({ submitted }) => {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				overflowY: "auto",
			}}
		>
			<div style={{ height: "calc(100vh - 9.5rem)" }}>
				<Column gap="2rem" style={{ overflowY: "auto", height: "unset" }}>
					{submitted.map((v, i) => (
						<SubmittedRow key={i} info={v} />
					))}
				</Column>
			</div>
		</div>
	)
}

export default Submitted
