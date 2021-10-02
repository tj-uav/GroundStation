import React from "react"
import ButtonGroup from "react-bootstrap/ButtonGroup"
import Button from "react-bootstrap/Button"
import Form from "react-bootstrap/Form"
import FormControl from "react-bootstrap/FormControl"
import FormGroup from "react-bootstrap/FormGroup"
import FormLabel from "react-bootstrap/FormLabel"

import { save } from "filehandler"

/*
Param file format:
param_name,param_value
*/

const ParamToolbar = props => {
	const search = event => {
		let form = event.currentTarget
		let input = form.childNodes[0].value
		console.log(input) // Search based on this value
		let temp = []
		for (let i in props.params) {
			let param = props.params[i]
			if (param[0].toLowerCase().includes(input.toLowerCase())) {
				temp.push(param)
			}
		}
		props.setParams(temp)
	}

	const saveParams = event => {
		console.log(props.params)
		console.log(event.target.files[0])
		let data = ""
		for (let idx in props.params) {
			let propData = props.params[idx]
			data += propData[0] + "," + propData[1] + "\n"
		}
		let filename = "params.txt"
		save(filename, data.trim())
	}

	const loadParams = event => {
		let file = event.target.files[0]
		let reader = new FileReader()
		reader.readAsText(file)
		reader.onloadend = function () {
			let newProps = []
			let lines = reader.result.trim().split("\n")
			for (let idx in lines) {
				if (lines[idx][0] === "#") {
					continue
				}
				let propData = lines[idx].split(",")
				if (!props.paramDescriptions[propData[0]]) {
					continue
				}
				newProps.push([propData[0], propData[1]])
			}
			console.log(newProps)
			props.setParams(newProps)
		}
	}

	return (
		<ButtonGroup vertical>
			<Button variant="primary">Read params</Button>
			<Button variant="primary">Write params</Button>

			<FormGroup style={{ marginBottom: "0px", paddingBottom: "0px", width: "100%" }}>
				<FormLabel
					htmlFor="loadUpload"
					style={{ marginBottom: "0px", paddingBottom: "10px", width: "100%" }}
					className="btn btn-primary"
				>
					Load params
					<FormControl
						id="loadUpload"
						type="file"
						accept=".txt"
						onChange={loadParams}
						style={{ display: "none", padding: "0px", margin: "0px" }}
					/>
				</FormLabel>
				<FormLabel
					htmlFor="saveUpload"
					style={{ marginBottom: "0px", paddingBottom: "10px", width: "100%" }}
					className="btn btn-primary"
				>
					Save params
					<FormControl
						id="saveUpload"
						type="file"
						accept=".txt"
						onChange={saveParams}
						style={{ display: "none", padding: "0px", margin: "0px" }}
					/>
				</FormLabel>
			</FormGroup>

			<Form style={{ marginTop: 20 }} inline={true} onSubmit={search}>
				<Form.Control type="text" placeholder="Search params"></Form.Control>
				<Button variant="primary" type="submit">
					Search params
				</Button>
			</Form>
		</ButtonGroup>
	)
}

export default ParamToolbar
