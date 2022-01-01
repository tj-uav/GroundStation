import React from "react"
import styled from "styled-components"
import { dark, darker, darkest, darkdark } from "theme/Colors"

import { Box, Checkbox } from "components/UIElements"
import { Row, Column } from "components/Containers"

import { shapes, colors, standard } from "./constants"

const ViewRow = ({ checkboxes, info, number, active: [active, setActive], data: [data, setData], images: [images, setImages], accept, reject }) => {
	return (
		<ViewRowContainer checkboxes={checkboxes} clicked={active === number} onClick={() => setActive(number)}>
			{checkboxes ? (
				<>
					<Checkbox
						style={{ gridArea: "accept" }}
						type="accept"
						callback={() => { accept(number) }}
					/>
					<Checkbox
						style={{ gridArea: "decline" }}
						type="decline"
                        callback={() => { reject(number) }}
					/>
				</>
			) : null}
			<img src={"data:image/jpeg;base64," + images[active]} width="100%" height="100%" style={{ gridRow: "span 2", "object-fit": "cover" }} />
			<Row height="4rem">
				<Box content={shapes[info.shape-1]} label="Shape" line="250%" />
				<Box content={info.alphanumeric} label="Letter" line="250%" />
				<Box content={info.orientation} label="Orientation" line="250%" />
			</Row>
			<Row height="4rem">
				<Box content={colors[info.shape_color-1]} label="Shape Color" line="250%" />
				<Box content={colors[info.alphanumeric_color-1]} label="Letter Color" line="250%" />
				<Box
					content={`${Math.round(info.latitude)} / ${Math.round(info.longitude)}`}
					label="Position"
					line="250%"
				/>
			</Row>
		</ViewRowContainer>
	)
}

const ViewRowContainer = styled.div`
	--padding: 0.5rem;

	display: grid;
	height: calc(9rem + 2 * var(--padding));
	gap: 1rem;
	grid-auto-flow: column;
	grid-template-columns: ${props => props.checkboxes ? "3rem 9rem auto" : "9rem calc(100% - 10rem)"};
	grid-template-rows: 1fr 1fr;
	grid-template-areas:
		"accept image upper"
		"decline image lower";
	background: ${({ clicked }) => (clicked ? "#00000015" : darker)};
	padding: ${({ clicked }) => (clicked ? "var(--padding)" : "0px")};
	transition: padding 0.1s cubic-bezier(0.1, 0.05, 0.46, 0.01);
`

const View = ({ data: [data, setData], active: [active, setActive], images: [images, setImages], accept, reject }) => {
	if (data.length !== 0) {
		let s = data.findIndex(o => o.status === null)
		if (active !== undefined ? data[active]?.status !== null : true) {
			setActive(s === -1 ? undefined : s)
		}
	}

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "calc(100vh - 9.5rem)",
			}}
		>
			<Container>
				{data.map((row, i) => (
					row.status === null ? (
						<ViewRow
                            checkboxes={true}
							key={i}
							number={i}
							info={row}
							active={[active, setActive]}
							data={[data, setData]}
							images={[images, setImages]}
							accept={accept}
							reject={reject}
						/>
					) : (null)
				))}
			</Container>
		</div>
	)
}

const Submitted = ({ data: [data, setData], active: [active, setActive], images: [images, setImages], accept, reject }) => {
	if (data.length !== 0) {
		let s = data.findIndex(o => o.status === "submitted")
		if (active !== undefined ? data[active].status !== "submitted" : true) {
			setActive(s === -1 ? undefined : s)
		}
	}

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "calc(100vh - 9.5rem)",
			}}
		>
			<Container>
				{data.map((row, i) => (
					row.status === "submitted" ? (
						<ViewRow
							key={i}
							number={i}
							info={row}
							active={[active, setActive]}
							data={[data, setData]}
							images={[images, setImages]}
						/>
					) : (null)
				))}
			</Container>
		</div>
	)
}

const Rejected = ({ data: [data, setData], active: [active, setActive], images: [images, setImages], accept, reject }) => {
	if (data.length !== 0) {
		let s = data.findIndex(o => o.status === false)
		if (active !== undefined ? data[active].status !== false : true) {
			setActive(s === -1 ? undefined : s)
		}
	}

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "calc(100vh - 9.5rem)",
			}}
		>
			<Container>
				{data.map((row, i) => (
					row.status === false ? (
						<ViewRow
                            checkboxes={true}
							key={i}
							number={i}
							info={row}
							active={[active, setActive]}
							data={[data, setData]}
							images={[images, setImages]}
							accept={accept}
							reject={reject}
						/>
					) : (null)
				))}
			</Container>
		</div>
	)
}

const Container = styled(Column).attrs({
	height: "unset",
	gap: "2rem",
})`
	overflow-y: auto;
	margin-bottom: 2rem;

	&::-webkit-scrollbar {
		width: 20px;
	}
	&::-webkit-scrollbar-thumb {
		background: ${darkest};
		border: 6px solid rgba(0, 0, 0, 0);
		border-radius: 1000px;
		background-clip: padding-box;
		width: 8px;
	}
	&::-webkit-scrollbar-thumb:hover {
		background: ${darkdark};
		background-clip: padding-box;
		trasition: 0.5s;
	}
	&::-webkit-scrollbar-track {
		border: 1px red;
	}
`

export { View, Submitted, Rejected }