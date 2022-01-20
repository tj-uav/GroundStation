import React, { useState, useEffect } from "react"
import { Button, Box, Label } from "components/UIElements"
import { Row, Column } from "components/Containers"

const Logs = () => {

	const updateData = () => {

	}

	useEffect(() => {
		const tick = setInterval(() => {
			updateData()
		}, 250)
		return () => clearInterval(tick)
	})

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "calc(100vh - 9.5rem)",
			}}
		>
			<Box label="Console + Error Messages" error />
		</div>
	)
}

export default Logs
