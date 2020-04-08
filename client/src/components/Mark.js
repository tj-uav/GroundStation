import React, { useState, useEffect } from 'react';
import { Tooltip, Marker } from 'react-leaflet';
import L from 'leaflet'

const Mark = (props) => {

  let [latlng, setLatLng] = useState(props.latlng);
  let [icon, setIcon] = useState();
 
  const handleKeyPress = (event) => {
    let latlng = event.target.getLatLng();
    let [lat, lng] = [latlng.lat, latlng.lng];
    let datatype = event.options.datatype;
    let get = props.getters[datatype]; let set = props.setters[datatype];
    console.log(event.target);
  }

  useEffect(() => {
    var LeafIcon = L.Icon.extend({
      options: {
        iconUrl: 'assets/icon-' + props.datatype + '.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: 'assets/marker-shadow.png',
        shadowSize: [41, 41],
        tooltipAnchor: [16, -28],
        shadowAnchor: [12, 41]
      }
    })
    console.log(latlng);
  }, []);
  
  
  const handleMove = (event, idx) => {
    console.log(event);
    let get = props.get;
    let temp = get.slice();
    temp[idx] = [event.target.getLatLng().lat, event.target.getLatLng().lng];
    setLatLng(temp);
  }

  const popup = (latlng, key) => (
      <Marker icon={icon} position={latlng} onclick={console.log} onkeydown={handleKeyPress}
      draggable={true} onmoveend={(event) => handleMove(event, key)}>
        <Tooltip>Waypoint {key + 1}</Tooltip>
      </Marker>
  );

  return (<Marker position={[0, 0]}></Marker>)


}

export default Marker;