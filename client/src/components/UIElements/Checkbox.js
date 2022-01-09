import React, { useState } from "react"
import styled from "styled-components"

import { dark, blue, red, green, grey } from "theme/Colors"
import { ReactComponent as RawAccept } from "icons/check.svg"
import { ReactComponent as RawDecline } from "icons/decline.svg"
import { ReactComponent as RawSave } from "icons/save.svg"

const Checkbox = ({ type, callback, disabled, ...props }) => {
	const [beingClicked, setBeingClicked] = useState(false)

	return (
		<StyledCheckbox
			{...props}
			disabled={disabled}
			isClicked={beingClicked}
			type={type}
			onMouseDown={() => {
				if (!disabled) setBeingClicked(true)
			}}
			onMouseUp={e => {
				if (callback && !disabled) {
					callback(e)
				}
				setBeingClicked(false)
			}}
			onMouseLeave={() => {
				if (!disabled) setBeingClicked(false)
			}}
		>
			{type === "accept" ? <Accept /> : (type === "decline" ? <Decline /> : <Save />)}
		</StyledCheckbox>
	)
}

const Accept = styled(RawAccept)`
	height: 50%;
	max-width: 45%;
	color: white;
`

const Decline = styled(RawDecline)`
	height: 55%;
	max-width: 40%;
	color: white;
`

const Save = styled(RawSave)`
	height: 40%;
	max-width: 40%;
	fill: white;
`

const Colors = {
	accept: green,
	save: blue,
	decline: red
}

const StyledCheckbox = styled.div.withConfig({
	shouldForwardProp: (prop) => !["isClicked"].includes(prop),
})`
	background-color: ${(props) => props.disabled ? grey : Colors[props.type]};
	${({ isClicked }) => (isClicked ? "filter: brightness(80%);" : "")}
	justify-content: center;
	align-items: center;
	cursor: pointer;
	flex-shrink: 0;
	display: flex;
	height: 100%;
`

export default Checkbox
