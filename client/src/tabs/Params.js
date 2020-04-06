import React, { useState } from 'react';
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Table from 'react-bootstrap/Table'

const params = [
    ["Bank angle", "30", "The plane's maximum bank angle"],
    ["RC Failsafe", "RTL", "What to do when RC connection is lost"],
    ["Geofence", "RTL", "What to do when plane exits geofence"]
]

const Params = () => {

    const [display, setDisplay] = useState(params);

    const search = (event) => {
        let form = event.currentTarget;
        let input = form.childNodes[0].value;
        console.log(input); // Search based on this value
        let temp = [];
        for(let i in params){
            let param = params[i];
            if(param[0].toLowerCase().includes(input.toLowerCase())){
                temp.push(param);
            }
        }
        setDisplay(temp);
    }

    return (
        <div>
            <div style={{"float": "left", "paddingLeft": 20}}>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                        <th>Param Name</th>
                        <th>Current Value</th>
                        <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {display.map((element, i) => 
                        <tr key={i}>
                            <td>{element[0]}</td>
                            <td>{element[1]}</td>
                            <td>{element[2]}</td>
                        </tr>
                        )}
                    </tbody>
                </Table>
            </div>
            <ButtonGroup vertical style={{"float": "right", "paddingRight": 30}}>
                <Button variant="primary">Read params</Button>
                <Button variant="primary">Write params</Button>
            <Form style={{"marginTop": 20}} inline={true} onSubmit={(event) => search(event)}>
                <Form.Control type="text" placeholder="Search params"></Form.Control>
                <Button variant="primary" type="submit">Search params</Button>
            </Form>
            </ButtonGroup>

        </div>
    )
}

export default Params;