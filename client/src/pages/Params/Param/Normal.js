import React from "react"
import styled from "styled-components"

import { Row, Column } from "components/Containers"
import { Button } from "components/UIElements"
import { dark, blue } from "theme/Colors"

import Content from "./Content"
import Value from "./Value"
import Submit from "./Submit"

import { useParameters } from "../../Params"

const Normal = ({ listRef, style, height, data, index, setActiveIndex, setModifiedIndexes, parametersSave, modified = false }) => {
	const [parameters, setParameters] = useParameters()

	return (
		<Row style={style} height={height ?? "2rem"} columns={`min-content ${modified ? "3rem" : "6rem"} auto`}>
			<Column height="2rem" style={{ overflow: "hidden" }}>
				<Row height="2rem" columns={modified ? "11.5rem 5rem 5rem" : "11.5rem 5rem"}>
					<Content padded children={data.name} />
					<Value
						style={{ color: modified ? blue : "inherit" }}
						hook={[data.value, null]}
					/>
					{modified ? (
						<Value
							style={{ color: modified ? blue : "inherit" }}
							hook={[data.old, null]}
						/>
					) : null}
				</Row>
			</Column>
			{modified ? (
				<Submit
					type="decline"
					callback={() => {
						setModifiedIndexes(prev => prev.filter(i => i !== index))
						parameters[index] = parametersSave[index]
					}}
				/>
			) : (
				<Button careful style={{ height: "94%" }} onClick={() => {
					setActiveIndex(index)
					listRef.current.resetAfterIndex(0);
				}}>
					Modify
				</Button>
			)}
			<Column height="2rem">
				<Description DisplayName={data.DisplayName} description={data.Description} />
			</Column>
		</Row>
	)
}

const Description = styled(Content).attrs(props => ({
	padded: true,
	children:
		<>
			<b>{props.DisplayName}</b>{props.DisplayName ? ". " : ""}{props.description}
		</>,
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
