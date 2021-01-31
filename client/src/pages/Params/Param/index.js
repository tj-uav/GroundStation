import React, { useState } from "react"

import Active from "./Active"
import Normal from "./Normal"

const Param = ({ data, ...props }) => {
	const [active, setActive] = useState(false)

	// prettier-ignore
	return active
	    ? <Active {...props} data={data} hook={[active, setActive]} />
	    : <Normal {...props} data={data} hook={[active, setActive]} />
}

export default Param
