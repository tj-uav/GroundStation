import React, { useState, useEffect } from "react"
import { Button, Box, Label } from "components/UIElements"
import { Row, Column } from "components/Containers"
import { httpget } from "../../../backend"
import { useInterval } from "../../../util";

// TODO: Update for servo output editing

// https://ardupilot.org/plane/docs/common-rcoutput-mapping.html
const servoFunctionMap = {
	0: "Disabled",
	1: "RCPassThru",

	51: "RCPassThru1",
	52: "RCPassThru2",
	53: "RCPassThru3",
	54: "RCPassThru4",
	55: "RCPassThru5",
	56: "RCPassThru6",
	57: "RCPassThru7",
	58: "RCPassThru8",
	59: "RCPassThru9",
	60: "RCPassThru10",
	61: "RCPassThru11",
	62: "RCPassThru12",
	63: "RCPassThru13",
	64: "RCPassThru14",
	65: "RCPassThru15",
	66: "RCPassThru16",

	140: "RCIN1Scaled",
	141: "RCIN2Scaled",
	142: "RCIN3Scaled",
	143: "RCIN4Scaled",
	144: "RCIN5Scaled",
	145: "RCIN6Scaled",
	146: "RCIN7Scaled",
	147: "RCIN8Scaled",
	148: "RCIN9Scaled",
	149: "RCIN10Scaled",
	150: "RCIN11Scaled",
	151: "RCIN12Scaled",
	152: "RCIN13Scaled",
	153: "RCIN14Scaled",
	154: "RCIN15Scaled",
	155: "RCIN16Scaled",

	4: "Aileron",
	19: "Elevator",
	70: "Throttle",
	73: "Throttle Left",
	74: "Throttle Right",
	21: "Rudder",
	2: "Flap",
	3: "Automatic Flaps",
	24: "Flaperon Left",
	25: "Flaperon Right",
	77: "Elevon Left",
	78: "Elevon Right",
	79: "V-Tail Left",
	80: "V-Tail Right",
	16: "Differential Spoiler Left1",
	17: "Differential Spoiler Right1",
	86: "Differential Spoiler Left2",
	87: "Differential Spoiler Right2",
	26: "Ground Steering",
	81: "Boost Engine Throttle",
	30: "Motor Enable Switch",
	29: "Landing Gear",
	110: "AirBrakes"
}

const ServoRow = ({ number, func, value, min, max, trim, reversed }) => {
	return (
		<Row columns="minmax(0, 2fr) minmax(0, 8fr) minmax(0, 4fr) minmax(0, 9fr) minmax(0, 3fr)" height="3rem">
			<Box content={number} line="300%" />
			<Box content={servoFunctionMap[func]} line="300%" />
			<Box content={value} line="300%" />
			<Box content={min + " / " + trim + " / " + max} line="300%" />
			<Box content={reversed ? "✅" : "❌"} line="300%" />
		</Row>
	)
}

const Servo = () => {
	const [servos, setServos] = useState([])
	const [servoVals, setServoVals] = useState([])
	const [servosReady, setServosReady] = useState(false)

	useInterval(200, () => {
		if (!servosReady) {
			httpget("/uav/params/getall", response => {
				if (response.error) {
					setServosReady(false)
					return
				}
				setServosReady(true)

				let data = response.data.result

				setServos([])

				for (let i = 1; i < 10; i++) {
					let func = data["SERVO" + i + "_FUNCTION"]
					let min = data["SERVO" + i + "_MIN"]
					let max = data["SERVO" + i + "_MAX"]
					let trim = data["SERVO" + i + "_TRIM"]
					let reversed = data["SERVO" + i + "_REVERSED"]

					if (func) {
						setServos(servos => [...servos, {
							number: i,
							func: func,
							min: min,
							max: max,
							trim: trim,
							reversed: reversed
						}])
					}
				}
			})
		}
		httpget("/uav/servos", response => {
			setServoVals(response.data.result)
		})
	})

	if (servosReady) {
		return (
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					height: "calc(100vh - 9.5rem)",
				}}
			>
				<Row columns="minmax(0, 2fr) minmax(0, 8fr) minmax(0, 4fr) minmax(0, 9fr) minmax(0, 3fr)" height="2rem">
					<Label>Servo</Label>
					<Label>Function</Label>
					<Label>Value</Label>
					<Label>Min / Trim / Max</Label>
					<Label>Reverse</Label>
				</Row>
				<Column style={{ marginBottom: "1rem" }}>
					{servos.map((obj, index) => {
						return <ServoRow key={index} number={obj.number} func={obj.func} value={servoVals[index]} min={obj.min} max={obj.max} trim={obj.trim} reversed={obj.reversed} />
					})}
				</Column>
			</div>
		)
	} else {
		return (
			<Label>Loading parameters...</Label>
		)
	}
}

export default Servo
