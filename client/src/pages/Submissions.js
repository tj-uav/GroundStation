import React, { useEffect, useState } from "react"
import axios from "axios"

import SubmissionsToolbar from "../components/submissions/SubmissionsToolbar"
import TabBar from "../components/TabBar"
import View from "../components/submissions/tabs/View"
import Submitted from "../components/submissions/tabs/Submitted"

// generating random data for now
const choice = list => list[Math.floor(Math.random() * list.length)]
const initialData = new Array(5).fill().map(() => ({
	submitted: false,
	shape: choice(["Square", "Circle", "Star", "Triangle"]),
	shapeColor: choice(["Red", "Orange", "Yellow", "Green", "Blue", "Purple"]),
	letter: choice("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")),
	letterColor: choice(["Red", "Orange", "Yellow", "Green", "Blue", "Purple"]),
	orientation: Math.floor(Math.random() * 360 + 1),
	latitude: Math.floor(Math.random() * 100),
	longitude: Math.floor(Math.random() * 100),
	description: "",
}))

const Submissions = () => {
	const [data, setData] = useState(initialData)
	const [active, setActive] = useState(undefined)

	useEffect(() => {
		data.filter(v => !v.submitted).length === 0 && setActive(undefined)
	}, [data])

	return (
		<div
			style={{
				display: "grid",
				padding: "1rem 1rem 0 1rem",
				gridTemplateColumns: "37rem 100fr",
				gap: "1rem",
				width: "100%",
				height: "auto",
				overflowY: "hidden",
			}}
		>
			<TabBar>
				<View
					unsubmitted={data.filter(v => !v.submitted)}
					active={[active, setActive]}
					data={[data, setData]}
				/>
				<Submitted submitted={data.filter(v => v.submitted)} />
			</TabBar>
			<SubmissionsToolbar data={[data, setData]} active={[active, setActive]} />
		</div>
	)
}

export default Submissions
