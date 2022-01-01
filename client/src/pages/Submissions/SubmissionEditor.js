import React, { useState, useEffect, useRef } from "react"
import styled from "styled-components"
import { dark } from "theme/Colors"

import { Checkboxes, Shape, Letter, Orientation, Position, EmergentDesc } from "./toolbarForm"

import { standard } from "./constants"

const SubmissionEditor = ({ data: [data, setData], active: [active, setActive], images: [images, setImages], ...props }) => {
	const [formData, setFormData] = useState(data[active])
	const [width, setWidth] = useState(window.innerWidth)
	const form = useRef(null)

	useEffect(() => {
		const setWidthCallback = () => setWidth(window.innerWidth)
		window.addEventListener("resize", setWidthCallback);
		return (() => {
			window.removeEventListener("resize", setWidthCallback)
		})
	}, [])

	useEffect(() => {
		setFormData(data[active])
	}, [data, active])

	function onAccept() {
		if (form.current === null) return
		// any element within the form with a box shadow must be invalid.  Not the best, but will do
		const invalid = form.current.querySelectorAll("[style*=box-shadow]").length > 0
		if (invalid) {
			alert("invalid data!")
		} else {
			props.accept(active, formData)
		}
	}

	const edit = () => {
		if (form.current === null) return
		props.edit(active, formData)
	}

	const reject = () => {
		if (form.current === null) return
		props.reject(active)
	}

	if (active === undefined || formData === undefined) {
		const centered = {
			"background-color": dark,
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			height: "calc(100vh - 9.5rem)",
		}
		return (
			<div style={centered} />
		)
	}

	const _break = [1330, 1120]
	return (
		<Container break={_break} width={width}>
			<img styles={"object-fit: cover;"} width="100%" height="100%" src={"data:image/jpeg;base64," + images[active]} />
			{(width <= _break[0] && width > _break[1]) ?
				<Checkboxes vertical={true} accept={onAccept} decline={reject} disabled={data[active].status === "submitted"} />
				: null
			}
			<ContentContainer ref={form}>
				{(formData ? formData.type : null) == standard ? (
					<>
					{(width <= _break[1]) ?
						<Checkboxes accept={onAccept} save={edit} decline={reject} disabled={data[active].status === "submitted"} />
						: null
					}
					<Shape.Labels />
					<Shape.Inputs hook={[formData, setFormData]} />

					<Letter.Labels />
					<Letter.Inputs hook={[formData, setFormData]} />

					<Orientation hook={[formData, setFormData]} />
					<Position hook={[formData, setFormData]} />
					</>
				) : (
					<EmergentDesc hook={[formData, setFormData]} />
					)}
			</ContentContainer>
			{(width > _break[0]) ?
				<Checkboxes accept={onAccept} save={edit} decline={reject} disabled={data[active].status === "submitted"} />
				: null
			}
		</Container>
	)
}

const ContentContainer = styled.div`
	display: flex;
	border: 5px black;
	flex-direction: column;
	height: calc(100vh - 9.5rem);
`

const Container = styled.div`
	display: grid;
	gap: 1rem;
	grid-template-columns: ${props => {return props.width > props.break[0] ? "25rem auto" : (props.width > props.break[1] ? "25rem auto" : "auto")}};
	grid-template-rows: ${props => {return props.width > props.break[0] ?  "25rem auto" : (props.width > props.break[1] ? "25rem auto" : "auto auto")}};
`

export default SubmissionEditor
