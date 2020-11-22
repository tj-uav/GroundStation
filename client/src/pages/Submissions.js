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
	// const [unsubmitted, setUnsubmitted] = useState(data.filter(v => !v.submitted))
	// const [submitted, setSubmitted] = useState(data.filter(v => v.submitted))
	const [active, setActive] = useState(undefined)

	// useEffect(() => setUnsubmitted(data.filter(v => !v.submitted)), [data])
	// useEffect(() => setSubmitted(data.filter(v => v.submitted)), [data])

	// const get = async (endpoint, func) => {
	// 	axios
	// 		.get(endpoint, {
	// 			headers: { "Content-Type": "application/json", Accept: "application/json" },
	// 		})
	// 		.then(function (response) {
	// 			func(response)
	// 		})
	// }

	// useEffect(() => {
	// 	const interval = setInterval(() => {
	// 		get("/odlcs/all/all", response => {
	// 			console.log(response)
	// 		})
	// 	}, 1000)
	// 	return () => clearInterval(interval)
	// }, [])

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
