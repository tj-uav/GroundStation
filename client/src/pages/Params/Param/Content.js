import styled from "styled-components"

import { dark } from "theme/Colors"

export default styled.p.attrs({
	className: "paragraph",
})`
	text-align: ${({ align }) => align ?? "left"};
	background-color: ${dark};
	padding: 0.25rem 0.5rem;
	overflow: hidden;
	width: 100%;
`
