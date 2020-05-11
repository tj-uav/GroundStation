import React, { useState } from 'react'
import FlightPlanMap from '../components/FlightPlanMap.js'
import FlightPlanToolbar from '../components/FlightPlanToolbar.js'
import SplitPane from 'react-split-pane'

/*
TODO: Home icon
TODO: Waypoint number icon
TODO: Implement marker insertion
TODO: Display current location of plane (use telem, and also need to make plane icon)
TODO: Polyline overlay -> take polyline file (custom file structure) and overlay it onto map (allow for color option in file)
TODO: Commands display in toolbar
TODO: Commands creation in toolbar
TODO: Interactive display list (move around, delete, insert)
TODO: Fix error where waypoint and fence modes display polygon points
T̶O̶D̶O̶:̶ P̶o̶l̶y̶l̶i̶n̶e̶ a̶r̶r̶o̶w̶s̶ s̶h̶o̶w̶i̶n̶g̶ d̶i̶r̶e̶c̶t̶i̶o̶n̶ o̶f̶ w̶a̶y̶p̶o̶i̶n̶t̶s̶
TODO: Display list highlighting (and vice versa)
*/


const FlightPlan = (props) => {

  const [mode, setMode] = useState("waypoints")
  const [waypoints, setWaypoints] = useState([]);
  const [commands, setCommands] = useState([]);
  const [polygons, setPolygons] = useState([[]]);
  const [fence, setFence] = useState([]);

  const getters = {
    'commands': commands,
    'waypoints': waypoints,
    'polygons': polygons,
    'fence': fence
  }

  const setters = {
    'commands': setCommands,
    'waypoints': setWaypoints,
    'polygons': setPolygons,
    'fence': setFence
  }

  const display = {
    'commands': 'Command',
    'waypoints': 'Waypoint',
    'polygons': 'Polygon',
    'fence': 'Geofence'
  }

  return (
    <SplitPane split="vertical" minSize="80%" defaultSize="80%" overflow="auto">
      <FlightPlanMap
        display={display}
        getters={getters} setters={setters}
        mode={mode} setMode={setMode}
      />
      <FlightPlanToolbar
        display={display}
        getters={getters} setters={setters}
        mode={mode} setMode={setMode}
      />
    </SplitPane>
  )

  //   return (
  //       <InputPage></InputPage>
  //   )
}

export default FlightPlan;