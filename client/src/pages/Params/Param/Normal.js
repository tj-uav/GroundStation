import React from "react"
import styled from "styled-components"

import { Row, Column } from "components/Containers"
import { Button } from "components/UIElements"
import { dark, blue } from "theme/Colors"

import Content from "./Content"
import Value from "./Value"
import Submit from "./Submit"

const Normal = ({ data, index, setActiveIndex, setModifiedIndexes, modified = false }) => {
	return (
		<Row height="2rem" columns={`min-content auto ${modified ? "3rem" : "6rem"}`}>
			<Column height="2rem" style={{ overflow: "hidden" }}>
				<Row columns="14rem 6rem">
					<Content padded children={data.name} />
					<Value
						style={{ color: modified ? blue : "inherit" }}
						hook={[data.value, null]}
					/>
				</Row>
			</Column>
			<Column height="2rem">
				<Description description={data.description.replace(/\s/g, "\u00A0")} />
			</Column>
			{modified ? (
				<Submit
					type="decline"
					callback={() => setModifiedIndexes(prev => prev.filter(i => i !== index))}
				/>
			) : (
				<Button careful onClick={() => setActiveIndex(index)}>
					Modify
				</Button>
			)}
		</Row>
	)
}

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

export default Normal
