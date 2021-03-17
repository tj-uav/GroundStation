import React, { useState } from "react"
import styled from "styled-components"

import { dark, darker, blue } from "theme/Colors"

import { StyledBox } from "./Box"

const Slider = ({
	min = 0,
	max = 100,
	initial = 0,
	height,
	onChange,
	value: value_g = undefined,
	...props
}) => {
	const [value_l, setValue] = useState(initial)
	const value = value_g ?? value_l

	const scale = (num, in_min, in_max, out_min, out_max) => {
		return ((num - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
	}

	return (
		<StyledSliderBox {...props}>
			<Left number={scale(value, min, max, 0, 100)} />
			<Right number={scale(value, min, max, 0, 100)} />
			<StyledSlider
				type="range"
				min={min}
				max={max}
				value={value}
				onChange={e => {
					setValue(e.target.value)
					onChange(e.target.value)
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

const Left = styled.div.attrs(props => ({
	style: {
		"--value": `${props.number}%`,
	},
}))`
	opacity: 1;
	height: 0.25rem;
	position: relative;
	background: ${blue};
	width: var(--value);
	transform: translateY(50%);
	border-top-left-radius: 0.25rem;
	border-bottom-left-radius: 0.25rem;
`

const Right = styled.div.attrs(props => ({
	style: {
		"--value": `${props.number}%`,
	},
}))`
	opacity: 0.5;
	height: 0.25rem;
	position: relative;
	background: ${blue};
	margin-left: var(--value);
	transform: translateY(-50%);
	width: calc(100% - var(--value));
	border-top-right-radius: 0.25rem;
	border-bottom-right-radius: 0.25rem;
`

export default Slider
