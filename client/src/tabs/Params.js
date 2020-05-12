import React, { useState } from 'react';
import Table from 'react-bootstrap/Table'
import ParamToolbar from '../components/ParamToolbar.js'

/*
Current params functionality:
You can load a param file, and it will load all known params (known params are those in the paramDescriptions dictionary).
You can also save the current params to a file.
The params file format is the same as that of MP.

TODO: Make params table editable (look at list of useful react components in #ground-station)
TODO: Allow reader to choose location when saving params file
TODO: Put in all the param descriptions
TODO: Read params from mavlink
TODO: Write params to mavlink
*/


const paramDescriptions = {
  "Bank angle": "The plane's maximum bank angle",
  "RC Failsafe": "What to do when RC connection is lost",
  "Geofence": "What to do when plane exits geofence"
};


const initialParams = [
  ["Bank angle", "30"],
  ["RC Failsafe", "RTL"],
  ["Geofence", "RTL"]
]


const Params = () => {

  const [params, setParams] = useState(initialParams);
  const [display, setDisplay] = useState(initialParams);

  return (
    <div>
      <div style={{float: "left", paddingLeft: 20}}>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Param Name</th>
              <th>Current Value</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {params.map((element, i) =>
              <tr key={i}>
                <td>{element[0]}</td>
                <td>{element[1]}</td>
                <td>{paramDescriptions[element[0]]}</td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
      <ParamToolbar paramDescriptions={paramDescriptions} setDisplay={setDisplay} params={params} setParams={(data) => {setParams(data); setDisplay(data);}}></ParamToolbar>
    </div>
  )
}

export default Params;