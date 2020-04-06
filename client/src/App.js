import React, { useState } from 'react';
import './App.css';
import Map from './tabs/Map.js'
import Data from './tabs/Data.js'
import FlightPlan from './tabs/FlightPlan.js'
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'


function App() {
  let map = <Map></Map>;
  let flightPlan = <FlightPlan></FlightPlan>;
  let data = <Data></Data>;
  const [view, setView] = useState(map);

  const onSelect = (selectedKey) => {
    console.log(selectedKey);
    switch(selectedKey){
      case "map":
        setView(map);
        break;
      case "data":
        setView(data);
        break;
      case "flight-plan":
        setView(flightPlan);
        break;
      default:
        setView(map);
    }
  }

  return (
    <div>
      <Navbar bg="light" expand="lg">
        <Navbar.Brand href="#home">React-Bootstrap</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav
            activeKey="map"
            onSelect={(selectedKey) => onSelect(selectedKey)}>
            <Nav.Item>
              <Nav.Link eventKey="map">Map</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="flight-plan">Flight Plan</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="data">Data</Nav.Link>
            </Nav.Item>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      {view}
    </div>
  );
}

export default App;
