import React, { useState } from "react"

import Active from "./Active"
import Normal from "./Normal"

export default ({ data }) => {
	const [active, setActive] = useState(false)

	// prettier-ignore
	return active
	    ? <Active data={data} hook={[active, setActive]} />
	    : <Normal data={data} hook={[active, setActive]} />
}
