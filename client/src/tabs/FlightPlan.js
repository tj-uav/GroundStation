import React, { useState } from 'react'
import FlightPlanMap from '../components/FlightPlanMap.js'
import FlightPlanToolbar from '../components/FlightPlanToolbar.js'
import SplitPane from 'react-split-pane'
//import InputPage from '../components/test.js'

const FlightPlan = (props) => {

    const [mode, setMode] = useState("waypoints")
    const [waypoints, setWaypoints] = useState([]);
    const [polygons, setPolygons] = useState([]);
    const [fence, setFence] = useState([]);

    const datatypeAccessors = {
        'waypoints': [waypoints, setWaypoints],
        'polygons': [polygons, setPolygons],
        'fence': [fence, setFence]
    }

    
    return (
        <SplitPane split="vertical" minSize="80%" defaultSize="80%">
            <FlightPlanMap
                datatypeAccessors={datatypeAccessors}
                mode={mode} setMode={setMode}
                 />
            <FlightPlanToolbar 
                datatypeAccessors={datatypeAccessors}
                mode={mode} setMode={setMode}
                 />
        </SplitPane>
    )
    
//   return (
//       <InputPage></InputPage>
//   )
}

export default FlightPlan;