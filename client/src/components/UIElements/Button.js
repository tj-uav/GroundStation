import React, { useState, forwardRef } from "react"
import styled from "styled-components"

import { dark, blue, red } from "theme/Colors"

import Link from "./Link"

import { ReactComponent as RawWarning } from "icons/warning.svg"
import { unselectable } from "css.js"

const Button = forwardRef(({ active, disabled, untouched, onChange, onClick, controlled, to, href, careful = false, ...props }, ref) => {
	const [isActive, setActive] = useState(active ?? false)

	return (
		<StyledButton
			ref={ref}
			className="paragraph"
			active={controlled ? active : isActive}
			disabled={disabled}
			onMouseDown={() => {
				if (!disabled) setActive(true)
			}}
			untouched={untouched}
			onMouseUp={() => {
				if (!disabled)
					setTimeout(() => {
						if (!careful) setActive(false)
						if (ref?.current) setActive(false)
						if (onChange) onChange()
						if (onClick) onClick()
					}, 50)
			}}
			to={to}
			href={href}
			newTab={props.newTab}
			{...props}
		>
			<div styles="display: inline;">
				{ props.children }
				{ props.warning ? <Warning /> : null }
			</div>
		</StyledButton>
	)
})

const Warning = styled(RawWarning)`
	height: 1em;
	width: 1em;
	margin-left: 0.5em;
	margin-top: -0.25em;
	color: ${props => props.warningColor ? props.warningColor : red};
	fill: ${props => props.warningColor ? props.warningColor : red};
	g {
		path {
			stroke: ${props => props.warningColor ? props.warningColor : red};
		}
	}
`

// prettier-ignore
export const StyledButton = styled(Link).attrs(props => ({
	to: props.to,
	href: props.href,
	newTab: props.newTab
})).withConfig({
	shouldForwardProp: (prop, fn) => !["active"].includes(prop),
})`
	${unselectable}
	position: relative;
	box-sizing: border-box;
	background: ${props => (props.active && !(props.disabled || props.untouched) ? (props.color ?? blue) : dark)};
	transition: background-color 0.1s ease;
	color: ${props => (props.active ? dark : (!(props.disabled || props.untouched) ? props.color ?? blue : "grey"))} !important;
	text-decoration: none !important;
	display: flex;
	justify-content: center;
	align-items: center;
	text-align: center;
  	padding-top: ${props => (props.large ? "1rem" : "0.3rem")};
  	padding-bottom: ${props => (props.large ? "1rem" : "0.3rem")};
	cursor: ${props => props.disabled ? "not-allowed" : "pointer"};

	::after {
		content: "";
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 0.25rem;
		background: ${props => ((props.disabled || props.untouched) ? "grey" : props.color) ?? blue};
		transition: height 0.1s ease;
	}

	&:hover::after {
		content: "";
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: ${props => !props.disabled ? "0.5rem" : "0.25rem"};
		background: ${props => ((props.disabled || props.untouched) ? "grey" : props.color) ?? blue};
	}
`

export default Button
