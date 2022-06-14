// @flow

import React, { createRef, useEffect, useState, useRef } from "react"
import { MapContainer, TileLayer, Tooltip, Marker, Polyline, Circle, LayersControl, LayerGroup, useMapEvent, Popup } from "react-leaflet"
import { httpget } from "../backend.js"
import L from "leaflet"

import PolylineDecorator from "../pages/FlightData/tabs/FlightPlan/PolylineDecorator.js"
import RotatedMarker from "./RotatedMarker.js"
import { useInterval } from "../util"
import { Box, Button } from "components/UIElements"
import { red } from "theme/Colors"

const FlightPlanMap = props => {
	const [state, setState] = useState({
		latlng: { lat: 38.528967, lng: -77.735695 },
	})

	let mapRef = createRef()
	const [icons, setIcons] = useState({})
	const tileRef = useRef(null)

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

		httpget("/uav/commands/export", response => {
			let points = response.data.waypoints.map((marker) => {
				return { num: marker.num, cmd: marker.cmd, p1: marker.p1, p2: marker.p2, lat: marker.lat, lng: marker.lon, alt: marker.alt * 3.281 } // convert altitude from meters to feet
			})
			props.setters.path(points)
			props.setters.pathSave(points)
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
			path: new MarkerIcon({ iconUrl: "../assets/icon-path.png" }),
			home: new MarkerIcon({ iconUrl: "../assets/icon-home.png" }),
			uav: new VehicleIcon({ iconUrl: "../assets/uav.svg" }),
			uavDirection: new DirectionPointerIcon({ iconUrl: "../assets/pointer.svg" }),
			uavDirectionOutline: new DirectionPointerIcon({ iconUrl: "../assets/pointer-outline.svg" }),
			ugv: new VehicleIcon({ iconUrl: "../assets/ugv.svg" }),
			ugvDirection: new DirectionPointerIcon({ iconUrl: "../assets/pointer.svg" }),
			ugvDirectionOutline: new DirectionPointerIcon({ iconUrl: "../assets/pointer-outline.svg" }),
		})

		window.addEventListener("offline", () => {
			tileRef.current.setUrl("/map/{z}/{x}/{y}.png")
		})

		checkInternet()

	}, [])

	const checkInternet = () => {
		if (navigator.onLine) {
			fetch("https://g.co", {
				mode: "no-cors"
			}).then(() => {
				tileRef.current.setUrl("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}")
			}).catch(() => {
				tileRef.current.setUrl("/map/{z}/{x}/{y}.png")
			})
		} else {
			tileRef.current.setUrl("/map/{z}/{x}/{y}.png")
		}
	}
	useInterval(5000, checkInternet)

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
		let get = props.getters["path"]
		let set = props.setters["path"]
		let temp = get.slice()
		let loc = { ...props.getters[datatype][idx], lat: event.target.getLatLng().lat, lng: event.target.getLatLng().lng, opacity: 0.5 }
		temp[idx] = loc
		set(temp)
		props.setSaved(false)
	}

	const popup = (latlng, key, datatype, popupMenu, draggable) => {
		return (
			<Marker
				icon={icons[datatype]}
				position={latlng}
				eventHandlers={{
					dragend: (event) => { handleMove(event, key - (props.getters.path[0].num === 0 ? 0 : 1), datatype) }
				}}
				onkeydown={event => handleKeyPress(event, key)}
				draggable={draggable}
				datatype={datatype}
				opacity={latlng.opacity}
			>
				<Tooltip>
					{props.display[datatype] + " " + (key)} ({latlng.lat.toFixed(5)}, {latlng.lng.toFixed(5)}{latlng.alt ? ", " + latlng.alt + " ft" : null})
				</Tooltip>
				{popupMenu ?
					<Popup>
						{popupMenu}
					</Popup>
				: null}
			</Marker>
		)
	}

	const singlePopup = (marker, type, draggable) => {
		return (
			<Marker icon={icons[type]} position={marker} draggable={draggable} opacity={marker.opacity}>
				<Tooltip>
					{props.display[type]} ({marker.lat.toFixed(5)}, {marker.lng.toFixed(5)})
				</Tooltip>
			</Marker>)
	}

	const handleClick = event => {
		if (props.mode) {
			let get = props.getters["path"]
			let set = props.setters["path"]
			if (props.mode === "push" || (props.mode === "insert" && get.length < 2)) {
				let temp = get.slice()
				let point = { lat: event.latlng.lat, lng: event.latlng.lng, opacity: 0.5, num: get.length + (get[0]?.num === 0 ? -1 : 1) }
				if (temp[temp.length - 1]?.cmd === 177) {
					temp = [...temp.slice(0, temp.length - 1), point, temp[temp.length - 1]]
				} else {
					temp.push(point)
				}
				set(temp)
			} else if (props.mode === "insert") {
				const getPerpendicularDistance = (i) => {
					let first
					let second
					if (get[i]?.cmd === 177) {
						first = get[i - 1]
						second = get[get[i].p1 - (get[0].num === 0 ? 0 : 1)]
					} else {
						first = get[i]
						second = get[(i + 1) % get.length]
					}

					let m = (second.lat - first.lat)/(second.lng - first.lng)
					let x0 = (event.latlng.lng/m + event.latlng.lat - second.lat + m*second.lng)/(m + 1/m) // projection of event point on line
					let y0 = -(x0 - event.latlng.lng)/m + event.latlng.lat

					if (m === -Infinity || m === Infinity) {
						let d = Math.abs(event.latlng.lng - first.lng)
						let lat = event.latlng.lat
						return [d, (lat > first.lat && lat < second.lat) || (lat > second.lat && lat < first.lat)]
					} else if (m == 0) {
						let d = Math.abs(event.latlng.lat - first.lat)
						let lng = event.latlng.lng
						return [d, (lng > first.lng && lng < second.lng) || (lng > second.lng && lng < first.lng)]
					} else {
						let d = Math.sqrt((x0 - event.latlng.lng)**2 + (y0 - event.latlng.lat)**2)
						if (x0 > Math.min(first.lng, second.lng) && x0 < Math.max(first.lng, second.lng) && y0 > Math.min(first.lat, second.lat) && y0 < Math.max(first.lat, second.lat)) {
							return [d, true]
						} else {
							return [d, false]
						}
					}
				}

				let min = get[0]?.num === 0 ? 1 : 0
				let inBox = getPerpendicularDistance(0)[1]
				for (let i = 0; i < get.length; i++) {
					let [d, _in] = getPerpendicularDistance(i)
					if (_in && !inBox) {
						min = i
						inBox = true
					} else if ((!_in && !inBox) || (_in && inBox)) {
						if (d < getPerpendicularDistance(min)[0]) {
							min = i
						}
					}
				}

				let path = get.slice()
				if (get[min]?.cmd === 177) {
					path = [...path.slice(0, min), { num: min, lat: event.latlng.lat, lng: event.latlng.lng, opacity: 0.5 }, ...(path.slice(min).map(point => ({ ...point, num: point.num + 1 })))]
				} else {
					path = [...path.slice(0, min + 1), { num: min + (get[0]?.num === 0 ? 1 : 2), lat: event.latlng.lat, lng: event.latlng.lng, opacity: 0.5 }, ...(path.slice(min + 1).map(point => ({ ...point, num: point.num + 1 })))]
				}
				set(path)
			}
			if (props.saved && props.mode !== "disabled") {
				props.setSaved(false)
			}
		}
	}

	const circle = arr => {
		if (arr.length <= 2) {
			return arr
		}
		return arr.concat([arr[0]])
	}

	const ClickLocation = () => {
		useMapEvent("click", (e) => {
			handleClick(e);
		});
		return null;
	};

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
					attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
					url={"/map/{z}/{x}/{y}.png"}
					ref={tileRef}
				/>
				<ClickLocation />
				<LayersControl position="topright">
					{ /* Need for Auvsi Suas: waypoints, obstacles, geofence, ugv drop 
						ugv drive, ugv fence, odlc search grid, off axis odlc */ }
					<LayersControl.Overlay checked name="Waypoints">
						<LayerGroup>
							<PolylineDecorator layer="Waypoints" positions={props.getters.waypoints} color="#00AA00" decoratorColor="#1fd11f" />
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
									<Circle center={[obstacle.latitude, obstacle.longitude]} color="#FF0000" radius={obstacle.radius / 3.281}>
										<Tooltip>
											Obstacle ({obstacle.latitude.toFixed(5)}, {obstacle.longitude.toFixed(5)})
										</Tooltip>
									</Circle>
								)
							})}
						</LayerGroup>
					</LayersControl.Overlay>
					<LayersControl.Overlay checked name="UGV Points">
						<LayerGroup>
							<Polyline positions={circle(props.getters.ugvFence)} color="#6e0d9a" />
							{props.getters.ugvDrop.lat == null ? null : singlePopup(props.getters.ugvDrop, "ugvDrop")}
							{props.getters.ugvDrive.lat == null ? null : singlePopup(props.getters.ugvDrive, "ugvDrive")}
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
						{props.getters.offAxis.lat == null ? null : singlePopup(props.getters.offAxis, "offAxis")}
					</LayersControl.Overlay>
					<LayersControl.Overlay checked name="UAV">
						{props.getters.uav.heading == null ? null : (
							<LayerGroup>
								<RotatedMarker icon={icons.uavDirection} position={props.getters.uav.latlng} rotationAngle={props.getters.uav.heading} rotationOrigin={"50% 100%"} />
								<Marker icon={icons.uav} position={props.getters.uav.latlng}>
									<Tooltip>
										UAV ({props.getters.uav.latlng.lat.toFixed(5)}, {props.getters.uav.latlng.lng.toFixed(5)})
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
										UGV ({props.getters.ugv.latlng.lat.toFixed(5)}, {props.getters.ugv.latlng.lng.toFixed(5)})
									</Tooltip>
								</Marker>
								<RotatedMarker icon={icons.ugvDirectionOutline} position={props.getters.ugv.latlng} rotationAngle={props.getters.ugv.heading} rotationOrigin={"50% 100%"} />
							</LayerGroup>
						)}
					</LayersControl.Overlay>
					<LayersControl.Overlay checked name="Mission Path">
						<LayerGroup>
							<PolylineDecorator layer="Mission Path" positions={props.getters.path.filter(marker => (marker.num !== 0) && (marker.cmd !== 177))} color="#10336B" decoratorColor="#1d5cc2" />
							{props.getters.path.map((marker, i) => {
								if (marker.num === 0) {
									return singlePopup(marker, "home")
								} else if (marker.cmd === 177) {
									return <PolylineDecorator layer="Mission Path" positions={[props.getters.path[i-1], props.getters.path[marker.p1]]} color="#17e3cb" decoratorColor="#61e8d9" />
								}

								return popup(marker, marker.num, "path", (
									<div>
										Altitude (feet)
										<Box style={{ "width": "12em", "margin-right": "4em", "height": "3em" }} editable={true} content={marker.alt} onChange={v => {
											let path = props.getters.path;
											if (!Number.isNaN(Number(v)) && v.length > 0) {
												if (v.endsWith(".")) {
													props.setters.path([...path.slice(0, i), { ...marker, alt: null }, ...path.slice(i + 1)])
												} else {
													props.setters.path([...path.slice(0, i), { ...marker, alt: Number(v) }, ...path.slice(i + 1)])
												}
												return v
											} else if (v.substring(0, v.length - 1).endsWith(".")) {
												return v.substring(0, v.length - 1)
											} else if (v.length === 0) {
												props.setters.path([...path.slice(0, i), { ...marker, alt: null }, ...path.slice(i + 1)])
												return v
											} else if (v.substring(0, Math.max(v.length - 1, 1)) === "-") {
												props.setters.path([...path.slice(0, i), { ...marker, alt: null }, ...path.slice(i + 1)])
												return v.substring(0, Math.max(v.length - 1, 1))
											} else if (Number.isNaN(parseFloat(v))) {
												return ""
											}

											return marker.altitude
										}} />
										<Button style={{ "margin-top": "0.5em" }} color={red} onClick={() => {
											let path = props.getters.path.slice()
											path.splice(i, 1)
											props.setters.path(path)
											props.setSaved(false)
										}}>
											Delete
										</Button>
									</div>
								), true)
							})}
						</LayerGroup>
					</LayersControl.Overlay>
				</LayersControl>
			</MapContainer>
		</div>
	)
}

export default FlightPlanMap
