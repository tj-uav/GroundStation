import React, { useState, useEffect, useMemo } from "react"
import { Row, Column } from "../components/Containers"
import { Button, Box, Label } from "../components/UIElements"
import Param from "components/params/param"
import { dark, red } from "../theme/Colors"
import Table from "react-bootstrap/Table"
import ParamToolbar from "../components/params/ParamToolbar.js"

import regexParse from "regex-parser"
// import * as RegexParser from "regex-parser"

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

	const [filter, setFilter] = useState(/.*/gi)
	const [tempFilter, setTempFilter] = useState(filter)

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
							.filter(
								entry => regex.test(entry.name) || regex.test(entry.description)
							)
					)
				}, 0)
			})
			setParams(await arr)
		}
		getParams()
	}, [filter])

	const precomputedParams = useMemo(
		() => params.map((param, i) => <Param key={i} data={param} />),
		[params]
	)

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
			<Column
				height="100%"
				style={{ overflow: "auto", display: "flex", flexDirection: "column" }}
			>
				<Row height="3rem" columns="auto 10rem">
					<Box
						onChange={e => {
							const value = e.target.value
							const element = e.target
							let regex
							element.style.color = "unset"
							try {
								regex = regexParse(value)
							} catch (e) {
								regex = /.*/gi
								if (value !== "") element.style.color = red
							}
							setTempFilter(regex)
						}}
						placeholder="Enter search term(s) or regular expression"
						style={{ textAlign: "unset" }}
						editable
					></Box>
					<Button onClick={() => setFilter(tempFilter)}>Search</Button>
				</Row>
				<Row
					style={{ marginBottom: "-1rem" }}
					columns="min-content auto 6rem"
					height="2rem"
				>
					<Row columns="14rem 6rem">
						<Label>Param Name</Label>
						<Label>Value</Label>
					</Row>
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
						{precomputedParams}
					</div>
				</div>
			</Column>
		</div>
	)
}

export default Params
