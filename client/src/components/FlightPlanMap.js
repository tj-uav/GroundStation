// @flow

import React, { createRef, useState, useEffect } from 'react'
// import 'leaflet/dist/leaflet.css';
import { Map, TileLayer, Marker, Polyline } from 'react-leaflet'
import { get } from '../backend.js'
import L from 'leaflet'

// TODO: Popup for home icon
// TODO: Popup for waypoint labels
// TODO: Mode radio button (or dropdown) -> (waypoint, polygon, fence, remove)
// TODO: Implement marker removal
// TODO: Display current location of plane (use telem, and also need to make plane icon)
// TODO: Polyline overlay -> take polyline file (custom file structure) and overlay it onto map (allow for color option in file)

const FlightPlanMap = (props) => {
  const [state, setState] = useState({
    latlng: {
      lat: 51.505,
      lng: -0.09,
    },
  })

  let mapRef = createRef<Map>()
  const [icons, setIcons] = useState({});
  const [telem, setTelem] = useState([]);

  const queryValues = () => {
      get("/mav/telem", (response) => setTelem(response.data));
  }

  useEffect(() => {
    var LeafIcon = L.Icon.extend({
        options: {
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowUrl: 'assets/marker-shadow.png',
          shadowSize: [41, 41],
          tooltipAnchor: [16, -28],
          shadowAnchor: [12, 41]
        }
    });
    setIcons({
      "waypoints": new LeafIcon({iconUrl: 'assets/icon-waypoints.png'}),
      "polygons":  new LeafIcon({iconUrl: 'assets/icon-polygons.png'}),
      "fence": new LeafIcon({iconUrl: 'assets/icon-fence.png'})
    })
    const interval = setInterval(() => {
      queryValues();
    }, 1000);
    return () => clearInterval(interval);
  }, []);


  const handleMove = (event, idx) => {
    let tempWaypoints = props.waypoints.slice();
    tempWaypoints[idx] = event.latlng;
    props.setWaypoints(tempWaypoints);
  }

  const popup = (latlng, key, datatype) => (
    <Marker icon={icons[datatype]}
    position={latlng} key={key} 
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
      <Polyline positions={props.waypoints}></Polyline>
      <Marker position={state.latlng}></Marker>
      {props.waypoints.map((thing, index) => {
        return popup(thing, index, 'waypoints');
      })}
      {props.polygons.map((thing, index) => {
        return popup(thing, index, 'polygons');
      })}
      {props.fence.map((thing, index) => {
        return popup(thing, index, 'fence');
      })}
    </Map>
    </div>
  )
}

export default FlightPlanMap;