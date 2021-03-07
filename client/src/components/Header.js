import React from "react"
import { Row } from "components/Containers"
import { darker } from "theme/Colors"
import styled from "styled-components"
import io from "socket.io-client";

const NavContainer = styled.div`
	background: ${darker};
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 5rem;
	margin: 0 2rem;
`

const Link = ({ href, children, ...props }) => {
	return (
		<li {...props} style={{ listStyleType: "none" }}>
			<StyledLink href={href} className="paragraph">
				{children}
			</StyledLink>
		</li>
	)
}

const StyledLink = styled.a`
	text-decoration: none !important;
	color: black;
`

const endpoint = 'http://127.0.0.1:5000';
//const socket = io(endpoint, {transports: ['websocket', 'polling', 'flashsocket']});
const socket = io(endpoint);

const Header = () => {

	return (
		<NavContainer>
			<h1 className="heading">TJUAV Ground Station</h1>
			<Row width="50%">
				<Link href="/">Flight Data</Link>
				<Link href="/flight-plan">Flight Plan</Link>
				<Link href="/params">Params</Link>
				<Link href="/submissions">Submissions</Link>
				<Link href="/antenna-tracker">Antenna Tracker</Link>
			</Row>
		</NavContainer>
	)
}

export { Header, socket };
