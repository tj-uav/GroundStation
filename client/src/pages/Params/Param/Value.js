import React from "react"

import { dark } from "theme/Colors"

const Value = ({ hook, editable, style }) => {
	const [value, setValue] = hook

	return (
		<input
			type="text"
			name="value"
			value={value}
			onChange={e => setValue(e.target.value)}
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
