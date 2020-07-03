import React, { useState, useEffect } from "react"
import SubmissionsToolbar from "../components/submissions/SubmissionsToolbar.js"
import View from "../components/submissions/tabs/View.js"
import Submitted from "../components/submissions/tabs/Submitted.js"
import { Row } from "../components/Containers"
import { Button } from "../components/UIElements"
import axios from "axios"

const Tabs = ({ ...props }) => {
	const [tab, setTab] = useState(<View />)
	const [active, setActive] = useState(tab.type.name)

	const modifyActive = isActive => {
		setActive(isActive)
	}

	const viewButton = (
		<Button
			onClick={() => {
				setTab(<View />)
				modifyActive(View.name)
			}}
			active={active === View.name}
			controlled
		>
			{View.name}
		</Button>
	)

	const submittedButton = (
		<Button
			onClick={() => {
				setTab(<Submitted />)
				modifyActive(Submitted.name)
			}}
			active={active === Submitted.name}
			controlled
		>
			{Submitted.name}
		</Button>
	)

	return (
		<section>
			<Row id="tabs" gap="1rem" height="3rem" style={{ marginBottom: "1rem" }} {...props}>
				{viewButton}
				{submittedButton}
			</Row>
			{tab}
		</section>
	)
}

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
			<Tabs />
			<SubmissionsToolbar/>
		</div>
	)
}

export default Submissions
