import React, { useState, useEffect } from 'react';
import { Button, Box, Label } from "./UIElements"
import { Row, Column } from "./Containers"

const LabelledSlider = ({ for: label, value, ...props }) => {
    return (
        <Column gap="0" style={{ display: "unset" }} {...props}>
            <Label>{label}</Label>
            <Row columns="repeat(4, minmax(0, 1fr))" gap="0.5rem">
                <Box content={value} style={{ marginRight: "0.5rem" }} editable />
                <Box style={{ gridColumn: "span 3" }} />
            </Row>
        </Column>
    )
}

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
        <div style={{ padding: "0 1rem", maxWidth: "37rem" }}>
            <Row id="tabs" gap="1rem" height="3rem">
                <Button style={{ marginRight: "0.5rem" }}>Quick</Button>
                <Button>All</Button>
                <Button>Actions</Button>
                <Button>Servo</Button>
            </Row>

            <Row id="labels" height="2rem" gap="0.5rem" style={{ marginTop: "1rem" }}>
                <Label columns={1}>Dropdown</Label>
                <Label columns={3}>Functions</Label>
            </Row>

            <Column>
                <Row id="actions" height="2rem" gap="0.5rem">
                    <Button style={{ marginRight: "0.5rem" }}>Actions</Button>
                    <Button>Do Action</Button>
                    <Button>Auto</Button>
                    <Button>Set Home Alt</Button>
                </Row>
                <Row id="waypoints" height="2rem" gap="0.5rem">
                    <Button style={{ marginRight: "0.5rem" }}>Waypoint</Button>
                    <Button>Set Waypoint</Button>
                    <Button>Loiter</Button>
                    <Button>Restart Mission</Button>
                </Row>
                <Row id="flight" height="2rem" gap="0.5rem">
                    <Button style={{ marginRight: "0.5rem" }}>Flight</Button>
                    <Button>Set Mode</Button>
                    <Button>RTL</Button>
                    <Button>Raw View</Button>
                </Row>
                <Row id="mount" height="2rem" gap="0.5rem">
                    <Button style={{ marginRight: "0.5rem" }}>Mount</Button>
                    <Button>Set Mount</Button>
                    <Button>Clear Track</Button>
                    <Button>Arm or Disarm</Button>
                </Row>

                <LabelledSlider for="Speed" value={speed} />
                <LabelledSlider for="Altitude" value={speed} />
                <LabelledSlider for="Loiter Rate" value={speed} />
            </Column>


        </div>
    );
}

export default Actions;