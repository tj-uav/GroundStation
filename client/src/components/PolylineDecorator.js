import React, { useRef, useState, useEffect } from "react";
import { Polyline, withLeaflet } from "react-leaflet";
import L from "leaflet";
import "leaflet-polylinedecorator";


const PolylineDecorator = withLeaflet(props => {

  const arrow = [
    {
      offset: "50%",
      repeat: 0,
      symbol: L.Symbol.arrowHead({
        pixelSize: 20,
        polygon: false,
        pathOptions: { stroke: true, color: props.color }
      })
    }
  ];

  const polyRef = useRef();
  const decoRef = useRef();
  useEffect(() => {
    const polyline = polyRef.current.leafletElement; //get native Leaflet polyline
    const { map } = polyRef.current.props.leaflet; //get native Leaflet map

    if(decoRef.current){
      decoRef.current.removeFrom(map);
    }

    let temp = [];
    let latlngs = polyline.getLatLngs();
    if(latlngs.length > 1){
      for(let i of Array(latlngs.length - 1).keys()){
        temp.push([latlngs[i], latlngs[i+1]]);
      }
    }

    decoRef.current = L.polylineDecorator(temp, {
        patterns : arrow
    });
    decoRef.current.addTo(map);
  });

  return <Polyline ref={polyRef} patterns={arrow} {...props} />;
});

export default PolylineDecorator;