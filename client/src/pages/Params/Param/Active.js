import React, { useEffect, useState } from "react"

import { Row, Column } from "components/Containers"
import { Label } from "components/UIElements"

import Content from "./Content"
import Value from "./Value"
import Submit from "./Submit"

import { useParameters } from "../../Params"

const Active = ({ listRef, style, data, index, setActiveIndex, setModifiedIndexes, setActiveSize, parametersSave }) => {
	const [value, setValue] = useState(data.value)
	const deactivate = () => setActiveIndex(-1)
	const [params, setParameters] = useParameters()
	const root = React.useRef()

	useEffect(() => {
		setActiveSize(root.current.getBoundingClientRect().height)
	}, [root.current?.getBoundingClientRect().width])

	return (
		<form onSubmit={e => handleSubmit(e, deactivate)}>
			<Row ref={root} style={{ ...style, height: undefined }} columns="min-content 6rem auto">
				<div style={{ display: "flex", flexDirection: "column", gap: "1rem", height: "95%" }}>
					<Row height="2rem" columns="11.5rem 5rem">
						<Content padded children={data.name} />
						<Value editable hook={[value, setValue]} />
					</Row>
					<Row style={{ marginBottom: "-1.15rem" }}>
						<Label>Options</Label>
					</Row>
					<Row>
						<Content padded children={data.options ?? "no options defined."} />
					</Row>
				</div>
				<aside
					style={{
						display: "flex",
						flexDirection: "column",
						rowGap: "1rem",
						paddingBottom: "2px"
					}}
				>
					<Submit
						type="accept"
						callback={() => {
							if (value != parametersSave[index].value) {
								params[index] = {
									...data,
									value,
								}
								setParameters(params.slice())
								setModifiedIndexes(prev => {
									if (!prev.includes(index)) return [...prev, index]
									else return prev
								})
							}
							setActiveIndex(-1)
							listRef.current.resetAfterIndex(0);
						}}
					/>
					<Submit type="decline" callback={() => {
						listRef.current.resetAfterIndex(0);
						setActiveIndex(-1)
					}} />
				</aside>
				<Column style={{ display: "flex", paddingBottom: "2px" }}>
					<Content>
						<b>{data.DisplayName}</b>{data.DisplayName ? ". " : ""}{data.Description}
					</Content>
				</Column>
			</Row>
		</form>
	)
}

function handleSubmit(e, deactivate) {
	e.preventDefault()
	deactivate()
}

export default Active
