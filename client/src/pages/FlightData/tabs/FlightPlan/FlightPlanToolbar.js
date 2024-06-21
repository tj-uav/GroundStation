import React, { useEffect, useState, useRef } from "react"
import { Box, Button, Dropdown } from "components/UIElements"
import { dark, red } from "theme/Colors"
import { httppost } from "backend"

import { Row, Column, Modal, ModalHeader, ModalBody } from "components/Containers"
import Commands from "commands"
import { point } from "leaflet"

const FlightPlanToolbar = props => {
    const [open, setOpen] = useState(false)
    const [missing, setMissing] = useState([])

    const [modeText, setModeText] = useState("")
    const [editableIndex, setEditableIndex] = useState("")
    const [lat, setLat] = useState("")
    const [lon, setLon] = useState("")
    const [alt, setAlt] = useState("")
    const [rad, setRad] = useState("")
    const [turns, setTurns] = useState("")
    const [time, setTime] = useState("")
    const [modLat, setModLat] = useState("")
    const [modLon, setModLon] = useState("")
    const [modAlt, setModAlt] = useState("")

    const input1Ref = useRef(null);
    const input2Ref = useRef(null);
    const input3Ref = useRef(null);
    const input4Ref = useRef(null);
    const input5Ref = useRef(null);
    const input6Ref = useRef(null);
    const edit1Ref = useRef(null);
    const edit2Ref = useRef(null);
    const edit3Ref = useRef(null);

    const placementModes = {
        "disabled": "Disabled",
        "push": "Push",
        "insert": "Insert",
        "distance": "Distance Calc",
    }

    const placementTypes = {
        "waypoint": "Waypoint",
        "jump": "Jump",
        "unlimLoiter": "Unlimited Loiter",
        "turnLoiter": "Turn Loiter",
        "timeLoiter": "Time Loiter",
    }

    const numToCommands = {
        16 : "waypoint",
        17 : "unlimLoiter",
        18 : "turnLoiter",
        19 : "timeLoiter",
        177 : "jump"
    }

    const savePath = (path) => {
        for (const [i, marker] of path.entries()) {
            if (marker.opacity) {
                path = [...path.slice(0, i), { ...marker, opacity: 1 }, ...path.slice(i + 1)]
            }
        }
        props.setters.path(path)

        props.setters.pathSave(path)
        props.setters.pathSaved(true)

        httppost("/uav/commands/generate", {
            "waypoints": path.map(waypoint => ({
                    ...waypoint,
                    lat: waypoint.lat ?? 0.0,  // if jump
                    lon: waypoint.lng ?? 0.0,  // if jump
                    alt: (waypoint.alt ?? 0.0) / 3.281,  // altitude to m
                    p3: (waypoint.p3 ?? 0.0) / 3.281,  // loiter radius to m
                })
            )
        })
    }

    useEffect(() => {
        if (props.getters.placementMode === "distance") {
            if (props.getters.currentDistance !== -1) {
                setModeText("Distance: " + props.getters.currentDistance.toFixed(2) + " ft")
            } else if (props.getters.firstPoint === -1) {
                setModeText("Select a start waypoint")
            } else {
                setModeText("Select an end waypoint")
            }
        } else if (["push", "insert"].includes(props.getters.placementMode)) {
            if (props.getters.placementType === "jump") {
                if (props.getters.firstJump === -1) {
                    setModeText("Select a start waypoint")
                } else {
                    setModeText("Select an end waypoint")
                }
            } else {
                setModeText("Click anywhere to " + props.getters.placementMode)
            }
        } else {
            setModeText("")
        }
    }, [props.getters.placementMode, props.getters.placementType, props.getters.firstJump, props.getters.firstPoint, props.getters.currentDistance])

    const addWaypoint = (lat, lon, alt) => {
        // Create a new waypoint        
        let point;
        props.setters.pathSaved(false);

        if (props.getters.placementType== "waypoint"){
            point = {
                    alt : alt != "" ? parseFloat(alt) : props.getters.defaultAlt, 
                    cmd : Commands.waypoint, 
                    lat : parseFloat(lat), lng : parseFloat(lon), 
                    num : props.getters.path.length + 1, 
                    p1 : 0, 
                    p2 : 0, 
                    p3 : 0, 
                    p4 : 0, 
                    opacity : 0.5
                };
        }
        else if (props.getters.placementType=="jump"){
            return
        }
        else if (props.getters.placementType=="unlimLoiter"){
            point = {
                alt : alt != "" ? parseFloat(alt) : props.getters.defaultAlt, 
                cmd : Commands.unlimLoiter, 
                lat : parseFloat(lat), 
                lng : parseFloat(lon), 
                num : props.getters.path.length + 1, 
                p1 : 0, 
                p2 : 0, 
                p3 : rad, 
                p4 : 0, 
                opacity : 0.5
            };
        }
        else if (props.getters.placementType=="turnLoiter"){
            point = {
                alt : alt != "" ? parseFloat(alt) : props.getters.defaultAlt, 
                cmd : Commands.turnLoiter, 
                lat : parseFloat(lat), 
                lng : parseFloat(lon), 
                num : props.getters.path.length + 1, 
                p1 : turns, 
                p2 : 0, 
                p3 : rad, 
                p4 : 0, 
                opacity : 0.5
            };
        }
        else if (props.getters.placementType=="timeLoiter"){
            point = {
                alt : alt != "" ? parseFloat(alt) : props.getters.defaultAlt, 
                cmd : Commands.timeLoiter, 
                lat : parseFloat(lat), 
                lng : parseFloat(lon),
                num : props.getters.path.length + 1, 
                p1 : time, 
                p2 : 0, 
                p3 : rad, 
                p4 : 0, 
                opacity : 0.5
            };
        }
        setLat("")
        setLon("")
        setAlt("")
        setRad("")
        setTurns("")
        setTime("")
        moveToFirstInput()

        props.setters.path([...props.getters.path, point])
    };
    
    const greyOutPlacePoint = () =>{
        if(props.getters.placementType!="jump"){
            return true
        }
        return false
    }

    const enterPlacePoint = (e) => {
        if ((e.key === "Enter") && (lat && lon)){
            e.preventDefault()
            addWaypoint(lat,lon,alt);
        }
    }

    const moveToFirstInput = () => {
        input1Ref.current.focus();
    };

    const modPoint = (point, i) => {
        if (!(modLat === "" && modLon === "" && modAlt === "")){
            let moddedLat, moddedLng, moddedAlt
            moddedLat = parseFloat(modLat === "" ? point.lat : modLat)
            moddedLng = parseFloat(modLon === "" ? point.lng : modLon)
            moddedAlt = parseFloat(modAlt === "" ? point.alt : modAlt)
            props.setters.path([...props.getters.path.slice(0, i), {...point, lat: moddedLat, lng: moddedLng, alt: moddedAlt, opacity: 0.5}, ...props.getters.path.slice(i + 1)])
            props.setters.pathSaved(false)
            setModLat("")
            setModLon("")
            setModAlt("")
        }
        setEditableIndex("")
    };

    const deletePoint = (index) => {
        props.getters.path.splice(index, 1)
        props.setters.pathSaved(false)
    }

    const highlightMarker = (point) => {
        if (!("highlight" in point) | !point["highlight"]){
            point["highlight"] = true
        }
        else{
            point["highlight"] = false
        }
        //delay
    }

    
    return (
        <div style={{ marginLeft: 10 }}>
            <Modal open={open} setOpen={setOpen}>
                <ModalHeader>Missing Altitudes</ModalHeader>
                <ModalBody>Some path points don't have a set altitude. Set all the altitudes to save the points to the backend. You're missing altitude{missing.length > 1 ? "s" : ""} on point{missing.length > 1 ? "s" : ""}: <br /> <br /> {missing.map(i => i + 1).join(", ")} <br />
                <br /><Button style={{ "width": "15em" }} onClick={() => {
                    let path = props.getters.path.slice()
                    for (let i of missing) {
                        path[i].alt = props.getters.defaultAlt
                    }

                    setOpen(false)
                    savePath(path)
                }}>Set as default ({props.getters.defaultAlt} ft)</Button></ModalBody>
            </Modal>

            <Column style={{ marginBottom: "1rem", gap: "1.5rem" }}>
                <Row columns="minmax(0, 3fr) minmax(0, 5fr) minmax(0, 4fr)">
                    <div style={{ "display": "flex", "alignItems": "center" }}>
                        <span>Mode: </span>
                    </div>
                    <Dropdown initial={placementModes[props.getters.placementMode]} onChange={(v) => {
                        props.setters.placementMode(v)
                        if (v !== "distance") {
                            props.setters.currentDistance(-1)
                        }
                    }}>
                        {Object.entries(placementModes).map(([id, name]) => (
                            <span value={id}>{name}</span>
                        ))}
                    </Dropdown>
                    <div style={{ "display": "flex", "alignItems": "center" }}>
                        <span>{modeText}</span>
                    </div>
                </Row>
                <Row columns="minmax(0, 3fr) minmax(0, 5fr) minmax(0, 4fr)">
                    <div style={{ "display": "flex", "alignItems": "center" }}>
                        <span>Type: </span>
                    </div>
                    <Dropdown initial={placementTypes[props.getters.placementType]} onChange={(v) => {
                        props.setters.placementType(v)
                    }}>
                        {Object.entries(placementTypes).map(([id, name]) => (
                            <span value={id}>{name}</span>
                        ))}
                    </Dropdown>
                    &nbsp;
                </Row>
                <Row columns="minmax(0, 3fr) minmax(0, 5fr) minmax(0, 4fr)">
                    <div style={{ "display": "flex", "alignItems": "center" }}>
                        <span>Default Altitude:</span>
                    </div>
                    <Box editable={true} content={props.getters.defaultAlt} onChange={(v) => {
                        if (!Number.isNaN(Number(v)) && v.length > 0) {
                            if (v.endsWith(".")) {
                                props.setters.defaultAlt(125)
                            } else {
                                props.setters.defaultAlt(Number(v))
                            }
                            return v
                        } else if (v.substring(0, v.length - 1).endsWith(".")) {
                            return v.substring(0, v.length - 1)
                        } else if (v.length === 0) {
                            props.setters.defaultAlt(125)
                            return v
                        } else if (v.substring(0, Math.max(v.length - 1, 1)) === "-") {
                            props.setters.defaultAlt(125)
                            return v.substring(0, Math.max(v.length - 1, 1))
                        } else if (Number.isNaN(parseFloat(v))) {
                            return ""
                        }

                        return props.getters.defaultAlt
                    }} />
                    <div style={{ "display": "flex", "alignItems": "center" }}>
                        <span>ft</span>
                    </div>
                </Row>
                <span>Place Point:</span>
                <Row columns="minmax(0, 2fr) minmax(0, 2fr) minmax(0, 2fr) minmax(0, 2fr) minmax(0, 2fr)  minmax(0,1fr)">
                    <PlacePointInputBox
                        props = {props}
                        refProp={input1Ref} 
                        fieldSpecs = {{"strName" : "Lat", "state" : lat, "onChange" : (e)=>setLat(e)}}
                        placePt = {(e)=>enterPlacePoint(e)}
                        greyOutPlacePoint = {()=>greyOutPlacePoint()}
                    />

                    <PlacePointInputBox
                        props = {props}
                        refProp={input2Ref} 
                        fieldSpecs = {{"strName" : "Lon", "state" : lon, "onChange" : (e) => setLon(e)}}
                        placePt = {(e)=>enterPlacePoint(e)}
                        greyOutPlacePoint = {()=>greyOutPlacePoint()}
                    />

                    <PlacePointInputBox
                        props = {props}
                        refProp={input3Ref} 
                        fieldSpecs = {{"strName" : "Alt", "state" : alt, "onChange" : (e) => setAlt(e)}}
                        placePt = {(e)=>enterPlacePoint(e)}
                        greyOutPlacePoint = {()=>greyOutPlacePoint()}
                    />
                    
                    {greyOutPlacePoint() && props.getters.placementType!="waypoint"? (
                    <PlacePointInputBox
                        props = {props}
                        refProp={input4Ref} 
                        fieldSpecs = {{"strName" : "Radius", "state" : rad, "onChange" : (e) => setRad(e)}}
                        placePt = {(e)=>enterPlacePoint(e)}
                        greyOutPlacePoint = {()=>greyOutPlacePoint()}
                    />
                    ):(null)}

                    {greyOutPlacePoint() && props.getters.placementType=="turnLoiter"? (
                    <PlacePointInputBox
                        props = {props}
                        refProp={input5Ref} 
                        fieldSpecs = {{"strName" : "Turns", "state" : turns, "onChange" : (e) => setTurns(e)}}
                        placePt = {(e)=>enterPlacePoint(e)}
                        greyOutPlacePoint = {()=>greyOutPlacePoint()}
                    />
                    ):(null)}

                    {greyOutPlacePoint() && props.getters.placementType=="timeLoiter"? (
                    <PlacePointInputBox
                        props = {props}
                        refProp={input6Ref} 
                        fieldSpecs = {{"strName" : "Time", "state" : time, "onChange" : (e) => setTime(e)}}
                        placePt = {(e)=>enterPlacePoint(e)}
                        greyOutPlacePoint = {()=>greyOutPlacePoint()}
                    />
                    ):(null)}
                    
                    <Button disabled={!(lat && lon)} onClick={()=>addWaypoint(lat,lon,alt)}>Plot</Button>
                    
                </Row>
                <div style={{ overflow: 'auto', height: '175px', backgroundColor: dark }}>
                    <table>
                        <thead>
                            <tr>
                                <th style={{ padding: "8px" }}>Pt</th>
                                <th style={{ padding: "8px" }}>Latitude</th>
                                <th style={{ padding: "8px" }}>Longitude</th>
                                <th style={{ padding: "8px" }}>Altitude</th>
                                <th style={{ padding: "8px" }}>Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            {props.getters.path.map((point, index) => {
                                if (point.cmd == Commands.jump) {
                                    return (
                                        <tr key={index}>
                                            <td style={{ padding: "2px 8px" }} onMouseEnter={()=>point["highlight"]=true} onMouseLeave={()=>point["highlight"]=false}>{index+1}</td>
                                            <td style={{ padding: "2px 8px" }}>({point.num-1} to {point.p1})</td>
                                            <td style={{ padding: "2px 26px" }}>{"---"}</td>
                                            <td style={{ padding: "2px 8px" }}>Repeats: {point.p2}</td>
                                            <td style={{ padding: "2px 8px" }}>{numToCommands[point.cmd]}</td>
                                        </tr>
                                    )
                                }
                                else if (point.cmd != Commands.jump) {
                                    return (
                                        <tr key={index}>
                                            <td style={{ padding: "2px 8px" }} onMouseEnter={()=>point["highlight"]=true} onMouseLeave={()=>point["highlight"]=false}>{index + 1}</td>
                                            <td style={{ padding: "2px 8px" }}>
                                                {editableIndex === index ? (
                                                    <input
                                                        type="text"
                                                        onChange={(e) => setModLat(e.target.value)}
                                                        ref={edit1Ref}
                                                        defaultValue={point.lat}
                                                        style={{width: "100px"}}
                                                    />
                                                        
                                                ) : (
                                                    point.lat==undefined ? point.lat : point.lat.toFixed(8)
                                                )}
                                            </td>
                                            <td style={{ padding: "2px 8px" }}>
                                                {editableIndex === index ? (
                                                    <input
                                                        type="text"
                                                        onChange={(e) => setModLon(e.target.value)}
                                                        ref={edit2Ref}
                                                        defaultValue={point.lng}
                                                        style={{width: "100px"}}
                                                    />
                                                ) : (
                                                    point.lng==undefined ? point.lng : point.lng.toFixed(8)
                                                )}
                                            </td>
                                            <td style={{ padding: "2px 8px" }}>
                                                {editableIndex === index ? (
                                                    <input
                                                        type="text"
                                                        onChange={(e) => setModAlt(e.target.value)}
                                                        ref={edit3Ref}
                                                        defaultValue={point.alt}
                                                        style={{width: "100px"}}
                                                    />
                                                ) : (
                                                    point.alt==undefined ? point.alt : point.alt.toFixed(8)
                                                )}
                                            </td>
                                            <td style={{ padding: "2px 8px" }}>
                                                {numToCommands[point.cmd]}
                                            </td>
                                            <td style={{ padding: "2px 8px"}}>
                                                <Button onClick={() => editableIndex===index ?  modPoint(point, index) : setEditableIndex(index)} color={editableIndex===index ? "green" : null}>
                                                    {editableIndex===index ? "Save" : "Edit" }
                                                </Button>
                                            </td>
                                            <td style={{ padding: "2px 8px" }}>
                                                <Button onClick={()=>deletePoint(index)} color="red">
                                                    Del
                                                </Button>
                                            </td>
                                        </tr>
                                    )
                                }
                            })}
                        </tbody>
                    </table>
                </div>
                <br />
                {props.getters.pathSaved ? <span>&nbsp;</span> :
                    <span style={{ color: red }}>You have unsaved points!</span>
                }
				
                <Row>
                    <Row height="2.75rem"  columns="minmax(0, 4fr) minmax(0, 3fr) minmax(0, 3fr) minmax(0, 3fr) minmax(0, 3fr)">
                        <div style={{ "display": "flex", "alignItems": "center" }}>
                            <span>Current Path:</span>
                        </div>
                        <Button style={{ width: "auto" }} disabled={props.getters.path.length === 0} onClick={() => {
                            props.setters.path([])
                            props.setters.pathSaved(false)
                        }}>Clear</Button>
                        &nbsp;
                        &nbsp;
                        &nbsp;
                    </Row>
                </Row>
                <Row>
                    <Row height="2.75rem" columns="minmax(0, 4fr) minmax(0, 3fr) minmax(0, 3fr) minmax(0, 3fr) minmax(0, 3fr)">
                        <div style={{ "display": "flex", "alignItems": "center" }}>
                            <span>Mission File:</span>
                        </div>
                        <Button href="http://localhost:5000/uav/commands/view" newTab={true} title="Open the plane Pixhawk mission file in a new tab.">View</Button>
                        <Button disabled={props.getters.pathSaved} onClick={() => {
                            let miss = []
                            for (const [i, value] of props.getters.path.entries()) {
                                if (!value.alt && value.cmd !== Commands.jump) {
                                    miss.push(i)
                                }
                            }
                            if (miss.length > 0) {
                                setMissing(miss)
                                setOpen(true)
                                return
                            }

                            savePath(props.getters.path)
                        }}>Save To</Button>
                        <Button disabled={props.getters.pathSaved} onClick={() => {
                            console.log(props.getters.pathSave)
                            props.setters.path(structuredClone(props.getters.pathSave))
                            props.setters.pathSaved(true)
                        }}>Reset To</Button>
                        <Button onClick={() => httppost("/uav/commands/clear")} title="Clear the mission file in the backend, but not the plane.">Clear</Button>
                    </Row>
                </Row>
                <Row>
                    <Row height="2.75rem" columns="minmax(0, 4fr) minmax(0, 3fr) minmax(0, 3fr) minmax(0, 3fr) minmax(0, 3fr)">
                        <div style={{ "display": "flex", "alignItems": "center" }}>
                            <span>Plane: </span>
                        </div>
                        <Button onClick={() => httppost("/uav/commands/write")} title="Write the Pixhawk mission file to the plane.">Write To</Button>
                        <Button onClick={() => httppost("/uav/commands/load")} title="Load the Pixhawk mission file from the plane into the backend.">Load From</Button>
                        <Button onClick={() => httppost("/uav/sethome")} title="Set the plane's home location to the competition requirement.">Set Home</Button>
                        &nbsp;
                    </Row>
                </Row>
            </Column>
        </div>
    )
}

const PlacePointInputBox = ({ props, refProp, fieldSpecs, placePt, greyOutPlacePoint }) => {
    return (
        <Box
            ref={refProp}
            type="text"
            editable={()=>greyOutPlacePoint()} 
            placeholder={greyOutPlacePoint() ? fieldSpecs["strName"]:"Disabled"} 
            content={greyOutPlacePoint() ? fieldSpecs["state"]:""} 
            onChange={fieldSpecs["onChange"]}
            style={{"backgroundColor":"#E2DBD5","borderColor":"transparent" }} 
            onKeyDown={placePt}
        />
    );
};

export default FlightPlanToolbar

