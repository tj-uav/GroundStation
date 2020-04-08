import React, { useState } from 'react'
import FlightPlanMap from '../components/FlightPlanMap.js'
import FlightPlanToolbar from '../components/FlightPlanToolbar.js'
import SplitPane from 'react-split-pane'
//import InputPage from '../components/test.js'

// TODO: Popup for home icon
// TODO: Popup for waypoint labels
// TODO: Add option to make new polygon
// TODO: Implement marker insertion
// TODO: Implement marker removal
// TODO: Display current location of plane (use telem, and also need to make plane icon)
// TODO: Polyline overlay -> take polyline file (custom file structure) and overlay it onto map (allow for color option in file)
// TODO: Display 


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