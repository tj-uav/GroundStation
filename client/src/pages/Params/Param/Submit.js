import React from "react"

import { Checkbox } from "components/UIElements"

const Submit = ({ type, callback }) => (
	<Checkbox
		id={type}
		as="button"
		type={type}
		callback={callback}
		style={{
			border: "none",
			borderRadius: "unset",
			outline: "none",
      flexShrink: "1"
		}}
	></Checkbox>
)

export default Submit
