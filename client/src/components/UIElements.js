import React, { useState } from "react"
import { dark, darker, blue, red } from "../theme/Colors"
import styled from "styled-components"

export const Button = ({ active, controlled, ...props }) => {
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
			{...props}
		/>
	)
}

const StyledButton = styled.a`
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
				value={value}
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
	padding: 0;
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
			<Left value={value} />
			<Right value={value} />
			<StyledSlider
				type="range"
				min={min}
				max={max}
				value={scale(value, min, max, 0, 100)}
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
