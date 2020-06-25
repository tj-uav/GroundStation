import React, { useState } from "react"
import { dark, darker, blue } from "../theme/Colors"
import styled from "styled-components"

export const Button = ({ active, ...props }) => {
    const [isActive, setActive] = useState(active ?? false)
    return (
        <StyledButton
            className="paragraph"
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

export const Box = ({ content, label, editable, ...props }) => {
    const [value, setValue] = useState(content)

    return (
        <StyledBox>
            {label
                ? <StyledLabel className="paragraph" onInput={e => console.log(e)}>{label}</StyledLabel>
                : ""
            }
            <StyledContent
                onChange={e => { setValue(e.target.value) }}
                className="paragraph" {...props}
                readOnly={!editable ?? true}
                value={value}
            />
        </StyledBox>
    )
}

const StyledBox = styled.div`
    display: flex;
    position: relative;
    flex-direction: column;
`

const StyledContent = styled.textarea`
    border: 0;
    margin: 0;
    padding: 0;
    flex-grow: 1;
    resize: none;
    background: ${dark};
`

const StyledLabel = styled.p`
    margin: 0;
    padding: 0;
    width: 100%;
    height: 2rem;
    color: ${blue};
    position: relative;

    ::after {
        z-index: -1;
        content: "";
        height: 2rem;
        position: absolute;
        background: ${darker};
        left: 0; right: 0; top: 0;
    }
`