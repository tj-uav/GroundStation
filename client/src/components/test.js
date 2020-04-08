import React from "react";
import { MDBContainer, MDBInput } from "mdbreact";
import { marker } from "leaflet";

class InputPage extends React.Component {
state = {
  radio: "MALE"
}

onClick = (event) => {
    console.log(event.target.value);
}

render() {
  return (
    <div onChange={this.onClick.bind(this)}>
        <input type="radio" value="MALE" name="gender"/> Male
        <input type="radio" value="FEMALE" name="gender"/> Female
    </div>
    );
  }
}

export default InputPage;