import React from "react"
import "./App.css"
import FlightData from "pages/FlightData"
import Params from "pages/Params"
import Submissions from "pages/Submissions"
import "bootstrap/dist/css/bootstrap.min.css"
import { darker } from "./theme/Colors"
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom"
import { Header } from "./components/Header.js"

const App = () => {
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
				<Header />
				<Switch>
					<Route path="/flight-data">
						<FlightData />
					</Route>

					<Route path="/params">
						<Params />
					</Route>

					<Route path="/submissions">
						<Submissions />
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
