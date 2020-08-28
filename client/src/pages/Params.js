import React, { useState, useEffect } from "react"
import { Row, Column } from "../components/Containers"
import { Button, Box, Label } from "../components/UIElements"
import Param from "components/params/param"
import { dark } from "../theme/Colors"
import Table from "react-bootstrap/Table"
import ParamToolbar from "../components/params/ParamToolbar.js"

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

const parameters = Object.entries(require("../parameters.json"))
	.map(entry => ({
		name: entry[0],
		description: entry[1].description,
		link: entry[1].link,
		value: "0",
	}))
	.filter((_, i) => i < 20)

const Params = () => {
	const [params, setParams] = useState([])
	const [display, setDisplay] = useState(parameters)

	const [filter, setFilter] = useState(/.*/g)

	useEffect(() => {
		const getParams = async (regex = filter) => {
			const json = require("parameters.json")
			const arr = new Promise((resolve, reject) => {
				setTimeout(() => {
					resolve(
						Object.entries(json)
							.map(entry => ({
								name: entry[0],
								description: entry[1].description,
								link: entry[1].link,
								value: "0",
							}))
							.filter(str => regex.test(str))
					)
				}, 0)
			})
			// .filter((_, i) => i < 20)
			setParams(await arr)
		}
		getParams()
	}, [filter])

	return (
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
					<Button>Read</Button>
					<Button>Write</Button>
					<Button>Load</Button>
					<Button>Save</Button>
				</Row>
				{/* <ParamToolbar
					paramDescriptions={params.map(obj => obj.description)}
					setDisplay={setDisplay}
					params={params}
					setParams={data => {
						setParams(data)
						setDisplay(data)
					}}
				></ParamToolbar> */}
			</div>
			<Column height="100%" style={{ overflow: "auto", gridTemplateRows: "unset" }}>
				<Row height="3rem" columns="auto 10rem">
					<Box
						placeholder="Enter search term(s) or regular expression"
						style={{ textAlign: "unset" }}
						editable
					></Box>
					<Button>Search</Button>
				</Row>
				<Row style={{ marginBottom: "-1rem" }} columns="14rem 6rem 1fr 6rem" height="2rem">
					<Label>Param Name</Label>
					<Label>Value</Label>
					<Label>Description</Label>
				</Row>
				<div style={{ overflow: "auto" }}>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							height: "100%",
							gap: "1rem",
						}}
					>
						{params.map((param, i) => (
							<Param key={i} data={param} />
						))}
					</div>
				</div>
			</Column>
		</div>
	)
}

export default Params
