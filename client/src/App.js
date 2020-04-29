import React, { useState } from 'react';
import './App.css';
import FlightData from './tabs/FlightData.js'
import FlightPlan from './tabs/FlightPlan.js'
import Params from './tabs/Params.js'
import Submissions from './tabs/Submissions.js'
import AntennaTracker from './tabs/AntennaTracker.js'
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'

const App = () => {
  const [telem, setTelem] = useState([]);

  let flightData = <FlightData telem={telem} setTelem={setTelem}></FlightData>;
  let flightPlan = <FlightPlan telem={telem} setTelem={setTelem}></FlightPlan>;
  let params = <Params></Params>;
  let submissions = <Submissions></Submissions>;
  let antennaTracker = <AntennaTracker></AntennaTracker>
  const [view, setView] = useState(flightData);

  const onSelect = (selectedKey) => {
    console.log(selectedKey);
    switch(selectedKey){
      case "flight-data":
        setView(flightData);
        break;
      case "flight-plan":
        setView(flightPlan);
        break;
      case "params":
        setView(params);
        break;
      case "submissions":
        setView(submissions);
        break;
      case "antenna-tracker":
        setView(antennaTracker)
      default:
        setView(flightData);
    }
  };

  return (
    <div>
      <Navbar bg="light" expand="lg">
        <Navbar.Brand href="#home">TJUAV Ground Station</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav
            onSelect={(selectedKey) => onSelect(selectedKey)}>
            <Nav.Link eventKey="flight-data">Flight Data</Nav.Link>
            <Nav.Link eventKey="flight-plan">Flight Plan</Nav.Link>
            <Nav.Link eventKey="params">Params</Nav.Link>
            <Nav.Link eventKey="submissions">Submissions</Nav.Link>
            <Nav.Link eventKey="antenna-tracker">Antenna Tracker</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      {view}
    </div>
  );
}


export default App;
