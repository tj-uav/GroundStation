import React, { useState } from 'react'
import FlightPlanMap from '../components/FlightPlanMap.js'
import FlightPlanToolbar from '../components/FlightPlanToolbar.js'
import SplitPane from 'react-split-pane'

const FlightPlan = () => {

    const [waypoints, setWaypoints] = useState([]);

    return (
        <SplitPane split="vertical" minSize="80%" defaultSize="80%">
            <FlightPlanMap
                waypoints={waypoints} setWaypoints={setWaypoints}
                 />
            <FlightPlanToolbar 
                waypoints={waypoints} setWaypoints={setWaypoints}
                 />
        </SplitPane>
    )
}

export default FlightPlan;