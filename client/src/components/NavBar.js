import React from 'react';
import { Row, Column } from "./Containers"

const NavBar = () => {
	return (
		// <div>
		// 	<ul id="nav" style={{ display: "inline" }}>
		// 		<li><a href="/">Home</a></li>
		// 		<li><a href="/flight-plan">About</a></li>
		// 		<li><a href="/params">FAQ</a></li>
		// 		<li><a href="/submissions">Contact</a></li>
		// 		<li><a href="/antenna-tracker">Bruh</a></li>
		// 	</ul>
		// </div>

		<Column>
			<Row id="labels" height="2rem" gap="0.5rem">
				<li><a href="/">Flight Data</a></li>
				<li><a href="/flight-plan">Flight Plan</a></li>
				<li><a href="/params">Params</a></li>
				<li><a href="/submissions">Submissions</a></li>
				<li><a href="/antenna-tracker">Antenna Tracker</a></li>
			</Row>
		</Column>
	)
}

export default NavBar
