import React from "react"

import Active from "./Active"
import Normal from "./Normal"

const Param = ({ data, active, index, setActiveIndex, setModifiedIndexes, ...props }) => {
	// prettier-ignore
	return active
	    ? <Active {...props} data={data} index={index} setActiveIndex={setActiveIndex} setModifiedIndexes={setModifiedIndexes} />
	    : <Normal {...props} data={data} index={index} setActiveIndex={setActiveIndex} setModifiedIndexes={setModifiedIndexes} />
}

export default Param
