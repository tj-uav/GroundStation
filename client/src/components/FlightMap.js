// @flow

import React, { createRef, useState, useEffect } from "react"
import { Map, TileLayer, Tooltip, Marker, Polyline, Circle } from "react-leaflet"
import { httpget } from "../backend.js"
import L from "leaflet"
import PolylineDecorator from "../pages/FlightData/tabs/FlightPlan/PolylineDecorator.js"

const FlightPlanMap = props => {
	const [state, setState] = useState({
		latlng: { lat: 38.1458611, lng: -76.4265257 },
	})

	let mapRef = createRef()
	const [icons, setIcons] = useState({})
	const [telem, setTelem] = useState([])

	const queryValues = () => {
		httpget("/mav/telem", response => setTelem(response.data))
	}

	useEffect(() => {
		console.log(mapRef.current)
		var LeafIcon = L.Icon.extend({
			options: {
				iconSize: [25, 41],
				iconAnchor: [12, 41],
				popupAnchor: [1, -34],
				shadowUrl: "../assets/marker-shadow.png",
				shadowSize: [41, 41],
				tooltipAnchor: [16, -28],
				shadowAnchor: [12, 41],
			},
		})
		setIcons({
			waypoints: new LeafIcon({ iconUrl: "../assets/icon-waypoints.png" }),
			polygons: new LeafIcon({ iconUrl: "../assets/icon-polygons.png" }),
			fence: new LeafIcon({ iconUrl: "../assets/icon-fence.png" }),
			ugvFence: new LeafIcon({ iconUrl: "../assets/icon-ugvFence.png" }),
			ugvDrop: new LeafIcon({ iconUrl: "../assets/icon-ugvDrop.png" }),
			ugvDrive: new LeafIcon({ iconUrl: "../assets/icon-ugvDrive.png" }),
			offAxis: new LeafIcon({ iconUrl: "../assets/icon-offAxis.png" }),
			searchGrid: new LeafIcon({ iconUrl: "../assets/icon-searchGrid.png" }),
		})
		//    const interval = setInterval(() => {
		//      queryValues();
		//    }, 1000);
		//    return () => clearInterval(interval);
	}, [])

	const handleKeyPress = (event, idx) => {
		console.log(event.originalEvent.key)
		switch (event.originalEvent.key) {
			case "Delete":
				let datatype = event.target.options.datatype
				let get = props.getters[datatype]
				let set = props.setters[datatype]
				let temp = get.slice()
				if (datatype === "polygons") {
					temp[idx[0]].splice(idx[1], 1)
				} else {
					temp.splice(idx, 1)
				}
				set(temp)
		}
	}

	const handleMove = (event, idx, datatype) => {
		let get = props.getters[datatype]
		let set = props.setters[datatype]
		let temp = get.slice()
		let loc = [event.target.getLatLng().lat, event.target.getLatLng().lng]
		if (datatype === "polygons") {
			temp[idx[0]][idx[1]] = loc
		} else {
			temp[idx] = loc
		}
		set(temp)
	}

	const popup = (latlng, key, datatype) => (
		<Marker
			icon={icons[datatype]}
			position={latlng}
			onclick={() => {}}
			onkeydown={event => handleKeyPress(event, key)}
			draggable={true}
			onmoveend={event => handleMove(event, key, datatype)}
			datatype={datatype}
		>
			<Tooltip>
				{datatype === "polygons"
					? "Polygon " + (key[0] + 1) + ", Marker " + (key[1] + 1)
					: props.display[datatype] + " " + (key + 1)}
			</Tooltip>
		</Marker>
	)

	const singlePopup = (type) => {
		return (
			<Marker icon={icons[type]} position={props.getters[type]} draggable={true}>
				<Tooltip>
					{props.display[type]}
				</Tooltip>
			</Marker>)
	}

	const handleClick = event => {
		let get = props.getters[props.mode]
		let set = props.setters[props.mode]
		if (get.constructor.name == "Array") {
			let temp = get.slice()
			if (props.mode === "polygons") {
				temp[temp.length - 1].push([event.latlng.lat, event.latlng.lng])
			} else {
				temp.push([event.latlng.lat, event.latlng.lng])
			}
			set(temp)
		} else { // object {}
			set({ lat: event.latlng.lat, lng: event.latlng.lng })
		}
	}

	const circle = arr => {
		if (arr.length <= 2) {
			return arr
		}
		return arr.concat([arr[0]])
	}

	return (
		<div>
			<Map
				center={state.latlng}
				length={4}
				onClick={handleClick}
				ref={mapRef}
				zoom={15}
				style={{ height: "100%" }}
			>
				<TileLayer
					attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>

				<PolylineDecorator positions={props.getters.waypoints} color="#00AA00" />
				{props.getters.polygons.map(arr => {
					return <Polyline positions={circle(arr)} color="#ee7313"></Polyline>
				})}
				<Polyline positions={circle(props.getters.fence)} color="#0000FF"></Polyline>
				<Polyline positions={circle(props.getters.ugvFence)} color="#6e0d9a"></Polyline>
				<Polyline positions={circle(props.getters.searchGrid)} color="#ff93dd"></Polyline>
				
				{ /* Need for Auvsi Suas: waypoints, obstacles, geofence, ugv drop 
				     ugv drive, ugv fence, odlc search grid, off axis odlc */ }
				{props.getters.waypoints.map((marker, index) => {
					return popup(marker, index, "waypoints")
				})}
				{props.getters.polygons.map((arr, index1) => {
					return arr.map((marker, index2) => {
						return popup(marker, [index1, index2], "polygons")
					})
				})}
				{props.getters.fence.map((marker, index) => {
					return popup(marker, index, "fence")
				})}
				{props.getters.obstacles.map((obstacle) => {
					return (
						<Circle center={[obstacle.latitude, obstacle.longitude]} color="#FF0000" radius={obstacle.radius/3.281} />
					)
				})}
				{props.getters.ugvDrop.lat == null ? null : singlePopup("ugvDrop")}
				{props.getters.ugvDrive.lat == null ? null : singlePopup("ugvDrive")}
				{props.getters.ugvFence.map((marker, index) => {
					return popup(marker, index, "ugvFence")
				})}
				{props.getters.searchGrid.map((marker, index) => {
					return popup(marker, index, "searchGrid")
				})}
				{props.getters.offAxis.lat == null ? null : singlePopup("offAxis")}
			</Map>
		</div>
	)
}

export default FlightPlanMap
