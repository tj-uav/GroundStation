import React, { useState, useEffect } from 'react';
import { Button, Box } from "../components/UIElements"
import { Row, Column } from "../components/Containers"

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
        <div style={{padding: "15px"}}>
            <Row gap="1rem" height="3rem" width="40rem">
                <Button>Quick</Button>
                <Button>All</Button>
                <Button>Actions</Button>
                <Button>Servo</Button>
            </Row>
            <br /><br />
            <Row gap="1rem" height="3rem" width="40rem">
                <Column gap="1rem" height="30rem" width="20rem">
                    <Box label="Altitude" content={altitude} />
                    <Box label="Ground Speed" content={groundSpeed} />
                    <Box label="Text" content={text} />
                    <Box label="Throttle" content={throttle} />
                </Column>
                <Column gap="1rem" height="30rem" width="20rem">
                    <Box label="Orientation" content={orientation} />
                    <Box label="Airspeed" content={airspeed} />
                    <Box label="Battery" content={battery} />
                    <Box label="Latitude / Longitude" content={latLong} />
                </Column>
            </Row>
        </div>
    );
}

export default Quick;