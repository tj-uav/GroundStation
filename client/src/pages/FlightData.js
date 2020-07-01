import React, { useState, useEffect } from 'react';
import FlightPlanMap from '../components/FlightPlanMap.js'
import Quick from '../components/tabs/Quick.js'
import Actions from '../components/tabs/Actions.js'
import Servo from '../components/tabs/Servo.js'
import { httpget } from '../backend.js'
import { Row } from "../components/Containers"
import { Button } from "../components/UIElements"

const Tabs = ({ ...props }) => {
  const [tab, setTab] = useState(<Actions />)
  const [active, setActive] = useState(tab.type.name)

  const modifyActive = isActive => {
    setActive(isActive)
  }

  const quickButton = <Button
    onClick={() => { setTab(<Quick />); modifyActive(Quick.name) }}
    active={active === Quick.name}
    controlled
  >
    {Quick.name}
  </Button>

  const actionsButton = <Button
    onClick={() => { setTab(<Actions />); modifyActive(Actions.name) }}
    active={active === Actions.name}
    controlled
  >
    {Actions.name}
  </Button>

  const servoButton = <Button
    onClick={() => { setTab(<Servo />); modifyActive(Servo.name) }}
    active={active === Servo.name}
    controlled
  >
    {Servo.name}
  </Button>


  return (
    <section>
      <Row id="tabs" gap="1rem" height="3rem" style={{ marginBottom: "1rem" }} {...props}>
        {quickButton}
        {actionsButton}
        {servoButton}
      </Row>
      {tab}
    </section>
  )
}

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
    <div style={{
      display: "grid",
      padding: "1rem",
      gridTemplateColumns: "37rem 100fr",
      gap: "1rem",
      width: "100%",
      height: "auto",
      overflowY: "hidden"
    }}>
      <Tabs />
      <FlightPlanMap
        display={display}
        getters={getters} setters={setters}
        mode={mode} setMode={setMode}
      />
    </div>
  )
}

export default FlightData;