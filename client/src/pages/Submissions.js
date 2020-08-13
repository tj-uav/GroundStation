import React, { useState, useEffect } from "react"
import axios from "axios"

import SubmissionsToolbar from "../components/submissions/SubmissionsToolbar"
import TabBar from "../components/TabBar"
import View from "../components/submissions/tabs/View"
import Submitted from "../components/submissions/tabs/Submitted"

const Submissions = () => {
	const [submissions, setSubmissions] = useState([])

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
				padding: "1rem",
				gridTemplateColumns: "37rem 100fr",
				gap: "1rem",
				width: "100%",
				height: "auto",
				overflowY: "hidden",
			}}
		>
			<TabBar>
				<View />
				<Submitted />
			</TabBar>
			<SubmissionsToolbar />
		</div>
	)
}

export default Submissions
