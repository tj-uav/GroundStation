import React, { useState, useEffect, useRef } from "react"
import { useHistory } from "react-router-dom"
import styled from "styled-components"

import { Box, Button } from "components/UIElements"

import {
	Checkboxes,
	Shape,
	Letter,
	Orientation,
	Position,
	EmergentDesc,
} from "./components/toolbarForm"

const SubmissionsToolbar = ({ data: [data, setData], active: [active, setActive] }) => {
	const initialFormData = data.filter(v => !v.submitted)[active]
	const [formData, setFormData] = useState(initialFormData)
	const form = useRef(null)
	const history = useHistory()

	useEffect(() => {
		if (active !== undefined) setFormData(data.filter(v => !v.submitted)[active])
	}, [active])

	function onAccept() {
		if (form.current === null) return
		// any element within the form with a box shadow must be invalid.  Not the best, but will do
		const invalid = form.current.querySelectorAll("[style*=box-shadow]").length > 0
		if (invalid) alert("invalid data!")
		else {
			// if valid, replace the active submission with the form's data
			setData(
				data
					.filter(v => !v.submitted)
					.map((v, i) => (i == active ? formData : v))
					.concat(data.filter(v => v.submitted))
			)
		}
	}

	if (active === undefined || formData === undefined) {
		const centered = {
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			height: "calc(100vh - 9.5rem)",
		}
		const empty = data.filter(v => !v.submitted).length === 0
		return (
			<div style={centered}>
				<Button
					style={{ padding: "1rem 3rem" }}
					onClick={() => (empty ? history.push("/submissions/submitted") : setActive(0))}
					careful={!empty}
				>
					{empty && "View submitted"}
				</Button>
			</div>
		)
	}

	return (
		<Container>
			<Box />
			<ContentContainer ref={form}>
				<Checkboxes accept={onAccept} decline={() => setFormData(initialFormData)} />

				<Shape.Labels />
				<Shape.Inputs hook={[formData, setFormData]} />

				<Letter.Labels />
				<Letter.Inputs hook={[formData, setFormData]} />

				<Orientation hook={[formData, setFormData]} />
				<Position hook={[formData, setFormData]} />
				<EmergentDesc hook={[formData, setFormData]} />
			</ContentContainer>
		</Container>
	)
}

const ContentContainer = styled.div`
	display: flex;
	flex-direction: column;
	height: calc(100vh - 9.5rem);
`

const Container = styled.div`
	display: grid;
	gap: 1rem;
	grid-template-columns: 29rem auto;
	grid-template-rows: 29rem auto;
`

export default SubmissionsToolbar
