import React from "react"
import styled from "styled-components"

const CheckboxList = props => {
    return (
        <div onChange={props.onChange}>
            {props.children}
        </div>
    )
}

const Option = props => {
    return (
        <StyledOption>
            <StyledCheckbox checked={props.checked} color={props.color} type="checkbox" id={props.id ?? props.value} value={props.value} name={props.name} />
            {props.children}
        </StyledOption>
    )
}

const StyledOption = styled.div`
    vertical-align: middle;
    font-family: Poppins, sans-serif;
`

const StyledCheckbox = styled.input`
    margin-right: 0.4rem;
    margin-left: 0.4rem;
    appearance: none;
    height: 1rem;
    width: 1rem;
    border-radius: 20%;
    padding: 0;
    background: #f1ebe5;
    border: 2px solid #5a5755;
    vertical-align: -2px;

    &:checked {
        border: 4px solid ${props => props.color ?? "#629dee"};
        transition: 0.15s;
    }

    &:not(:checked) {
        transition: 0.1s;
    }
`

CheckboxList.Option = Option
export default CheckboxList