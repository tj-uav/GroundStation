import React from 'react'
import Dropdown from 'react-bootstrap/Dropdown'
import DropdownButton from 'react-bootstrap/DropdownButton'
import { load } from '../backend.js'

const FlightPlanToolbar = (props) => {

    const handleClick = (event) => {
        let action = event.target.id;
        switch(action){
            case 'load-waypoints':
                let waypoints = load('waypoints');
                props.setWaypoints(waypoints);
                break;
        }
    }    


    return (
        <div style={{"marginLeft": 10}}>
            <DropdownButton id="waypoint-dropdown" title="Waypoint">
                <Dropdown.Item id="load-waypoints" onClick={handleClick}>Load waypoints from file</Dropdown.Item>
                <Dropdown.Item id="save-waypoints" onClick={handleClick}>Save waypoints to file</Dropdown.Item>
                <Dropdown.Item id="read-waypoints" onClick={handleClick}>Read waypoints</Dropdown.Item>
                <Dropdown.Item id="write-waypoints" onClick={handleClick}>Write waypoints</Dropdown.Item>
            </DropdownButton>
        </div>
    )

}

export default FlightPlanToolbar;