import React from "react"
import styled from "styled-components"
import "./RadioList.css"

const RadioList = props => {
    let children = props.children.map(c => React.cloneElement(c, { name: props.name }));
    return (
        <div onChange={props.onChange}>
            {children}
        </div>
    )
}

const Option = props => {
    return (
        <StyledOption>
            <input className="radio" styles="background: purple;" type="radio" id={props.id ?? props.value} value={props.value} name={props.name} />
            {props.children}
        </StyledOption>
    )
}

const StyledOption = styled.div`
    vertical-align: middle;
    font-family: Poppins, sans-serif;
`

RadioList.Option = Option
export default RadioList