import React, { useState, useEffect } from 'react';
import { Button, Box } from "./UIElements"
import { Row, Column } from "./Containers"

const Actions = props => {
    const [speed, setSpeed] = useState(0)
    const [altitude, setAltitude] = useState(0)
    const [loiterRate, setLoiterRate] = useState(0)

    const updateData = () => {
        
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
            <Row gap="1rem" height="11rem" width="40rem">
                <Column gap="1rem" height="10rem" width="10rem">
                    <Button>Actions</Button>
                    <Button>Waypoint</Button>
                    <Button>Flight</Button>
                    <Button>Mount</Button>
                </Column>
                <Column gap="1rem" height="10rem" width="10rem">
                    <Button>Do Action</Button>
                    <Button>Set Waypoint</Button>
                    <Button>Set Mode</Button>
                    <Button>Set Mount</Button>
                </Column>
                <Column gap="1rem" height="10rem" width="10rem">
                    <Button>Auto</Button>
                    <Button>Loiter</Button>
                    <Button>RTL</Button>
                    <Button>Clear Track</Button>
                </Column>
                <Column gap="1rem" height="10rem" width="10rem">
                    <Button>Set Home Alt</Button>
                    <Button>Restart Mission</Button>
                    <Button>Raw View</Button>
                    <Button>Arm/Disarm</Button>
                </Column>
            </Row>
            <Row gap="1rem" height="11rem" width="20rem">
                <Column gap="1rem" height="10rem" width="10rem">
                    <Box label="Speed" content={speed} />
                    <Box label="Altitude" content={altitude} />
                    <Box label="Loiter Rate" content={loiterRate} />
                </Column>
                <Column gap="1rem" height="10rem" width="15rem">
                    <Box />
                    <Box />
                    <Box />
                </Column>
            </Row>
            <Row gap="1rem" height="11rem" width="25rem">
                <Box label="Console/Error Messages" />
            </Row>
        </div>
    );
}

export default Actions;