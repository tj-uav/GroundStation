import React, { useState, useEffect, useMemo, useRef } from "react"
import styled from "styled-components"

import { Row, Column } from "components/Containers"
import { Button, Box, Label } from "components/UIElements"
import { darkest, darkdark } from "theme/Colors"
import { httpget, httppost } from "../../backend"

import { VariableSizeList } from "react-window"
import AutoSizer from "react-virtualized-auto-sizer"

import Param from "./Param"
/*
Current params functionality:
You can load a param file, and it will load all known params (known params are those in the paramDescriptions dictionary).
You can also save the current params to a file.
The params file format is the same as that of MP.

TODO: Make params table editable (look at list of useful react components in #ground-station)
TODO: Allow reader to choose location when saving params file
TODO: Put in all the param descriptions
TODO: Read params from mavlink
TODO: Write params to mavlink
*/

let INITIAL_PARAMS = []
let enables = {}
let json = require("parameters.json")
Object.entries(json).forEach((entry) => {
	if (entry[0] == "")
		return

	for (let param in entry[1]) {
		if (param.includes("_ENABLE")) {
			enables[entry[0]] = param
		}
		let a = { ...entry[1][param], name: param, value: 0, present: false }
		INITIAL_PARAMS.push(a)
	}
})

let paramToIndex = {}
INITIAL_PARAMS.forEach((val, i) => {
	paramToIndex[val.name] = i
})

const ParametersContext = React.createContext(undefined)
export function useParameters() {
	const context = React.useContext(ParametersContext)
	if (context === undefined)
		throw new Error("Parameters context can only be called inside a child on `Params`.")
	return context
}

const Params = () => {
	const [activeParamIndex, setActiveIndex] = useState(-1)
	const [modifiedIndexes, setModifiedIndexes] = useState([])
	const [parameters, setParameters] = useState(INITIAL_PARAMS)
	const [parametersSave, setParametersSave] = useState(INITIAL_PARAMS.slice())

	const isEnabled = (param) => {
		if (param.includes("_ENABLE")) {
			return true
		}
		for (let e in enables) {
			if (param.indexOf(e) == 0) {
				return parameters[paramToIndex[enables[e]]].value == 1.0
			}
		}
		return true
	}

	const [filter, setFilter] = useState("")
	const parametersDisplay = useMemo(() => {
		setFilter(filter.toLowerCase())

		let dispMap = []
		for (let index in parameters) {
			let param = parameters[index]
			if ((filter === "" && param.name.includes("_ENABLE")) || (isEnabled(param.name) && (param.name.toLowerCase().includes(filter) || param.Description.toLowerCase().includes(filter) || param.DisplayName?.toLowerCase()?.includes(filter)))) {
				dispMap.push(index)
			}
 		}

		return dispMap
	}, [filter, parameters])

	const inputBox = useRef(null)
	const listRef = useRef(null)

	const revertParameters = () => {
		modifiedIndexes.forEach((val, i) => {
			parameters[val] = parametersSave[val]
		})
		setParameters(parameters)
		setModifiedIndexes([])
	}

	const get = () => {
		httpget("/uav/params/getall", response => {
			let data = response.data.result
			let missingParams = []
			for (let param in data) {
				if (paramToIndex[param] != undefined) {
					parameters[paramToIndex[param]].value = data[param]
					parameters[paramToIndex[param]].present = true
				} else {
					missingParams.push({ name: param, value: data[param], Description: "N/A", present: true })
				}
			}
			let len = parameters.length
			missingParams.forEach((val, i) => {
				parameters.push(val)
				paramToIndex[val.name] = i + len
			})

			setParameters(parameters)
			setParametersSave(parameters.slice())
		})
		revertParameters()
	}

	const load = () => {
		httppost("/uav/params/load", null, response => {
			let data = response.data.result
			for (let param in data) {
				parameters[paramToIndex[param]].value = data[param]
			}
			setParameters(parameters)
			setParametersSave(parameters.slice())
		})
		revertParameters()
	}

	useEffect(() => {
		get()
	}, [])

	const [activeSize, setActiveSize] = useState(35)

	return (
		<ParametersContext.Provider value={[parameters, setParameters]}>
			<div
				style={{
					display: "grid",
					padding: "1rem 1rem 0 1rem",
					gridTemplateColumns: "37rem 100fr",
					gap: "1rem",
					width: "100%",
					height: "auto",
					overflowY: "auto",
				}}
			>
				<div>
					<Row height="3rem">
						<Button
							title="Get params from server file"
							onClick={() => {
								get()
							}}
						>
							Get file
						</Button>
						<Button
							title="Set params to server file"
							onClick={() => {
								let send = {}
								for (let index of modifiedIndexes) {
									if (parameters[index].present)
										send[parameters[index].name] = parseFloat(parameters[index].value)
								}
								httppost("/uav/params/setmultiple", { params: send })
								setParametersSave(parameters.slice())
								setModifiedIndexes([])
							}}
						>
							Set file
						</Button>
						<Button
							title="Load params from plane"
							onClick={() => {
								load()
							}}
						>
							Load plane
						</Button>
						<Button
							title="Save params to plane"
							onClick={() => {
								httppost("/uav/params/save", {})
							}}
						>
							Save plane
						</Button>
					</Row>
					{modifiedIndexes.length > 0 && (
						<Row
							style={{ marginTop: "1rem" }}
							columns="min-content auto 6rem"
							height="2rem"
						>
							<Row columns="11.5rem 5rem 5rem">
								<Label>Param Name</Label>
								<Label>New</Label>
								<Label>Old</Label>
							</Row>
							<Label>Description</Label>
						</Row>
					)}
					<section
						style={{
							display: "flex",
							flexDirection: "column",
							flexGrow: "1",
							rowGap: "1rem",
							overflow: "auto",
						}}
					>
						{modifiedIndexes.map((mIndex, index) => {
							return (
								<Param
									key={index}
									index={mIndex}
									listRef={listRef}
									data={{ ...parameters[mIndex], old: parametersSave[mIndex].value }}
									active={false}
									setActiveIndex={setActiveIndex}
									setModifiedIndexes={setModifiedIndexes}
									parametersSave={parametersSave}
									modified={true}
								/>
							)
						})}
					</section>
				</div>
				<Column
					height="100%"
					style={{ overflow: "auto", display: "flex", flexDirection: "column" }}
				>
					<Row height="3rem" columns="auto">
						<Box
							ref={inputBox}
							onKeyDown={e => {
								if (e.nativeEvent.key === "Enter") e.preventDefault()
								e.stopPropagation()
							}}
							onChange={value => {
								setFilter(value)
							}}
							placeholder="Enter search term"
							style={{ textAlign: "left" }}
							editable
						></Box>
					</Row>
					<Row
						style={{ marginBottom: "-1rem" }}
						height="2rem"
					>
						<Row columns="11.5rem 5rem">
							<Label>Param Name</Label>
							<Label>Value</Label>
						</Row>
						<Label>Description</Label>
					</Row>
					<AutoSizer onResize={() => {
						if (activeParamIndex != -1)
							listRef.current?.resetAfterIndex(activeParamIndex)
					}}>
						{({ height, width }) => (
							<Container
								height={height - 96}
								width={width}
								itemCount={parametersDisplay.length}
								ref={listRef}
								itemSize={(i) => {
									return parametersDisplay[i] == activeParamIndex ? activeSize : 35
								}}
							>
								{({ index, style }) => {
									return (
										<Param
											style={style}
											height={activeParamIndex === parametersDisplay[index] ? activeSize : 35}
											key={parametersDisplay[index]}
											index={parametersDisplay[index]}
											data={parameters[parametersDisplay[index]]}
											active={parametersDisplay[index] === activeParamIndex}
											setActiveIndex={setActiveIndex}
											setModifiedIndexes={setModifiedIndexes}
											parametersSave={parametersSave}
											setActiveSize={setActiveSize}
											listRef={listRef}
										/>
									)
								}}
							</Container>
						)}
					</AutoSizer>
				</Column>
			</div>
		</ParametersContext.Provider>
	)
}

const Container = styled(VariableSizeList)`
	overflow-y: auto;
	margin-bottom: 2rem;

	&::-webkit-scrollbar {
		width: 20px;
	}
	&::-webkit-scrollbar-thumb {
		background: ${darkest};
		border: 6px solid rgba(0, 0, 0, 0);
		border-radius: 1000px;
		background-clip: padding-box;
		width: 8px;
	}
	&::-webkit-scrollbar-thumb:hover {
		background: ${darkdark};
		background-clip: padding-box;
		trasition: 0.5s;
	}
	&::-webkit-scrollbar-track {
		border: 1px red;
	}
`

export default Params
