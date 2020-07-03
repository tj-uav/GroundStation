import React, { useState, useEffect } from "react"
import SubmissionsToolbar from "../components/submissions/SubmissionsToolbar.js"
import axios from "axios"

const Submissions = () => {
	const [submissions, setSubmissions] = useState([])

	const get = async (endpoint, func) => {
		axios
			.get(endpoint, {
				headers: { "Content-Type": "application/json", Accept: "application/json" },
			})
			.then(function (response) {
				func(response)
			})
	}

	useEffect(() => {
		const interval = setInterval(() => {
			get("/odlcs/all/all", response => {
				console.log(response)
			})
		}, 1000)
		return () => clearInterval(interval)
	}, [])

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
			<SubmissionsToolbar/>
		</div>
	)
}

export default Submissions
