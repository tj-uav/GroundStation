// @flow

import React, { createRef, useState, useEffect } from 'react'
// import 'leaflet/dist/leaflet.css';
import { Map, TileLayer, Marker, Polyline } from 'react-leaflet'
import { get } from '../backend.js'
import L from 'leaflet'

// TODO: Popup for home icon
// TODO: Popup for waypoint labels
// TODO: Mode radio button (or dropdown) -> (waypoint, polygon, fence, remove)
// TODO: Implement marker insertion
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
//    const interval = setInterval(() => {
//      queryValues();
//    }, 1000);
//    return () => clearInterval(interval);
  }, []);


  const handleMove = (event, idx, datatype) => {
    let [get, set] = props.datatypeAccessors[datatype];
    let temp = get.slice();
    temp[idx] = event.latlng;
    set(temp);
  }

  const popup = (latlng, key, datatype) => (
    <Marker icon={icons[datatype]}
    position={latlng} key={key} 
    draggable={true} onmove={(event) => handleMove(event, key, datatype)} />
  );

  const handleClick = (event) => {
    let [get, set] = props.datatypeAccessors[props.mode];
    let temp = get.slice();
    temp.push([event.latlng.lat, event.latlng.lng]);
    set(temp);
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
      <Marker position={state.latlng}></Marker>
      <Polyline positions={props.datatypeAccessors.waypoints[0]} color="#00AA00"></Polyline>
      <Polyline positions={props.datatypeAccessors.polygons[0]} color="#FF0000"></Polyline>
      <Polyline positions={props.datatypeAccessors.fence[0]} color="#0000FF"></Polyline>
      {props.datatypeAccessors.waypoints[0].map((thing, index) => {
        return popup(thing, index, 'waypoints');
      })}
      {props.datatypeAccessors.polygons[0].map((thing, index) => {
        return popup(thing, index, 'polygons');
      })}
      {props.datatypeAccessors.fence[0].map((thing, index) => {
        return popup(thing, index, 'fence');
      })}
    </Map>
    </div>
  )
}

export default FlightPlanMap;