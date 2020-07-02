import React from 'react';

const NavBar = () => {
	return (
		<div>
			<ul id="nav" style={{display: "inline"}}>
				<li><a href="/">Home</a></li>
				<li><a href="/flight-plan">About</a></li>
				<li><a href="/params">FAQ</a></li>
				<li><a href="/submissions">Contact</a></li>
				<li><a href="/antenna-tracker">Bruh</a></li>
			</ul>
		</div>
	)
}

export default NavBar
