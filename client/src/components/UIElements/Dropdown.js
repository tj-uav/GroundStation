import React, { useState, useEffect, forwardRef } from "react"
import styled from "styled-components"

import { ReactComponent as Caret } from "icons/caret.svg"

import { StyledButton } from "./Button"
import { blue } from "theme/Colors"
import { unselectable } from "css.js"

const Dropdown = forwardRef(
	(
		{
			children,
			onChange = undefined,
			initial = undefined,
			blank = "--",
			maxOptionsShownAtOnce = 10,
		},
		ref
	) => {
		const [active, setActive] = useState(false)
		const [option, setOption] = useState(initial)
		useEffect(() => {
			setOption(initial)
		}, [initial])
		let options = children.map(c => ({ text: (React.isValidElement(c) ? c.props.children : c), value: c.props.value ?? c.props.children }))
		options.sort((a, b) => {return a.text > b.text})

		return (
			<div style={{ position: "relative", height: "3rem" }} onMouseLeave={() => setActive(false)}>
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
				<div style={{ maxHeight: `${maxOptionsShownAtOnce * 100}%`, overflow: "auto" }}>
					{active ? (
						options.map((_option, i) => (
							<DropdownContent
								value={_option.value}
								key={i}
								number={i}
								setOption={(ID, value) => {
									if (onChange) onChange(value)
									setOption(ID)
									setActive(false)
								}}
							>
								{_option.text}
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
	${unselectable}
	padding: 0 1rem;
	justify-content: space-between;
	height: 100%;
`

const DropdownContent = ({ value, children, setOption, number, ...props }) => {
	const ID = useState(children)[0]
	return (
		<StyledDropdownContent id={ID} number={number} onClick={() => setOption(ID, value)} {...props}>
			{children}
		</StyledDropdownContent>
	)
}

const StyledDropdownContent = styled(StyledButton)`
	${unselectable}
	justify-content: flex-start;
	color: black !important;
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

const StyledDropdownItem = ({children, value}) => {
	return (
		<span>{children}</span>
	)
}

Dropdown.Item = StyledDropdownItem
export default Dropdown
