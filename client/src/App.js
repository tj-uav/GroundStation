import React from "react"
import "./App.css"
import FlightData from "pages/FlightData"
import FlightPlan from "pages/FlightPlan"
import Params from "pages/Params"
import Submissions from "pages/Submissions"
import AntennaTracker from "pages/AntennaTracker.js"
import "bootstrap/dist/css/bootstrap.min.css"
import { darker } from "./theme/Colors"
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom"
import NavBar from "./components/NavBar.js"

const App = () => {
	// const [telem, setTelem] = useState([])

	// let flightData = <FlightData telem={telem} setTelem={setTelem}></FlightData>
	// let flightPlan = <FlightPlan telem={telem} setTelem={setTelem}></FlightPlan>
	// let params = <Params></Params>
	// let submissions = <Submissions></Submissions>
	// let antennaTracker = <AntennaTracker></AntennaTracker>
	// const [view, setView] = useState(flightData)

	return (
		<Router>
			<div
				style={{
					background: darker,
					height: "100vh",
					display: "grid",
					gridTemplateRows: "5rem auto 1rem",
				}}
			>
				<NavBar />
				<Switch>
					<Route path="/flight-data">
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

					<Route path="/">
						<Redirect to="/flight-data" />
					</Route>
				</Switch>
			</div>
		</Router>
	)
}

export default App
