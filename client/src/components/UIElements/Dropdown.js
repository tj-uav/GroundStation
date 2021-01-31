import React, { useState, useEffect, forwardRef } from "react"
import styled from "styled-components"

import { blue } from "theme/Colors"
import { ReactComponent as Caret } from "icons/caret.svg"

import { StyledButton } from "./Button"

const Dropdown = forwardRef(
	(
		{
			children,
			onChange = undefined,
			initial = undefined,
			blank = "--",
			selected = undefined,
			maxOptionsShownAtOnce = 10,
		},
		ref
	) => {
		const [active, setActive] = useState(false)
		const [option, setOption] = useState(initial)
		useEffect(() => {
			setOption(selected)
		}, [selected])
		let options = children.map(c => (React.isValidElement(c) ? c.props.children : c))
		options.sort() // native is in-place, idk why

		return (
			<div style={{ position: "relative" }} onMouseLeave={() => setActive(false)}>
				<StyledDropdown
					ref={ref}
					style={{ height: "100%" }}
					className="paragraph"
					active={active}
					onClick={() => setActive(!active)}
				>
					{option ?? blank}
					<StyledCaret width={16} active={active} />
				</StyledDropdown>
				<div style={{ maxHeight: `${maxOptionsShownAtOnce * 100}%`, overflow: "scroll" }}>
					{active ? (
						options.map((option, i) => (
							<DropdownContent
								key={i}
								number={i}
								setOption={ID => {
									if (onChange) onChange(ID)
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
)

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

export default Dropdown
