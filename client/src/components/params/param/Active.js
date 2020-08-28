import React, { useState } from "react"

import { Row, Column } from "components/Containers"
import { Label } from "components/UIElements"

import Content from "./Content"
import Value from "./Value"
import Submit from "./Submit"

export default ({ data, hook }) => {
	const [active, setActive] = hook
	const [value, setValue] = useState(data.value)
	const toggle = () => setActive(!active)

	return (
		<form onSubmit={e => handleSubmit(e, toggle, value)}>
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
				<Column>
					<Submit type="accept" />
					<Submit type="decline" />
				</Column>
			</Row>
		</form>
	)
}

function handleSubmit(e, toggle, value) {
	e.preventDefault()

	const action = e.nativeEvent.submitter.id
	if (action === "accept") {
		// TODO: apply changes, send over to left hand side
		console.log(value)
		toggle()
	}

	if (action === "decline") {
		toggle()
	}
}
