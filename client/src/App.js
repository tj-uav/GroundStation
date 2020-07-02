import React, { useState, Component } from 'react';
import {BrowserRouter as Router, Switch, Route, Link} from "react-router-dom";
import FlightData from './pages/FlightData.js'
import FlightPlan from './pages/FlightPlan.js'
import Params from './pages/Params.js'
import Submissions from './pages/Submissions.js'
import AntennaTracker from './pages/AntennaTracker.js'
import NavBar from './components/NavBar.js'
import { darker } from "./theme/Colors"

const App = () => {
  // const [telem, setTelem] = useState([]);

  // let flightData = <FlightData telem={telem} setTelem={setTelem}></FlightData>;
  // let flightPlan = <FlightPlan telem={telem} setTelem={setTelem}></FlightPlan>;
  // let params = <Params></Params>;
  // let submissions = <Submissions></Submissions>;
  // let antennaTracker = <AntennaTracker></AntennaTracker>
  // const [view, setView] = useState(flightData);

  return (
    <Router>
      <div>
        <NavBar/>        
        <Switch>
          <Route path="/">
            <FlightData />
          </Route>

          <Route path="/flight-plan">
            <FlightPlan />
          </Route>

          <Route path="/params">
            <Params />
          </Route>

          <Route path="/submissions">
            <Submissions />
          </Route>

          <Route path="/antenna-tracker">
            <AntennaTracker />
          </Route>          
        </Switch>
      </div>
    </Router>
  );
}

export default App
