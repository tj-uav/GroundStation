import React from 'react';
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Table from 'react-bootstrap/Table'


const Params = () => {

    return (
        <div>
            <div style={{"float": "left", "padding-left": 20}}>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                        <th>Param Name</th>
                        <th>Current Value</th>
                        <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Bank Angle</td>
                            <td>30</td>
                            <td>The plane's maximum bang angle</td>
                        </tr>
                        <tr>
                            <td>RC Failsafe</td>
                            <td>RTL</td>
                            <td>What to do when RC connection is lost</td>
                        </tr>
                        <tr>
                            <td>Geofence</td>
                            <td>RTL</td>
                            <td>What to do when plane exists geofence</td>
                        </tr>
                    </tbody>
                </Table>
            </div>
            <ButtonGroup vertical style={{"float": "right", "padding-right": 30}}>
                <Button variant="primary">Read params</Button>
                <Button variant="primary">Write params</Button>
            <Form style={{"margin-top": 20}} inline={true}>
                <Form.Control type="text" placeholder="Search params"></Form.Control>
                <Button variant="primary" type="submit">Search params</Button>
            </Form>
            </ButtonGroup>

        </div>
    )
}

export default Params;