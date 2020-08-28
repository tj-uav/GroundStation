import React, { useState } from "react"
import { Link as RouterLink } from "react-router-dom"
import styled, { css } from "styled-components"

import { dark, darker, blue, red } from "../theme/Colors"
import { ReactComponent as Caret } from "../icons/caret.svg"
import { ReactComponent as RawAccept } from "../icons/check.svg"
import { ReactComponent as RawDecline } from "../icons/decline.svg"

export const Button = ({ active, controlled, to, href, ...props }) => {
	const [isActive, setActive] = useState(active ?? false)

	return (
		<StyledButton
			className="paragraph"
			active={controlled ? active : isActive}
			onMouseDown={() => {
				if (!controlled) setActive(true)
			}}
			onMouseUp={() => {
				if (!controlled)
					setTimeout(() => {
						setActive(false)
					}, 100)
			}}
			to={to}
			href={href}
			{...props}
		/>
	)
}

const Link = ({ to, href, children, ...props }) => {
	if (to)
		return (
			<RouterLink to={to} {...props}>
				{children}
			</RouterLink>
		)
	else
		return (
			<a href={href} {...props}>
				{children}
			</a>
		)
}

// prettier-ignore
const StyledButton = styled(Link).attrs(props => ({
		to: props.to,
		href: props.href,
	}))
	.withConfig({
		shouldForwardProp: (prop, fn) => !["active"].includes(prop),
	})`
	position: relative;
	box-sizing: border-box;
	background: ${props => (props.active ? blue : dark)};
	transition: background-color 0.1s ease;
	color: ${props => (props.active ? dark : blue)} !important;
	text-decoration: none !important;
	display: flex;
	justify-content: center;
	align-items: center;
	text-align: center;

	::after {
		content: "";
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 0.25rem;
		background: ${blue};
		transition: height 0.1s ease;
	}

	&:hover::after {
		content: "";
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 0.5rem;
		background: ${blue};
	}
`

export const Dropdown = ({
	children,
	onOptionSet = undefined,
	initial = undefined,
	maxOptionsShownAtOnce = 10,
}) => {
	const [active, setActive] = useState(false)
	const [option, setOptionRaw] = useState(initial)
	const setOption = onOptionSet ?? setOptionRaw
	let options = children.map(c => (React.isValidElement(c) ? c.props.children : c))
	options.sort() // native is in-place, idk why

	return (
		<div style={{ position: "relative" }} onMouseLeave={() => setActive(false)}>
			<StyledDropdown
				style={{ height: "100%" }}
				className="paragraph"
				active={active}
				onClick={() => setActive(!active)}
			>
				{option ?? "--"}
				<StyledCaret width={16} active={active} />
			</StyledDropdown>
			<div style={{ maxHeight: `${maxOptionsShownAtOnce * 100}%`, overflow: "scroll" }}>
				{active ? (
					options.map((option, i) => (
						<DropdownContent
							key={i}
							number={i}
							setOption={ID => {
								setOption(ID)
								setActive(false)
							}}
						>
							{option}
						</DropdownContent>
					))
				) : (
					<></>
				)}
			</div>
		</div>
	)
}

const StyledCaret = styled(Caret).withConfig({
	shouldForwardProp: (prop, fn) => !["active"].includes(prop),
})`
	transform: ${props => (props.active ? "scaleY(-1)" : "scaleY(1)")};
	transition: transform 0.1s ease;
`

const StyledDropdown = styled(StyledButton)`
	padding: 0 1rem;
	justify-content: space-between;
	height: 100%;
`

const DropdownContent = ({ children, setOption, number, ...props }) => {
	const ID = useState(children)[0]
	return (
		<StyledDropdownContent id={ID} number={number} onClick={() => setOption(ID)} {...props}>
			{children}
		</StyledDropdownContent>
	)
}

const StyledDropdownContent = styled(StyledButton)`
	/* transform: translateY(${props => props.number * 100}%); */
	justify-content: flex-start;
	color: black !important;
	/* position: absolute; */
	padding-left: 1rem;
	cursor: pointer;
	height: 2rem;
	width: 100%;
	z-index: 3;

	::after {
		display: none;
	}

	&:hover {
		color: ${blue} !important;
	}
`

export const Box = ({ content, label, editable, ...props }) => {
	const [value, setValue] = useState(content)

	return (
		<StyledBox {...props} style={{ flexGrow: 1, ...props.style }}>
			{label ? (
				<Label className="paragraph" style={{ height: "2rem" }} error={props.error}>
					{label}
				</Label>
			) : (
				""
			)}
			<StyledBoxContent
				onChange={e => {
					setValue(e.target.value)
				}}
				className="paragraph"
				{...props}
				readOnly={!editable ?? true}
				value={editable ? value : content}
			/>
		</StyledBox>
	)
}

const StyledBox = styled.div`
	width: 100%;
	display: flex;
	position: relative;
	flex-direction: column;
	line-height: ${props => props.line ?? "300%"};
`

const StyledBoxContent = styled.textarea`
	height: ${props => props.style?.height ?? "3rem"};
	cursor: ${props => (props.readOnly ? "default" : "text")};
	border: 0;
	margin: 0;
	padding: 0 1rem;
	flex-grow: 1;
	resize: none;
	text-align: center;
	overflow: hidden;
	background: ${dark};
`

export const Label = ({ children, ...props }) => {
	return (
		<StyledLabel {...props} className={`paragraph ${props.className}`}>
			{children}
		</StyledLabel>
	)
}

const StyledLabel = styled.p`
	line-height: initial;
	color: ${props => (props.error ? red : blue)};
	grid-row: ${props => (props.rows ? `span ${props.rows}` : "initial")};
	grid-column: ${props => (props.columns ? `span ${props.columns}` : "initial")};
`

export const Slider = ({ min = 0, max = 100, initial = 0, height, ...props }) => {
	const [value, setValue] = useState(initial)

	const scale = (num, in_min, in_max, out_min, out_max) => {
		return ((num - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
	}

	return (
		<StyledSliderBox {...props}>
			<Left value={scale(value, min, max, 0, 100)} />
			<Right value={scale(value, min, max, 0, 100)} />
			<StyledSlider
				type="range"
				min={min}
				max={max}
				value={value}
				onChange={e => {
					setValue(e.target.value)
				}}
			></StyledSlider>
		</StyledSliderBox>
	)
}

const StyledSliderBox = styled(StyledBox)`
	display: flex;
	padding: 0 1rem;
	background: ${dark};
	justify-content: center;
	height: ${props => props.height ?? "3rem"};
`

const StyledSlider = styled.input`
	-webkit-appearance: none;
	appearance: none;

	left: 1rem;
	right: 1rem;
	height: 0.25rem;
	position: absolute;
	background: transparent;
	border-radius: 0.125rem;
	width: calc(100% - 2rem);

	&::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;

		width: 1rem;
		height: 1rem;
		cursor: pointer;
		background: ${darker};
		border-radius: 0.5rem;
	}

	&::-moz-range-thumb {
		width: 1rem;
		height: 1rem;
		cursor: pointer;
		background: ${darker};
		border-radius: 0.5rem;
	}
`

const Left = styled.div`
	opacity: 1;
	height: 0.25rem;
	position: relative;
	background: ${blue};
	transform: translateY(50%);
	width: ${props => props.value}%;
	border-top-left-radius: 0.25rem;
	border-bottom-left-radius: 0.25rem;
`

const Right = styled.div`
	opacity: 0.5;
	height: 0.25rem;
	position: relative;
	background: ${blue};
	transform: translateY(-50%);
	border-top-right-radius: 0.25rem;
	border-bottom-right-radius: 0.25rem;
	margin-left: ${props => props.value}%;
	width: calc(100% - ${props => props.value}%);
`

// type: "accept" | "decline"
export const Checkbox = ({ type, callback, ...props }) => {
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

const CheckboxStylesSVG = css`
	height: 40%;
	max-width: 35%;
	color: ${dark};
`

const Accept = styled(RawAccept)`
	${props => CheckboxStylesSVG}
`

const Decline = styled(RawDecline)`
	${props => CheckboxStylesSVG}
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
