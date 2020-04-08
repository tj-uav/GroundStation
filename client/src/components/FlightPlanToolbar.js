import React, { useEffect } from 'react'
import Dropdown from 'react-bootstrap/Dropdown'
import DropdownButton from 'react-bootstrap/DropdownButton'
import { load, save, read, write } from '../backend.js'


const FlightPlanToolbar = (props) => {

    const handleClick = (event) => {
        let btnId = event.target.id;
        let [action, datatype] = btnId.split("-");
        if(!props.getters.includes(datatype)){
            console.log("Unknown datatype nani");
            return;
        }
        let get = props.getters[datatype];
        let set = props.setters[datatype];
        switch(action){
            case 'load':
                set(load(datatype));
                break;
            case 'save':
                save(datatype, get);
                break;
            case 'read':
                set(read(datatype));
                break;
            case 'write':
                write(datatype, get);
                break;
            default:
                console.log("ERROR");
        }
    }

    const modeChange = (event) => {
        props.setMode(event.target.value)
    }

    useEffect(() => {
        let radio = document.getElementById(props.mode);
        radio.checked = true;
    }, [])


    return (
        <div style={{"marginLeft": 10}}>
            <div id="mode-div" onChange={modeChange} style={{"paddingBottom": 20}}>
                <div><input type="radio" id="waypoints" value="waypoints" name="mode"/> Waypoint Mode</div>
                <div><input type="radio" id="polygons" value="polygons" name="mode"/> Polygon Mode</div>
                <div><input type="radio" id="fence" value="fence" name="mode"/> Geofence Mode</div>
            </div>
            <DropdownButton id="waypoint-dropdown" title="Waypoint" style={{"marginBottom": 20}}>
                <Dropdown.Item id="load-waypoints" onClick={handleClick}>Load waypoints from file</Dropdown.Item>
                <Dropdown.Item id="save-waypoints" onClick={handleClick}>Save waypoints to file</Dropdown.Item>
                <Dropdown.Item id="read-waypoints" onClick={handleClick}>Read waypoints to Pixhawk</Dropdown.Item>
                <Dropdown.Item id="write-waypoints" onClick={handleClick}>Write waypoints to Pixhawk</Dropdown.Item>
            </DropdownButton>
            <DropdownButton id="polygon-dropdown" title="Polygon" style={{"marginBottom": 20}}>
                <Dropdown.Item id="load-polygons" onClick={handleClick}>Load polygons from file</Dropdown.Item>
                <Dropdown.Item id="save-polygons" onClick={handleClick}>Save polygons to file</Dropdown.Item>
            </DropdownButton>
            <DropdownButton id="fence-dropdown" title="Geofence" style={{"marginBottom": 20}}>
                <Dropdown.Item id="load-fence" onClick={handleClick}>Load fence from file</Dropdown.Item>
                <Dropdown.Item id="save-fence" onClick={handleClick}>Save fence to file</Dropdown.Item>
                <Dropdown.Item id="read-fence" onClick={handleClick}>Read fence to Pixhawk</Dropdown.Item>
                <Dropdown.Item id="write-fence" onClick={handleClick}>Write fence to Pixhawk</Dropdown.Item>
            </DropdownButton>
        </div>
    )

}

export default FlightPlanToolbar;