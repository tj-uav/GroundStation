import React, { useState } from "react"
import styled from "styled-components"

import { dark, blue, red } from "theme/Colors"
import { ReactComponent as RawAccept } from "icons/check.svg"
import { ReactComponent as RawDecline } from "icons/decline.svg"

// type: "accept" | "decline"
const Checkbox = ({ type, callback, ...props }) => {
	const [beingClicked, setBeingClicked] = useState(false)
	return (
		<StyledCheckbox
			{...props}
			isClicked={beingClicked}
			type={type}
			onMouseDown={() => {
				setBeingClicked(true)
			}}
			onMouseUp={e => {
				if (beingClicked && callback) callback(e)
				setBeingClicked(false)
			}}
			onMouseLeave={() => {
				setBeingClicked(false)
			}}
		>
			{type === "decline" ? <Decline /> : <Accept />}
		</StyledCheckbox>
	)
}

const Accept = styled(RawAccept)`
	height: 40%;
	max-width: 35%;
	color: ${dark};
`

const Decline = styled(RawDecline)`
	height: 40%;
	max-width: 35%;
	color: ${dark};
`

const StyledCheckbox = styled.div.withConfig({
	shouldForwardProp: (prop, fn) => !["type", "isClicked"].includes(prop),
})`
	background-color: ${({ type }) => (type === "decline" ? red : blue)};
	${({ isClicked }) => (isClicked ? "filter: brightness(80%);" : "")}
	justify-content: center;
	align-items: center;
	cursor: pointer;
	flex-shrink: 0;
	display: flex;
	height: 100%;
`

export default Checkbox
