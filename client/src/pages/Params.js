import React, { useState } from "react"
import Table from "react-bootstrap/Table"
import ParamToolbar from "../components/ParamToolbar.js"

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

const parameters = require("../parameters.json")

const paramDescriptions = {}
const paramLinks = {}
const initialParams = []

for (const param in parameters) {
	paramDescriptions[param] = parameters[param].description
	paramLinks[param] = parameters[param].link
}

for (const param in parameters) initialParams.push([param, "0"])

const Params = () => {
	const [params, setParams] = useState(initialParams)
	const [display, setDisplay] = useState(initialParams)

	return (
		<div>
			<div style={{ float: "left", paddingLeft: 20, width: "65%" }}>
				<Table striped bordered hover>
					<thead>
						<tr>
							<th>Param Name</th>
							<th>Current Value</th>
							<th>Description</th>
						</tr>
					</thead>
					<tbody>
						{params.map((param, i) => (
							<tr key={i}>
								<td>
									<a href={paramLinks[param[0]]} target="_blank" rel="noopener">
										{param[0]}
									</a>
								</td>
								<td>{param[1]}</td>
								<td>{paramDescriptions[param[0]]}</td>
							</tr>
						))}
					</tbody>
				</Table>
			</div>
			<ParamToolbar
				paramDescriptions={paramDescriptions}
				setDisplay={setDisplay}
				params={params}
				setParams={data => {
					setParams(data)
					setDisplay(data)
				}}
			></ParamToolbar>
		</div>
	)
}

export default Params
