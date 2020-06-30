import React, { useState, useEffect } from 'react';
import { Button, Box } from "../UIElements"
import { Row, Column } from "../Containers"

const Quick = props => {
    const [altitude, setAltitude] = useState(0)
    const [orientation, setOrientation] = useState(0)
    const [groundSpeed, setGroundSpeed] = useState(0)
    const [airspeed, setAirspeed] = useState(0)
    const [text, setText] = useState(0)
    const [battery, setBattery] = useState(0)
    const [throttle, setThrottle] = useState(0)
    const [latLong, setLatLong] = useState(0)

    const updateData = () => {
        setAltitude(Math.floor(Math.random() * 200) + 100)
        setOrientation(Math.floor(Math.random() * 360))
        setGroundSpeed(Math.floor(Math.random() * 50) + 25)
        setAirspeed(Math.floor(Math.random() * 50) + 25)
        setText("N/A")
        setBattery(Math.floor(Math.random() * 100))
        setThrottle(Math.floor(Math.random() * 100))
        setLatLong([Math.floor(Math.random() * 360), Math.floor(Math.random() * 360)])
    }

    useEffect(() => {
        const tick = setInterval(() => {
            updateData()
        }, 250)
        return () => clearInterval(tick)
    })

    return (
        <div style={{ padding: "15px" }}>
            <Row gap="1rem" height="3rem" width="40rem">
                <Button>Quick</Button>
                <Button>All</Button>
                <Button>Actions</Button>
                <Button>Servo</Button>
            </Row>
            <div style={{ height: "15px" }}></div>
            <Row gap="1rem" height="3rem" width="40rem" >
                <Column gap="1rem" height="30rem" width="1rem">
                    <p style={{ color: "#346CBC" }}>Servo</p>
                    <Box content="0" />
                    <Box content="0" />
                    <Box content="0" />
                    <Box content="0" />
                    <Box content="0" />
                    <Box content="0" />
                    <Box content="0" />
                    <Box content="0" />
                    <Box content="0" />
                    <Box content="0" />
                </Column>
                <Column gap="1rem" height="30rem" width="3rem">
                    <p style={{ color: "#346CBC" }}>Function</p>
                    <Button>Low</Button>
                    <Button>Low</Button>
                    <Button>Low</Button>
                    <Button>Low</Button>
                    <Button>Low</Button>
                    <Button>Low</Button>
                    <Button>Low</Button>
                    <Button>Low</Button>
                    <Button>Low</Button>
                    <Button>Low</Button>
                </Column>
                <Column gap="1rem" height="30rem" width="3rem">
                    <p style={{ color: "#346CBC" }}></p>
                    <Button>Mid</Button>
                    <Button>Mid</Button>
                    <Button>Mid</Button>
                    <Button>Mid</Button>
                    <Button>Mid</Button>
                    <Button>Mid</Button>
                    <Button>Mid</Button>
                    <Button>Mid</Button>
                    <Button>Mid</Button>
                    <Button>Mid</Button>
                </Column>
                <Column gap="1rem" height="30rem" width="3rem">
                    <p style={{ color: "#346CBC" }}></p>
                    <Button>High</Button>
                    <Button>High</Button>
                    <Button>High</Button>
                    <Button>High</Button>
                    <Button>High</Button>
                    <Button>High</Button>
                    <Button>High</Button>
                    <Button>High</Button>
                    <Button>High</Button>
                    <Button>High</Button>
                </Column>
                <Column gap="1rem" height="30rem" width="3rem">
                    <p style={{ color: "#346CBC" }}></p>
                    <Button>Toggle</Button>
                    <Button>Toggle</Button>
                    <Button>Toggle</Button>
                    <Button>Toggle</Button>
                    <Button>Toggle</Button>
                    <Button>Toggle</Button>
                    <Button>Toggle</Button>
                    <Button>Toggle</Button>
                    <Button>Toggle</Button>
                    <Button>Toggle</Button>
                </Column>
                <Column gap="1rem" height="30rem" width="1rem">
                    <p style={{ color: "#346CBC" }}>Port(s)</p>
                    <Box content="1110" />
                    <Box content="1110" />
                    <Box content="1110" />
                    <Box content="1110" />
                    <Box content="1110" />
                    <Box content="1110" />
                    <Box content="1110" />
                    <Box content="1110" />
                    <Box content="1110" />
                    <Box content="1110" />
                </Column>
                <Column gap="1rem" height="30rem" width="1rem">
                    <p style={{ color: "#346CBC" }}></p>
                    <Box content="1900" />
                    <Box content="1900" />
                    <Box content="1900" />
                    <Box content="1900" />
                    <Box content="1900" />
                    <Box content="1900" />
                    <Box content="1900" />
                    <Box content="1900" />
                    <Box content="1900" />
                    <Box content="1900" />
                </Column>
            </Row>
        </div>
    );
}

export default Quick;