import React, { useState, useEffect, useRef } from "react"
import { Button, Box, Label, Slider, Dropdown } from "components/UIElements"
import { Row, Column } from "components/Containers"
import regexParse from "regex-parser"
import { red } from "../../../theme/Colors"

const actions = {
	waypoint: [0, 1, 2, 3, 4]
}

const Actions = () => {

	const updateData = () => {}

	useEffect(() => {
		const tick = setInterval(() => {
			updateData()
		}, 250)
		return () => clearInterval(tick)
	})

	const inputBox = useRef(null)

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "calc(100vh - 9.5rem)",
			}}
		>
			<Column>
				<Row id="labels1" height="2rem" gap="0.5rem">
					<Label columns={1}>Flight Modes</Label>
				</Row>
			</Column>

			<Column style={{ marginBottom: "1rem" }}>
				<Row>
					<Button>AUTO</Button>
					<Button>MANUAL</Button>
					<Button>STABILIZE</Button>
					<Button>LOITER</Button>
					<Button>CIRCLE</Button>
					<Button>RTL</Button>
				</Row>
			</Column>

			<Column>
				<Row id="labels2" height="2rem" gap="0.5rem">
					<Label columns={1}>Waypoints</Label>
				</Row>
			</Column>
			<Column style={{ marginBottom: "1rem" }}>
				<Row style={{ gap: "1rem" }}>
					<Row>
						<Box
							ref={inputBox}
							onKeyDown={e => {
								if (e.nativeEvent.key === "Enter") e.preventDefault()
								e.stopPropagation()
							}}
							placeholder="#"
							style={{ textAlign: "center" }}
							line="360%"
							editable
						/>
						<Button>GO!</Button>
					</Row>
					<Button>WAYPOINTS (#1)</Button>
					<Button>ODLC (#20)</Button>
					<Button>MAP (#50)</Button>
				</Row>
			</Column>

			<Column>
				<Row id="labels3" height="2rem" gap="0.5rem">
					<Label columns={1}>Mission</Label>
				</Row>
			</Column>
			<Column style={{ marginBottom: "1rem" }}>
				<Row>
					<Button>START</Button>
					<Button>RESTART</Button>
					<Button red={true}>ABORT LANDING</Button>
				</Row>
			</Column>

			<Column>
				<Row id="labels4" height="2rem" gap="0.5rem">
					<Label columns={1}>Configuration</Label>
				</Row>
			</Column>
			<Column style={{ marginBottom: "1rem" }}>
				<Row>
					<Button red={true}>SET HOME ALT</Button>
					<Button red={true}>CALIBRATION</Button>
					<Button red={true}>ARM/DISARM</Button>
					<Button red={true}>RESTART</Button>
				</Row>
			</Column>
			<Box label="" content="LEVEL" />
		</div>
	)
}

export default Actions
