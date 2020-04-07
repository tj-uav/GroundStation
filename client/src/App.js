import React, { useState } from 'react';
import './App.css';
import FlightData from './tabs/FlightData.js'
import FlightPlan from './tabs/FlightPlan.js'
import Params from './tabs/Params.js'
import Submissions from './tabs/Submissions.js'
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'


const App = () => {
  let flightData = <FlightData></FlightData>;
  let flightPlan = <FlightPlan></FlightPlan>;
  let params = <Params></Params>;
  let submissions = <Submissions></Submissions>;
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
            activeKey="flight-data"
            onSelect={(selectedKey) => onSelect(selectedKey)}>
            <Nav.Item>
              <Nav.Link eventKey="flight-data">Flight Data</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="flight-plan">Flight Plan</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="params">Params</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="submissions">Submissions</Nav.Link>
            </Nav.Item>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      {view}
    </div>
  );
}


export default App;
