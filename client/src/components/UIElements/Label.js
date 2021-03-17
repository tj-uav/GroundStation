import styled from "styled-components"

import { red, blue } from "theme/Colors"

export default styled.p`
	line-height: initial;
	color: ${props => (props.error ? red : blue)};
	grid-row: ${props => (props.rows ? `span ${props.rows}` : "initial")};
	grid-column: ${props => (props.columns ? `span ${props.columns}` : "initial")};
`
