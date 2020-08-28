import React from "react"

import { dark } from "theme/Colors"

export default ({ hook, editable }) => {
	const [value, setValue] = hook

	return (
		<input
			type="text"
			name="value"
			value={value}
			onChange={e => setValue(e.target.value)}
			style={{
				background: dark,
				border: "none",
				outline: "none",
				textAlign: "center",
			}}
			readOnly={editable ? false : true}
		/>
	)
}
