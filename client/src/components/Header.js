import React, { useEffect, useRef, useState } from "react"
import { Row, Modal, ModalBody, ModalHeader } from "components/Containers"
import { darker } from "theme/Colors"
import styled from "styled-components"
import { Box, Button } from "./UIElements"
import { useBackendConnection } from "../GlobalSettings"

const NavContainer = styled.div`
	background: ${darker};
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 4rem;
	margin: 0 1rem;
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

const ConnectionButton = (props) => {
	const [open, setOpen] = useState(false)
	const boxRef = useRef(null)

	const url = useBackendConnection().backendConnection
	const setUrl = useBackendConnection().setBackendConnection

	useEffect(() => {
		boxRef.current?.focus()
	}, [])

	return (
		<div>
			<Button style={{ "width": "3em", "margin-top": "0.75em" }} onChange={() => {
				setOpen(true)
			}}>
				Con
			</Button>
			<Modal open={open} setOpen={setOpen}>
				<ModalHeader>Backend Connection</ModalHeader>
				<ModalBody>
					<div style={{ "display": "flex" }}>
						<div style={{ "display": "flex", "align-items": "center" }}>Query URL:</div>
						<Box style={{ "margin-left": "1em", "width": "25em" }} ref={boxRef} editable={true} content={url}>url</Box>
						<Button style={{ "width": "10em", "height": "3em", "margin-left": "0" }} onClick={() => {
							setUrl(boxRef.current.value)
						}}>Set URL</Button>
					</div>
				</ModalBody>
			</Modal>
		</div>
	)
}

const Header = () => {
	return (
		<NavContainer>
			<h1 className="heading" style={{ "margin-right": "25rem" }}>TJUAV Ground Station</h1>
			<Row width="50%" style={{ "margin-top": "0.5em", "margin-right": "-5em" }}>
				<Link href="/">Flight Data</Link>
				<Link href="/params">Params</Link>
				<Link href="/submissions">Submissions</Link>
				<Link href="/antenna-tracker">Antenna Tracker</Link>
			</Row>
			<ConnectionButton />
		</NavContainer>
	)
}

export { Header };
