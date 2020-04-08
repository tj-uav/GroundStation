// @flow

import React, { createRef, useState } from 'react'
// import 'leaflet/dist/leaflet.css';
import { Map, TileLayer, Marker, Polyline } from 'react-leaflet'


const FlightPlanMap = (props) => {
  const [state, setState] = useState({
    latlng: {
      lat: 51.505,
      lng: -0.09,
    },
  })

  let mapRef = createRef<Map>()

  const handleMove = (event, idx) => {
    let tempWaypoints = props.waypoints.slice();
    tempWaypoints[idx] = event.latlng;
    props.setWaypoints(tempWaypoints);
  }

  const popup = (latlng, key) => (
    <Marker position={latlng} key={key} 
    draggable={true} onmove={(event) => handleMove(event, key)} />
  );

  const handleClick = (event) => {
    let tempWaypoints = props.waypoints.slice();
    tempWaypoints.push([event.latlng.lat, event.latlng.lng]);
    props.setWaypoints(tempWaypoints);
  }

  return (
    <div>
    <Map
      center={state.latlng}
      length={4}
      onClick={handleClick}
      ref={mapRef}
      zoom={13}
      style={{"height": 600}}
      >
      <TileLayer
        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Polyline positions={props.waypoints} color="red"></Polyline>
      <Marker position={state.latlng}></Marker>
      {props.waypoints.map((thing, index) => {
        return popup(thing, index);
      })}
    </Map>
    </div>
  )
}

export default FlightPlanMap;