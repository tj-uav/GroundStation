import React, { useEffect } from "react"
import Button from "react-bootstrap/Button"
import Dropdown from "react-bootstrap/Dropdown"
import DropdownButton from "react-bootstrap/DropdownButton"
import { RadioList } from "components/UIElements"

import { load, save } from "filehandler"

import ToolbarList from "./ToolbarList"

const FlightPlanToolbar = props => {
	const read = () => {}

	const write = () => {}

	const handleClick = event => {
		let btnId = event.target.id
		let [action, datatype] = btnId.split("-")
		if (!(datatype in props.getters)) return
		let get = props.getters[datatype]
		let set = props.setters[datatype]
		switch (action) {
			case "load":
				set(load(datatype))
				break
			case "save":
				save(datatype, get)
				break
			case "read":
				set(read(datatype))
				break
			case "write":
				write(datatype, get)
				break
			default:
				console.log("ERROR")
		}
	}

	const handleCommandClick = event => {
		let command = event.target.id
		console.log(command)
		alert("You tried to add an " + command)
	}

	const newPolygon = () => {
		let temp = props.getters.polygons
		temp.push([])
		props.setters.polygons(temp)
	}

	useEffect(() => {
		let radio = document.getElementById(props.mode)
		radio.checked = true
	}, [])

	return (
		<div style={{ marginLeft: 10 }}>
			<RadioList onChange={event => props.setMode(event.target.value)} name="pointMode">
				<RadioList.Option value="waypoints">Waypoint Mode</RadioList.Option>
				<RadioList.Option value="fence">Geofence Mode</RadioList.Option>
				<RadioList.Option value="ugvDrop">UGV Drop Mode</RadioList.Option>
				<RadioList.Option value="ugvDrive">UGV Drive Mode</RadioList.Option>
				<RadioList.Option value="ugvFence">UGV Fence Mode</RadioList.Option>
				<RadioList.Option value="offAxis">Off Axis Mode</RadioList.Option>
				<RadioList.Option value="searchGrid">Search Grid Mode</RadioList.Option>
			</RadioList>
			<DropdownButton id="waypoint-dropdown" title="Waypoint" style={{ marginTop: 20 }}>
				<Dropdown.Item id="load-waypoints" onClick={handleClick}>
					Load waypoints from file
				</Dropdown.Item>
				<Dropdown.Item id="save-waypoints" onClick={handleClick}>
					Save waypoints to file
				</Dropdown.Item>
				<Dropdown.Item id="read-waypoints" onClick={handleClick}>
					Read waypoints to Pixhawk
				</Dropdown.Item>
				<Dropdown.Item id="write-waypoints" onClick={handleClick}>
					Write waypoints to Pixhawk
				</Dropdown.Item>
			</DropdownButton>
			<DropdownButton id="fence-dropdown" title="Geofence" style={{ marginTop: 20 }}>
				<Dropdown.Item id="load-fence" onClick={handleClick}>
					Load geofence from file
				</Dropdown.Item>
				<Dropdown.Item id="save-fence" onClick={handleClick}>
					Save geofence to file
				</Dropdown.Item>
				<Dropdown.Item id="read-fence" onClick={handleClick}>
					Read geofence to Pixhawk
				</Dropdown.Item>
				<Dropdown.Item id="write-fence" onClick={handleClick}>
					Write geofence to Pixhawk
				</Dropdown.Item>
			</DropdownButton>
			<DropdownButton
				id="command-dropdown"
				title="Commands"
				style={{ marginTop: 20, display: props.mode === "waypoints" ? "block" : "none" }}
			>
				<Dropdown.Item id="actuate-servo" onClick={handleCommandClick}>
					Actuate servo
				</Dropdown.Item>
			</DropdownButton>
			<div style={{ marginTop: 20 }}>
				<ToolbarList
					mode={props.mode}
					data={props.getters[props.mode]}
					setData={props.setters[props.mode]}
					display={props.display}
				></ToolbarList>
			</div>
		</div>
	)
}

export default FlightPlanToolbar
