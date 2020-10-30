import React from "react"

import { Row, Column } from "components/Containers"
import { Button } from "components/UIElements"

import Content from "./Content"
import Value from "./Value"

export default ({ data, hook, ...props }) => {
	const [active, setActive] = hook

	return (
		<Row {...props} height="2rem" columns="min-content auto 6rem">
			<Column height="2rem" style={{ overflow: "hidden" }}>
				<Row columns="14rem 6rem">
					<Content padded children={data.name} />
					<Value hook={[data.value, null]} />
				</Row>
			</Column>
			<Column height="2rem">
				<Content padded children={data.description} />
			</Column>
			<Button onClick={() => setActive(!active)}>Modify</Button>
		</Row>
	)
}
