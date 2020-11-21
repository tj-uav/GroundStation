import React, { useState, useEffect, useRef } from "react"
import { Box } from "../UIElements"
import styled from "styled-components"

import {
	Checkboxes,
	Shape,
	Letter,
	Orientation,
	Position,
	EmergentDesc,
} from "./components/toolbarForm"

const initialFormData = {
	shape: undefined,
	shapeColor: undefined,
	letter: "A",
	letterColor: undefined,
	orientation: 0,
	latitude: 0,
	longitude: 0,
	description: "",
}

const SubmissionsToolbar = props => {
	const [formData, setFormDataRaw] = useState(initialFormData)

	const setFormData = (...args) => {
		setFormDataRaw(...args)
	}

	const form = useRef(null)

	function onAccept() {
		if (form.current === null) return
		// any element within the form with a box shadow must be invalid.  Not the best, but will do
		const invalid = form.current.querySelectorAll("[style*=box-shadow]").length > 0
		if (invalid) alert("invalid data!")
		else {
			// handle accept into queue here
			alert(JSON.stringify(formData).replace(/,/g, ",\n"))
			setFormData(initialFormData)
		}
	}

	const updateData = () => {}

	useEffect(() => {
		const tick = setInterval(() => {
			updateData()
		}, 250)
		return () => clearInterval(tick)
	})

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
