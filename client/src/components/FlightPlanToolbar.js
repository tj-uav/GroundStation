import React, { useEffect } from 'react'
import Button from 'react-bootstrap/Button'
import Dropdown from 'react-bootstrap/Dropdown'
import DropdownButton from 'react-bootstrap/DropdownButton'
import ReactScrollableList from 'react-scrollable-list'
import { load, save, read, write } from '../backend.js'
import '../css/scroll.css'

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

    const handleCommandClick = (event) => {
        let command = event.target.id;
        console.log(command);
        alert("You tried to add an " + command);
    }

    const modeChange = (event) => {
        props.setMode(event.target.value)
    }

    const getItemsList = (mode) => {
        let ret = [];
        switch(mode){
            case 'waypoints':
            case 'fence':
                let arr = props.getters[mode];
                for(let idx in arr){
                    let sigfig = [arr[idx][0].toFixed(3), arr[idx][1].toFixed(3)];
                    let displayIdx = parseInt(idx)+1;
                    ret.push({id: idx, content: props.display[mode] + " " + displayIdx + ": " + sigfig[0] + ", " + sigfig[1]});
                }
                break;
            case 'polygons':
                let polygons = props.getters[mode];
                for(let idx in polygons){
                    let polygon = polygons[idx];
                    console.log(polygon);
                    for(let subidx in polygon){
                        console.log(polygon[subidx]);
                        let sigfig = [polygon[subidx][0].toFixed(3), polygon[subidx][1].toFixed(3)];
                        ret.push({id: idx, content: "Polygon " + (parseInt(idx)+1) + ", marker " + (parseInt(subidx)+1) + ": " + sigfig[0] + ", " + sigfig[1]});
                    }
                }
                break;
            }
        console.log(ret);
        return ret;
    }

    const newPolygon = () => {
        let temp = props.getters.polygons;
        temp.push([]);
        props.setters.polygons(temp);
    }

    useEffect(() => {
        let radio = document.getElementById(props.mode);
        radio.checked = true;
    }, [])


    return (
        <div style={{"marginLeft": 10}}>
            <div id="mode-div" onChange={modeChange}>
                <div><input type="radio" id="waypoints" value="waypoints" name="mode"/>Waypoint Mode</div>
                <div><input type="radio" id="polygons" value="polygons" name="mode"/>Polygon Mode</div>
                <div><input type="radio" id="fence" value="fence" name="mode"/>Geofence Mode</div>
            </div>
            <DropdownButton id="waypoint-dropdown" title="Waypoint" style={{"marginTop": 20}}>
                <Dropdown.Item id="load-waypoints" onClick={handleClick}>Load waypoints from file</Dropdown.Item>
                <Dropdown.Item id="save-waypoints" onClick={handleClick}>Save waypoints to file</Dropdown.Item>
                <Dropdown.Item id="read-waypoints" onClick={handleClick}>Read waypoints to Pixhawk</Dropdown.Item>
                <Dropdown.Item id="write-waypoints" onClick={handleClick}>Write waypoints to Pixhawk</Dropdown.Item>
            </DropdownButton>
            <DropdownButton id="polygon-dropdown" title="Polygon" style={{"marginTop": 20}}>
                <Dropdown.Item id="load-polygons" onClick={handleClick}>Load polygons from file</Dropdown.Item>
                <Dropdown.Item id="save-polygons" onClick={handleClick}>Save polygons to file</Dropdown.Item>
            </DropdownButton>
            <DropdownButton id="fence-dropdown" title="Geofence" style={{"marginTop": 20}}>
                <Dropdown.Item id="load-fence" onClick={handleClick}>Load geofence from file</Dropdown.Item>
                <Dropdown.Item id="save-fence" onClick={handleClick}>Save geofence to file</Dropdown.Item>
                <Dropdown.Item id="read-fence" onClick={handleClick}>Read geofence to Pixhawk</Dropdown.Item>
                <Dropdown.Item id="write-fence" onClick={handleClick}>Write geofence to Pixhawk</Dropdown.Item>
            </DropdownButton>
            <DropdownButton id="command-dropdown" title="Commands" style={{"marginTop": 20, display: props.mode === "waypoints" ? "block" : "none"}}>
                <Dropdown.Item id="actuate-servo" onClick={handleCommandClick}>Actuate servo</Dropdown.Item>
            </DropdownButton>
            <Button id="new-polygon" style={{"marginTop": 20, display: props.mode === "polygons" ? "block" : "none"}} onClick={newPolygon}>New Polygon</Button>
            <ReactScrollableList
                listItems={getItemsList(props.mode)}
                heightOfItem={30}
                maxItemsToRender={10}
                style={{color: '#333', "marginTop": 20}}
            />
        </div>
    )

}

export default FlightPlanToolbar;