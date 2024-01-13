import React from "react"

import { dark } from "theme/Colors"

const Value = ({ hook, editable, style, ...props }) => {
	const [value, setValue] = hook

	return (
		<input
			type="text"
			name="value"
			value={value}
			onChange={e => setValue(e.target.value)}
			onKeyPress={e => {
				if (e.key == "Enter") {
					props.submit()
				}
			}}
			style={{
				...style,
				background: dark,
				border: "none",
				outline: "none",
				textAlign: "center",
			}}
			readOnly={editable ? false : true}
		/>
	)
}

export default Value
