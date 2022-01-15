import React, { useState, useEffect, useRef } from "react"
import styled from "styled-components"
import { dark } from "theme/Colors"

import { Checkboxes, Shape, Letter, Orientation, Position, EmergentDesc, Toolbar } from "./toolbarForm"

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

	const accept = () => {
		if (form.current === null) return
		// any element within the form with a box shadow must be invalid. Not the best, but will do
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

	const odlcUpload = (d) => {
		let i = [...images]
		i[active] = d
		setImages(i)
	}

	const _break = [1330, 1120]
	return (
		<Container break={_break} width={width}>
			<StyledImage width="100%" height="100%" src={"data:image/jpeg;base64," + images[active]} />
			{(width <= _break[0] && width > _break[1]) ? // vertical checkboxes
				<div>
					<StyledVerticalContainer>
						<Checkboxes vertical={true} accept={accept} decline={reject} disabled={data[active].status === "submitted"} />
					</StyledVerticalContainer>
				</div>
				: null
			}
			<ContentContainer ref={form}>
				{(formData ? formData.type : null) == standard ? (
					<>
						{(width <= _break[1]) ?
							<div> { /* checkboxes and data under image */ }
								<Checkboxes accept={accept} save={edit} decline={reject} disabled={data[active].status === "submitted"} />
								<Toolbar formData={[formData, setFormData]} image={images[active]} i={active} setImage={odlcUpload} />
							</div>
							: null
						}
						{(width <= _break[0] && width > _break[1]) ? // vertical checkboxes
							<Toolbar formData={[formData, setFormData]} image={images[active]} i={active} setImage={odlcUpload} />
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
					<>
						{ width <= _break[1] ?
							<Checkboxes accept={accept} save={edit} decline={reject} disabled={data[active].status === "submitted"} />
							: null
						}
						{ width <= _break[0] ?
							<Toolbar formData={[formData, setFormData]} image={images[active]} i={active} setImage={odlcUpload} />
							: null
						}
						<EmergentDesc hook={[formData, setFormData]} />
					</>
				)}
			</ContentContainer>
			{(width > _break[0]) ? // data to the right
				<div>
					<Checkboxes accept={accept} save={edit} decline={reject} disabled={data[active].status === "submitted"} />
					<Toolbar formData={[formData, setFormData]} image={images[active]} setImage={odlcUpload} i={active} />
				</div>
				: null
			}
		</Container>
	)
}

const StyledImage = styled.img`
	object-fit: contain;
`

const StyledVerticalContainer = styled.div`
	display: flex;
	height: 100%;
`

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
