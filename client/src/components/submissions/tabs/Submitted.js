import React, { useState, useEffect } from "react"
import { Button, Box, Label } from "../../UIElements"
import { Row, Column } from "../../Containers"

const SubmittedRow = ({ shape, shapeColor, letter, letterColor, orientation, field, ...props }) => {
	return (
		<Column gap="1rem">
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
		</Column>
	)
}

const Submitted = props => {
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
			<Column gap="2rem" style={{ overflowY: "auto" }}>
				<SubmittedRow
					shape={"Square"}
					shapeColor={"Blue"}
					letter={"A"}
					letterColor={"Red"}
					orientation={420}
					field={"SUBMITTED: IDK wut this is"}
				/>
				<SubmittedRow
					shape={"Square"}
					shapeColor={"Blue"}
					letter={"A"}
					letterColor={"Red"}
					orientation={420}
					field={"SUBMITTED: IDK wut this is"}
				/>
				<SubmittedRow
					shape={"Square"}
					shapeColor={"Blue"}
					letter={"A"}
					letterColor={"Red"}
					orientation={420}
					field={"SUBMITTED: IDK wut this is"}
				/>
				{/* <SubmittedRow shape={"Square"} shapeColor={"Blue"} letter={"A"} letterColor={"Red"} orientation={420} field={"IDK wut this is"} />
				<SubmittedRow shape={"Square"} shapeColor={"Blue"} letter={"A"} letterColor={"Red"} orientation={420} field={"IDK wut this is"} />
				<SubmittedRow shape={"Square"} shapeColor={"Blue"} letter={"A"} letterColor={"Red"} orientation={420} field={"IDK wut this is"} />
				<SubmittedRow shape={"Square"} shapeColor={"Blue"} letter={"A"} letterColor={"Red"} orientation={420} field={"IDK wut this is"} />
				<SubmittedRow shape={"Square"} shapeColor={"Blue"} letter={"A"} letterColor={"Red"} orientation={420} field={"IDK wut this is"} /> */}
			</Column>
		</div>
	)
}

export default Submitted
