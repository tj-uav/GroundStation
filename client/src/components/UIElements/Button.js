import React, { useState, forwardRef } from "react"
import styled from "styled-components"

import { dark, blue } from "theme/Colors"

import Link from "./Link"

const Button = forwardRef(({ active, onChange, controlled, to, href, careful = false, ...props }, ref) => {
	const [isActive, setActive] = useState(active ?? false)

	return (
		<StyledButton
			ref={ref}
			className="paragraph"
			active={controlled ? active : isActive}
			onMouseDown={() => {
				if (!controlled) setActive(true)
			}}
			onMouseUp={() => {
				if (!controlled)
					setTimeout(() => {
						if (!careful) setActive(false)
						if (ref?.current) setActive(false)
						if (onChange) onChange()
					}, 100)
			}}
			to={to}
			href={href}
			{...props}
		/>
	)
})

// prettier-ignore
export const StyledButton = styled(Link).attrs(props => ({
	to: props.to,
	href: props.href,
})).withConfig({
	shouldForwardProp: (prop, fn) => !["active"].includes(prop),
})`
	position: relative;
	box-sizing: border-box;
	background: ${props => (props.active ? (props.color ?? blue) : dark)};
	transition: background-color 0.1s ease;
	color: ${props => (props.active ? dark : (props.color ?? blue))} !important;
	text-decoration: none !important;
	display: flex;
	justify-content: center;
	align-items: center;
	text-align: center;
  	padding-top: ${props => (props.large ? "1rem" : "0.5rem")};
  	padding-bottom: ${props => (props.large ? "1rem" : "0.5rem")};
  	cursor: pointer;

	::after {
		content: "";
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 0.25rem;
		background: ${props => props.color ?? blue};
		transition: height 0.1s ease;
	}

	&:hover::after {
		content: "";
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 0.5rem;
		background: ${props => props.color ?? blue};
	}
`

export default Button
