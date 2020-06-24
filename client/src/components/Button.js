import React, { useState } from "react"
import { dark, blue } from "../components/Colors"
import styled from "styled-components"

export const Button = ({ active, ...props }) => {
    const [isActive, setActive] = useState(active ?? false)
    return (
        <StyledButton
            active={isActive}
            onClick={props.onClick ?? (e => { setActive(!isActive); e.persist() })}
            {...props}
        />
    )
}

const StyledButton = styled.a`
    position: relative;
    box-sizing: border-box;
    background: ${props => props.active ? blue : dark};
    color: ${props => props.active ? dark : blue} !important;
    text-decoration: none !important;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;

    ::after {
        content: "";
        position: absolute;
        left: 0; right: 0; bottom: 0;
        height: 0.25rem;
        background: ${blue};
        transition: height 0.1s ease;
    }

    &:hover::after {
        content: "";
        position: absolute;
        left: 0; right: 0; bottom: 0;
        height: 0.5rem;
        background: ${blue};
    }
`