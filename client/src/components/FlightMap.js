// @flow

import React, { createRef, useState, useEffect } from "react"
import { MapContainer, TileLayer, Tooltip, Marker, Polyline, Circle, LayersControl, LayerGroup } from "react-leaflet"
import { httpget } from "../backend.js"
import L from "leaflet"
import PolylineDecorator from "../pages/FlightData/tabs/FlightPlan/PolylineDecorator.js"
import RotatedMarker from "./RotatedMarker.js"

const FlightPlanMap = props => {
	const [state, setState] = useState({
		latlng: { lat: 38.1458611, lng: -76.428038 },
	})

	let mapRef = createRef()
	const [icons, setIcons] = useState({})
	const [online, setOnline] = useState(false)

	useEffect(() => {
		httpget("/interop/mission", response => {
			setState(response.data.result.mapCenterPos)

			let waypoints = []
			response.data.result.waypoints.forEach(p => waypoints.push({ lat: p.latitude, lng: p.longitude }))
			props.setters.waypoints(waypoints)

			let fence = []
			response.data.result.flyZones[0].boundaryPoints.forEach(p => fence.push({ lat: p.latitude, lng: p.longitude }))
			props.setters.fence(fence)

			let ugvFence = []
			response.data.result.airDropBoundaryPoints.forEach(p => ugvFence.push({ lat: p.latitude, lng: p.longitude }))
			props.setters.ugvFence(ugvFence)

			let searchGrid = []
			response.data.result.searchGridPoints.forEach(p => searchGrid.push({ lat: p.latitude, lng: p.longitude }))
			props.setters.searchGrid(searchGrid)

			props.setters.ugvDrive({ lat: response.data.result.ugvDrivePos.latitude, lng: response.data.result.ugvDrivePos.longitude })
			props.setters.ugvDrop({ lat: response.data.result.airDropPos.latitude, lng: response.data.result.airDropPos.longitude })
			props.setters.offAxis({ lat: response.data.result.offAxisOdlcPos.latitude, lng: response.data.result.offAxisOdlcPos.longitude })
			props.setters.obstacles(response.data.result.stationaryObstacles)
		})

		var MarkerIcon = L.Icon.extend({
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
		var VehicleIcon = L.Icon.extend({
			options: {
				iconSize: [50, 82],
				iconAnchor: [25, 82],
				shadowUrl: "../assets/marker-shadow.png",
				shadowSize: [82, 82],
				shadowAnchor: [25, 82]
			}
		})
		var DirectionPointerIcon = L.Icon.extend({
			options: {
				iconSize: [20, 40],
				iconAnchor: [10, 40]
			}
		})
		setIcons({
			waypoints: new MarkerIcon({ iconUrl: "../assets/icon-waypoints.png" }),
			fence: new MarkerIcon({ iconUrl: "../assets/icon-fence.png" }),
			ugvFence: new MarkerIcon({ iconUrl: "../assets/icon-ugvFence.png" }),
			ugvDrop: new MarkerIcon({ iconUrl: "../assets/icon-ugvDrop.png" }),
			ugvDrive: new MarkerIcon({ iconUrl: "../assets/icon-ugvDrive.png" }),
			offAxis: new MarkerIcon({ iconUrl: "../assets/icon-offAxis.png" }),
			searchGrid: new MarkerIcon({ iconUrl: "../assets/icon-searchGrid.png" }),
			uav: new VehicleIcon({ iconUrl: "../assets/uav.svg" }),
			uavDirection: new DirectionPointerIcon({ iconUrl: "../assets/pointer.svg" }),
			uavDirectionOutline: new DirectionPointerIcon({ iconUrl: "../assets/pointer-outline.svg" }),
			ugv: new VehicleIcon({ iconUrl: "../assets/ugv.svg" }),
			ugvDirection: new DirectionPointerIcon({ iconUrl: "../assets/pointer.svg" }),
			ugvDirectionOutline: new DirectionPointerIcon({ iconUrl: "../assets/pointer-outline.svg" }),
		})

		window.addEventListener("offline", () => {
			setOnline(false)
		})

		window.addEventListener("online", () => {
			setOnline(true)
		})

		const internet = setInterval(() => {
			checkInternet()
		}, 5000)

		return () => {
			clearInterval(internet)
		}
	}, [])

	const checkInternet = () => {
		if (navigator.onLine) {
			fetch("https://g.co", {
				mode: "no-cors"
			}).then(() => {
				setOnline(true)
			}).catch(() => {
				setOnline(false)
			})
		} else {
			setOnline(false)
		}
	}

	const handleKeyPress = (event, idx) => {
		console.log(event.originalEvent.key)
		switch (event.originalEvent.key) {
			case "Delete":
				let datatype = event.target.options.datatype
				let get = props.getters[datatype]
				let set = props.setters[datatype]
				let temp = get.slice()
				temp.splice(idx, 1)
				set(temp)
		}
	}

	const handleMove = (event, idx, datatype) => {
		let get = props.getters[datatype]
		let set = props.setters[datatype]
		let temp = get.slice()
		let loc = { lat: event.target.getLatLng().lat, lng: event.target.getLatLng().lng }
		temp[idx] = loc
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
				{props.display[datatype] + " " + (key + 1)} ({ latlng.lat.toFixed(5) }, { latlng.lng.toFixed(5) })
			</Tooltip>
		</Marker>
	)

	const singlePopup = (type) => {
		return (
			<Marker icon={icons[type]} position={props.getters[type]} draggable={true}>
				<Tooltip>
					{props.display[type]} ({ props.getters[type].lat.toFixed(5) }, { props.getters[type].lng.toFixed(5) })
				</Tooltip>
			</Marker>)
	}

	const handleClick = event => {
		if (props.mode && false) {
			let get = props.getters[props.mode]
			let set = props.setters[props.mode]
			if (get.constructor.name == "Array") {
				let temp = get.slice()
				temp.push({ lat: event.latlng.lat, lng: event.latlng.lng })
				set(temp)
			} else { // object {}
				set({ lat: event.latlng.lat, lng: event.latlng.lng })
			}
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
			<MapContainer
				center={state.latlng}
				length={4}
				onClick={handleClick}
				ref={mapRef}
				zoom={16}
				style={{ height: "100%" }}
			>
				<TileLayer
					attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
					url={online ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" : "/map/{z}/{x}/{y}.png"}
				/>
				<LayersControl position="topright">
					{ /* Need for Auvsi Suas: waypoints, obstacles, geofence, ugv drop 
						ugv drive, ugv fence, odlc search grid, off axis odlc */ }
					<LayersControl.Overlay checked name="Waypoints">
						<LayerGroup>
							<PolylineDecorator layer="Waypoints" positions={props.getters.waypoints} color="#00AA00" />
							{props.getters.waypoints.map((marker, index) => {
								return popup(marker, index, "waypoints")
							})}
						</LayerGroup>
					</LayersControl.Overlay>
					<LayersControl.Overlay checked name="Geofence">
						<LayerGroup>
							<Polyline positions={circle(props.getters.fence)} color="#0000FF" />
							{props.getters.fence.map((marker, index) => {
								return popup(marker, index, "fence")
							})}
						</LayerGroup>
					</LayersControl.Overlay>
					<LayersControl.Overlay checked name="Obstacles">
						<LayerGroup>
							{props.getters.obstacles.map((obstacle) => {
								return (
									<Circle center={[obstacle.latitude, obstacle.longitude]} color="#FF0000" radius={obstacle.radius/3.281}>
										<Tooltip>
											Obstacle ({ obstacle.latitude.toFixed(5) }, { obstacle.longitude.toFixed(5) })
										</Tooltip>
									</Circle>
								)
							})}
						</LayerGroup>
					</LayersControl.Overlay>
					<LayersControl.Overlay checked name="UGV Points">
						<LayerGroup>
							<Polyline positions={circle(props.getters.ugvFence)} color="#6e0d9a" />
							{props.getters.ugvDrop.lat == null ? null : singlePopup("ugvDrop")}
							{props.getters.ugvDrive.lat == null ? null : singlePopup("ugvDrive")}
							{props.getters.ugvFence.map((marker, index) => {
								return popup(marker, index, "ugvFence")
							})}
						</LayerGroup>
					</LayersControl.Overlay>
					<LayersControl.Overlay checked name="Search Grid">
						<LayerGroup>
							<Polyline positions={circle(props.getters.searchGrid)} color="#ee7313" />
							{props.getters.searchGrid.map((marker, index) => {
								return popup(marker, index, "searchGrid")
							})}
						</LayerGroup>
					</LayersControl.Overlay>
					<LayersControl.Overlay checked name="Off Axis ODLC">
						{props.getters.offAxis.lat == null ? null : singlePopup("offAxis")}
					</LayersControl.Overlay>
					<LayersControl.Overlay checked name="UAV">
						{props.getters.uav.heading == null ? null : (
							<LayerGroup>
								<RotatedMarker icon={icons.uavDirection} position={props.getters.uav.latlng} rotationAngle={props.getters.uav.heading} rotationOrigin={"50% 100%"} />
								<Marker icon={icons.uav} position={props.getters.uav.latlng}>
									<Tooltip>
										UAV ({ props.getters.uav.latlng.lat.toFixed(5) }, { props.getters.uav.latlng.lng.toFixed(5) })
									</Tooltip>
								</Marker>
								<RotatedMarker icon={icons.uavDirectionOutline} position={props.getters.uav.latlng} rotationAngle={props.getters.uav.heading} rotationOrigin={"50% 100%"} />
							</LayerGroup>
						)}
					</LayersControl.Overlay>
					<LayersControl.Overlay checked name="UGV">
						{props.getters.ugv.heading == null ? null : (
							<LayerGroup>
								<RotatedMarker icon={icons.ugvDirection} position={props.getters.ugv.latlng} rotationAngle={props.getters.ugv.heading} rotationOrigin={"50% 100%"} />
								<Marker icon={icons.ugv} position={props.getters.ugv.latlng}>
									<Tooltip>
										UGV ({ props.getters.ugv.latlng.lat.toFixed(5) }, { props.getters.ugv.latlng.lng.toFixed(5) })
									</Tooltip>
								</Marker>
								<RotatedMarker icon={icons.ugvDirectionOutline} position={props.getters.ugv.latlng} rotationAngle={props.getters.ugv.heading} rotationOrigin={"50% 100%"} />
							</LayerGroup>
						)}
					</LayersControl.Overlay>
				</LayersControl>
			</MapContainer>
		</div>
	)
}

export default FlightPlanMap
