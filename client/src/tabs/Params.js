import React from 'react';
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'


const Params = () => {


    return (
        <div>
            <div style={{"float": "left", "padding-left": 20}}>
                Table
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