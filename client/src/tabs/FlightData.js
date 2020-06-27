import React, { useState, useEffect } from 'react';
import FlightPlanMap from '../components/FlightPlanMap.js'
import Servo from '../components/Servo.js'
import SplitPane from 'react-split-pane'
import { httpget } from '../backend.js'

const FlightData = () => {

  const [telem, setTelem] = useState([]);
  const queryValues = () => {
    httpget("/mav/telem", (response) => setTelem(response.data));
  }

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

  useEffect(() => {
    //        const interval = setInterval(() => {
    //            queryValues();
    //        }, 1000);
    //        return () => clearInterval(interval);
  }, []);

  return (
    <SplitPane split="vertical" minSize="35%" defaultSize="35%" overflow="auto">
      <Servo />
      <FlightPlanMap
        display={display}
        getters={getters} setters={setters}
        mode={mode} setMode={setMode}
      />
    </SplitPane>
  )
}

export default FlightData;