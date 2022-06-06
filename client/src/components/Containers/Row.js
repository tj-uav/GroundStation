import styled from "styled-components"

export default styled.div`
	display: grid;
	grid-template-rows: ${props => props.height ?? "1fr"};
	gap: ${props => props.gap ?? "1rem"};
	width: ${props => props.width ?? "100%"};
	height: ${props => props.height ?? "unset"};
	grid-template-columns: ${props => props.columns ?? "repeat(auto-fit, minmax(0, 1fr))"};
`
