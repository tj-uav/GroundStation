import React, { useState, useEffect } from "react"
import { Button, Box, Label } from "../UIElements"
import { Row, Column } from "../Containers"

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

const DropdownRow = ({ with: buttons, ...props }) => {
    const indent = (index) => index === 0 ? { marginRight: "0.5rem" } : null

    return (
        <Row height="2rem" gap="0.5rem" {...props}>
            {buttons.map((button, index) =>
                <Button key={index} style={indent(index)} onClick={button.onClick}>
                    {button.name}
                </Button>
            )}
        </Row>
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
        <div>
            <Column>
                <Row id="tabs" gap="1rem" height="3rem">
                    <Button>Quick</Button>
                    <Button>All</Button>
                    <Button>Actions</Button>
                    <Button>Servo</Button>
                </Row>

                <Row id="labels" height="2rem" gap="0.5rem">
                    <Label columns={1}>Dropdown</Label>
                    <Label columns={3}>Functions</Label>
                </Row>
            </Column>

            <Column>
                <DropdownRow with={[
                    { name: "Actions" },
                    { name: "Do Action" },
                    { name: "Auto" },
                    { name: "Set Home Alt" }
                ]} />

                <DropdownRow with={[
                    { name: "Waypoint" },
                    { name: "Set Waypoint" },
                    { name: "Loiter" },
                    { name: "Restart Mission" }
                ]} />

                <DropdownRow with={[
                    { name: "Flight" },
                    { name: "Set Mode" },
                    { name: "RTL" },
                    { name: "Raw View" }
                ]} />

                <DropdownRow with={[
                    { name: "Mount" },
                    { name: "Set Mount" },
                    { name: "Clear Track" },
                    { name: "Arm or Disarm" }
                ]} />

                <LabelledSlider for="Speed" value={speed} />
                <LabelledSlider for="Altitude" value={altitude} />
                <LabelledSlider for="Loiter Rate" value={loiterRate} />
            </Column>


        </div>
    )
}

export default Actions