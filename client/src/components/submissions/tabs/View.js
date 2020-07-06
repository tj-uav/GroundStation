import React, { useState, useEffect } from "react"
import { Button, Box, Label } from "../../UIElements"
import { Row, Column } from "../../Containers"
import styled from "styled-components"

const ViewRow = ({ shape, shapeColor, letter, letterColor, orientation, field, ...props }) => {
	return (
		<ViewRowContainer>
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
	grid-template-columns: 9rem auto;
	grid-template-rows: 1fr 1fr;
`

const View = props => {
	// const [altitude, setAltitude] = useState(0)
	// const [orientation, setOrientation] = useState(0)
	// const [groundSpeed, setGroundSpeed] = useState(0)
	// const [airspeed, setAirspeed] = useState(0)
	// const [text, setText] = useState(0)
	// const [battery, setBattery] = useState(0)
	// const [throttle, setThrottle] = useState(0)
	// const [latLong, setLatLong] = useState(0)

	// const updateData = () => {
	// 	setAltitude(Math.floor(Math.random() * 200) + 100)
	// 	setOrientation(Math.floor(Math.random() * 360))
	// 	setGroundSpeed(Math.floor(Math.random() * 50) + 25)
	// 	setAirspeed(Math.floor(Math.random() * 50) + 25)
	// 	setText("N/A")
	// 	setBattery(Math.floor(Math.random() * 100))
	// 	setThrottle(Math.floor(Math.random() * 100))
	// 	setLatLong([Math.floor(Math.random() * 360), Math.floor(Math.random() * 360)])
	// }

	// useEffect(() => {
	// 	const tick = setInterval(() => {
	// 		updateData()
	// 	}, 250)
	// 	return () => clearInterval(tick)
	// })

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "calc(100vh - 9.5rem)",
			}}
		>
			<Column height="unset" gap="4rem" style={{ overflowY: "auto" }}>
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
				{/* <ViewRow shape={"Square"} shapeColor={"Blue"} letter={"A"} letterColor={"Red"} orientation={420} field={"IDK wut this is"} />
				<ViewRow shape={"Square"} shapeColor={"Blue"} letter={"A"} letterColor={"Red"} orientation={420} field={"IDK wut this is"} />
				<ViewRow shape={"Square"} shapeColor={"Blue"} letter={"A"} letterColor={"Red"} orientation={420} field={"IDK wut this is"} />
				<ViewRow shape={"Square"} shapeColor={"Blue"} letter={"A"} letterColor={"Red"} orientation={420} field={"IDK wut this is"} />
				<ViewRow shape={"Square"} shapeColor={"Blue"} letter={"A"} letterColor={"Red"} orientation={420} field={"IDK wut this is"} /> */}
			</Column>
		</div>
	)
}

export default View
