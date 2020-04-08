import React, { useState } from 'react'
import FlightPlanMap from '../components/FlightPlanMap.js'
import FlightPlanToolbar from '../components/FlightPlanToolbar.js'
import SplitPane from 'react-split-pane'

const FlightPlan = (props) => {

    const [mode, setMode] = useState("waypoints")
    const [waypoints, setWaypoints] = useState([]);
    const [polygons, setPolygons] = useState([]);
    const [fence, setFence] = useState([]);

    return (
        <SplitPane split="vertical" minSize="80%" defaultSize="80%">
            <FlightPlanMap
                waypoints={waypoints} setWaypoints={setWaypoints}
                polygons={polygons} setPolygons={setPolygons}
                fence={fence} setFence={setFence}
                 />
            <FlightPlanToolbar 
                waypoints={waypoints} setWaypoints={setWaypoints}
                polygons={polygons} setPolygons={setPolygons}
                fence={fence} setFence={setFence}
                 />
        </SplitPane>
    )
}

export default FlightPlan;