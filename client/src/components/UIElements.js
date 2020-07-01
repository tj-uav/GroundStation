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

const StyledBoxLabel = styled.p`
	margin: 0;
	padding: 0;
	width: ${props => props.style?.width ?? "100%"};
	height: 2rem;
	color: ${props => (props.error ? red : blue)};
	position: relative;
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
