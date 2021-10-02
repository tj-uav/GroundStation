import React, { useState, useEffect, forwardRef } from "react"
import styled from "styled-components"

import { dark } from "theme/Colors"

import Label from "./Label"

const Box = forwardRef(({ content, label, editable, onChange = undefined, ...props }, ref) => {
	const [value, setValue] = useState(content)
	useEffect(() => {
		setValue(content)
	}, [content])

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
				style={props.style}
				ref={ref}
				onChange={e => {
					if (onChange) onChange(e.target.value)
					setValue(e.target.value)
				}}
				className="paragraph"
				readOnly={!editable ?? true}
				value={editable ? value : content}
				placeholder={props.placeholder ?? ""}
			/>
		</StyledBox>
	)
})

export const StyledBox = styled.div`
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

export default Box
