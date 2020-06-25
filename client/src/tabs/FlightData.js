import React, { useState, useEffect } from 'react';
import { Button, Box } from "../components/UIElements"
import { Row, Column } from "../components/Containers"
import { httpget } from '../backend.js'

const FlightData = () => {

  const [telem, setTelem] = useState([]);
  const queryValues = () => {
    httpget("/mav/telem", (response) => setTelem(response.data));
  }

  useEffect(() => {
    //        const interval = setInterval(() => {
    //            queryValues();
    //        }, 1000);
    //        return () => clearInterval(interval);
  }, []);

  return (
    <div>You opened the flight data tab {telem[0]} {telem[1]} {telem[2]}
      <Row gap="1rem" height="3rem" width="40rem">
        <Button>Quick</Button>
        <Button>Click Me!</Button>
        <Button>Click Me!</Button>
      </Row>
      <Column gap="1rem" height="15rem" width="20rem">
        <Button>Click Me!</Button>
        <Box label="data" content="some stat" />
        <Box content="234" editable />
      </Column>
    </div>
  )
}

export default FlightData;