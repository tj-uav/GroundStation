import React from "react"
import styled from "styled-components"

import { Row, Column } from "components/Containers"
import { Button } from "components/UIElements"
import { dark } from "theme/Colors"

import Content from "./Content"
import Value from "./Value"

const Description = styled(Content).attrs(props => ({
	padded: true,
	children: props.description,
}))`
	white-space: nowrap;
	position: relative;
	::after {
		content: "";
		background: ${dark};
		position: absolute;
		width: 8px;
		bottom: 0;
		right: 0;
		top: 0;
	}
`

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
				<Description description={data.description.replace(/\s/g, "\u00A0")} />
			</Column>
			<Button onClick={() => setActive(!active)}>Modify</Button>
		</Row>
	)
}
