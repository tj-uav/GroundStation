import React, { useState } from "react"

import { Row, Column } from "components/Containers"
import { Label } from "components/UIElements"

import Content from "./Content"
import Value from "./Value"
import Submit from "./Submit"

import { useParameters } from "../../Params"

const Active = ({ data, index, setActiveIndex, setModifiedIndexes }) => {
	const [value, setValue] = useState(data.value)
	const deactivate = () => setActiveIndex(-1)
	const params = useParameters()

	return (
		<form onSubmit={e => handleSubmit(e, deactivate)}>
			<Row style={{ maxHeight: "7rem" }} columns="min-content auto 6rem">
				<div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
					<Row height="2rem" columns="14rem 6rem">
						<Content padded children={data.name} />
						<Value editable hook={[value, setValue]} />
					</Row>
					<Row style={{ marginBottom: "-1rem" }}>
						<Label>Options</Label>
					</Row>
					<Row>
						<Content padded children={data.options ?? "no options defined."} />
					</Row>
				</div>
				<Column style={{ display: "flex", height: "100%", overflow: "scroll" }}>
					<Content padded children={data.description} style={{ overflow: "scroll" }} />
				</Column>
				<aside
					style={{
						display: "flex",
						flexDirection: "column",
						rowGap: "1rem",
						height: "100%",
					}}
				>
					<Submit
						type="accept"
						callback={() => {
							params[index] = {
								...data,
								value,
							}
							setModifiedIndexes(prev => {
								if (!prev.includes(index)) return [...prev, index]
								else return prev
							})
						}}
					/>
					<Submit type="decline" />
				</aside>
			</Row>
		</form>
	)
}

function handleSubmit(e, deactivate) {
	e.preventDefault()
	deactivate()
}

export default Active
