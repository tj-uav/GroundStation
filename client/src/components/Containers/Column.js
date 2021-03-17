import styled from "styled-components"

export default styled.div`
	display: grid;
	grid-template-columns: 1fr;
	gap: ${props => props.gap ?? "1rem"};
	width: ${props => props.width ?? "100%"};
	height: ${props => props.height ?? "unset"};
	grid-template-rows: repeat(auto-fit, minmax(0, ${props => props.height ?? "auto"}));
`
