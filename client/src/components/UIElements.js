import React, { useState } from "react"
import { dark, darker, blue } from "../theme/Colors"
import styled from "styled-components"

export const Button = ({ active, controlled, ...props }) => {
    const [isActive, setActive] = useState(active ?? false)

    return (
        <StyledButton
            className="paragraph"
            active={controlled ? active : isActive}
            onMouseDown={() => {
                if (!controlled)
                    setActive(true)
            }}
            onMouseUp={() => {
                if (!controlled)
                    setActive(false)
            }}
            {...props}
        />
    )
}

const StyledButton = styled.a`
    position: relative;
    box-sizing: border-box;
    background: ${props => props.active ? blue : dark};
    transition: background-color 0.1s ease;
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
        <StyledBox {...props}>
            {label
                ? <StyledBoxLabel className="paragraph" onInput={e => console.log(e)} {...props}>{label}</StyledBoxLabel>
                : ""
            }
            <StyledBoxContent
                onChange={e => { setValue(e.target.value) }}
                className="paragraph" {...props}
                readOnly={!editable ?? true}
                value={value}
            />
        </StyledBox>
    )
}

const StyledBox = styled.div`
    width: 100%;
    display: flex;
    position: relative;
    flex-direction: column;
`

const StyledBoxContent = styled.textarea`
    border: 0;
    margin: 0;
    padding: 0;
    flex-grow: 1;
    resize: none;
    text-align: center;
    background: ${dark};
`

const StyledBoxLabel = styled.p`
    margin: 0;
    padding: 0;
    width: ${props => props.style?.width ?? "100%"};
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

export const Label = ({ children, ...props }) => {
    return (
        <StyledLabel
            {...props}
            className={`paragraph ${props.className}`}
        >
            {children}
        </StyledLabel>
    )
}

const StyledLabel = styled.p`
    color: ${blue};
    grid-row: ${props => props.rows ? `span ${props.rows}` : "initial"};
    grid-column: ${props => props.columns ? `span ${props.columns}` : "initial"};
`