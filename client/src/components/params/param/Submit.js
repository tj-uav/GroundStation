import React from "react"

import { Checkbox } from "components/UIElements"

export default ({ type, callback }) => (
	<Checkbox
		id={type}
		as="button"
		type={type}
		callback={callback}
		style={{
			border: "none",
			borderRadius: "unset",
			outline: "none",
		}}
	></Checkbox>
)
