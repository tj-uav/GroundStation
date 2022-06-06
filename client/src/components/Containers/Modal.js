import React, { useEffect, useState } from "react"
import ReactDOM from "react-dom"
import { Checkbox } from "components/UIElements"
import styled from "styled-components"
import { darker } from "theme/Colors"

export const Modal = props => {
    const [node] = useState(() => {
        return document.createElement("div")
    })
    node.style.zIndex = 1050;
    node.style.position = "relative"
    node.style.display = "block"
    useEffect(() => {
        document.body.appendChild(node)
        return () => {
            document.body.removeChild(node)
        }
    }, [])

    return (
        <div>
            { props.open ? ReactDOM.createPortal(
                <div>
                    <ModalBox>
                        <ModalDialog onClick={() => {
                            if (props.setOpen) {
                                props.setOpen(false)
                            }
                        }}>
                            <ModalContent onClick={(e) => {
                                e.stopPropagation();
                            }}>
                                { props.children }
                            </ModalContent>
                        </ModalDialog>
                    </ModalBox>
                </div>
            , node) : null }
        </div>
    )
}

export const ModalCheckboxes = (props) => {
    return (
        <CheckboxDiv1>
            <CheckboxDiv2>
                <Checkbox callback={() => {
                    if (props.setOpen) {
                        props.setOpen(false)
                    }
                    if (props.decline) {
                        props.decline()
                    }
                }} type="decline" style={{ "margin-left": "auto", "margin-right": "0.5rem", "height": "4rem", "width": "8rem" }}></Checkbox>
                <Checkbox callback={() => {
                    if (props.setOpen) {
                        props.setOpen(false)
                    }
                    if (props.accept) {
                        props.accept()
                    }
                }} type="accept" style={{ "margin-right": "0", "height": "4rem", "width": "8rem" }}></Checkbox>
            </CheckboxDiv2>
        </CheckboxDiv1>
    )
}

const CheckboxDiv2 = styled.div`
    display: flex;
    margin-top: auto;
    flex-direction: row;
    margin-right: 0;
    margin-left: auto;
`

const CheckboxDiv1 = styled.div`
    display: flex;
    flex-grow: 1;
    flex-shrink: 1;
    flex-basis: auto;
`

export const ModalHeader = styled.div`
    font-size: 3em;
    font-family: Montserrat;
    padding-bottom: 0.3rem;
    border-style: solid;
    border-width: 0 0 1px 0;
    margin-bottom: 2rem;
`

export const ModalBody = styled.div`
    font-family: Poppins;
`

const ModalContent = styled.div`
    display: flex;
    flex-flow: column;
    color: black;
    background: #ddcfbb;
    width: 100%;
    height: 100%;
    padding: 2em;
    min-width: 800px;
    min-height: 500px;
    max-width: 800px;
    max-height: 750px;
    border-radius: 0.25rem;
`

const ModalDialog = styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    z-index: 1055;
    display: flex;
    padding: 5em;
`

const ModalBox = styled.div`
    top: 0;
    left: 0;
    position: fixed;
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    z-index: 1050;
    background: rgba(0, 0, 0, 0.5);
`