import React, { useState, useEffect } from 'react';
import { Button, Box, Label } from "./UIElements"
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

                {/* <Row height="5rem" gap="0.5rem" columns="1fr 3fr"> */}
                {/* <Column width="25%"> */}
                {/* <div style={{ display: "grid", gridTemplateColumns: "1fr 3fr" }}> */}
                <Box label="Speed" content={speed} editable />
                {/* <Box /> */}
                {/* </div> */}
                {/* </Column> */}
                {/* </Row> */}
            </Column>


            {/* <Row gap="1rem" height="11rem" width="20rem">
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
            </Row> */}
        </div>
    );
}

export default Actions;