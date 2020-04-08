// @flow

import React, { createRef, useState, useEffect } from 'react'
// import 'leaflet/dist/leaflet.css';
import { Map, TileLayer, Popup, Tooltip, Marker, Polyline } from 'react-leaflet'
import { httpget } from '../backend.js'
import L from 'leaflet'

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
      httpget("/mav/telem", (response) => setTelem(response.data));
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


  const handleKeyPress = (event, idx) => {
    console.log(event.originalEvent.key);
    switch(event.originalEvent.key){
      case "Delete":
        let datatype = event.target.options.datatype;
        let get = props.getters[datatype]; let set = props.setters[datatype];
        let temp = get.slice();
        temp.splice(idx, 1);
        set(temp);
    }
  }


  const handleMove = (event, idx, datatype) => {
    console.log(event);
    let get = props.getters[datatype]; let set = props.setters[datatype];
    let temp = get.slice();
    temp[idx] = [event.target.getLatLng().lat, event.target.getLatLng().lng];
    set(temp);
  }

  const popup = (latlng, key, datatype) => (
      <Marker icon={icons[datatype]} position={latlng} onclick={console.log} onkeydown={(event) => handleKeyPress(event, key)}
      draggable={true} onmoveend={(event) => handleMove(event, key, datatype)} datatype={datatype}>
        <Tooltip>{props.display[datatype]} {key + 1}</Tooltip>
      </Marker>
  );

  const handleClick = (event) => {
    let get = props.getters[props.mode]; let set = props.setters[props.mode];
    let temp = get.slice();
    temp.push([event.latlng.lat, event.latlng.lng]);
    set(temp);
  }

  const circle = (arr) => {
    if(arr.length <= 2){
      return arr;
    }
    return arr.concat([arr[0]]);
  }

  console.log(props.getters.fence);

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
      <Polyline positions={props.getters.waypoints} color="#00AA00"></Polyline>
      <Polyline positions={circle(props.getters.polygons)} color="#FF0000"></Polyline>
      <Polyline positions={circle(props.getters.fence)} color="#0000FF"></Polyline>
      {props.getters.waypoints.map((thing, index) => {
        return popup(thing, index, 'waypoints');
      })}
      {props.getters.polygons.map((thing, index) => {
        return popup(thing, index, 'polygons');
      })}
      {props.getters.fence.map((thing, index) => {
        return popup(thing, index, 'fence');
      })}
    </Map>
    </div>
  )
}

export default FlightPlanMap;