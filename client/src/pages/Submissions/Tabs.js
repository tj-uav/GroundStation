import React from "react"
import styled from "styled-components"
import { darker, darkest, darkdark } from "theme/Colors"

import { Box, Checkbox } from "components/UIElements"
import { Row } from "components/Containers"

import { shapes, colors, standard } from "./constants"

import { FixedSizeList } from "react-window"

const ViewRow = ({ checkboxes, info, i, active: [active, setActive], images: [images, setImages], accept, reject, style }) => {
	return (
		<ViewRowContainer style={style} checkboxes={checkboxes} clicked={active === i} onClick={() => setActive(i)}>
			{checkboxes ? (
				<>
					<Checkbox
						style={{ gridArea: "accept" }}
						type="accept"
						callback={() => { accept(i) }}
						title="Submit the ODLC to Interop."
					/>
					<Checkbox
						style={{ gridArea: "decline" }}
						type="decline"
                        callback={() => { reject(i) }}
						title="Reject the ODLC; remove it from the queue."
					/>
				</>
			) : null}
			<img src={"data:image/jpeg;base64," + images[i]} width="100%" height="100%" style={{ gridRow: "span 2", "object-fit": "cover" }} />
			{info.type === standard ? 
			    <>
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
				</>
			:
				<Box style={{ "grid-row": "1 / 3" }} content={info.description} label="Description" line="250%" />
			}
		</ViewRowContainer>
	)
}

const ViewRowContainer = styled.div`
	--padding: 0.5rem;

	display: grid;
	height: 10rem;
	gap: 1rem;
	grid-auto-flow: column;
	grid-template-columns: ${props => props.checkboxes ? "3rem 9rem auto" : "9rem calc(100% - 10rem)"};
	grid-template-rows: 1fr 1fr;
	grid-template-areas:
		"accept image upper"
		"decline image lower";
	background: ${({ clicked }) => (clicked ? "#00000015" : darker)};
	padding-right: ${({ clicked }) => (clicked ? "var(--padding)" : "0px")};
	padding-left: ${({ clicked }) => (clicked ? "var(--padding)" : "0px")};
	padding-bottom: 0.3em;
	padding-top: 0.3em;
	transition: padding 0.1s cubic-bezier(0.1, 0.05, 0.46, 0.01);
`

const View = ({ data: [data, setData], active: [active, setActive], images: [images, setImages], accept, reject }) => {
	if (data.length !== 0) {
		let s = data.findIndex(o => o.status === null)
		if (active !== undefined ? data[active]?.status !== null : true) {
			setActive(s === -1 ? undefined : s)
		}
	}

	let view = data.map((o, i) => ({ ...o, i: i })).filter(o => o.status === null)

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "calc(100vh - 9.5rem)",
			}}
		>
			<Container height={1137} itemCount={view.length} itemSize={180} width={592}>
				{({ index, style }) => {
					return (
						<ViewRow
							style={style}
							checkboxes={true}
							i={view[index].i}
							info={view[index]}
							active={[active, setActive]}
							images={[images, setImages]}
							accept={accept}
							reject={reject}
						/>
					)
				}}
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

	let submitted = data.map((o, i) => ({ ...o, i: i })).filter(o => o.status === "submitted")

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "calc(100vh - 9.5rem)",
			}}
		>
			<Container height={1137} itemCount={submitted.length} itemSize={180} width={592}>
				{({ index, style }) => {
					return (
						<ViewRow
							style={style}
							checkboxes={false}
							i={submitted[index].i}
							info={submitted[index]}
							active={[active, setActive]}
							images={[images, setImages]}
							accept={accept}
							reject={reject}
						/>
					)
				}}
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

	let rejected = data.map((o, i) => ({ ...o, i: i })).filter(o => o.status === false)

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "calc(100vh - 9.5rem)",
			}}
		>
			<Container height={1137} itemCount={rejected.length} itemSize={180} width={592}>
				{({ index, style }) => {
					return (
						<ViewRow
							style={style}
							checkboxes={true}
							i={rejected[index].i}
							info={rejected[index]}
							active={[active, setActive]}
							images={[images, setImages]}
							accept={accept}
							reject={reject}
						/>
					)
				}}
			</Container>
		</div>
	)
}

const Container = styled(FixedSizeList).attrs({
	gap: "2rem",
})`
	overflow-y: auto;
	margin-top: -0.5em;
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
