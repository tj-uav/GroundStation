// @flow

import React, { createRef, useEffect, useState, useRef } from "react"
import { MapContainer, TileLayer, Tooltip, Marker, Polyline, Circle, LayersControl, LayerGroup, useMapEvent, Popup } from "react-leaflet"
import { httpget } from "../backend.js"
import L from "leaflet"

import Commands from "../commands.js"
import PolylineDecorator from "../pages/FlightData/tabs/FlightPlan/PolylineDecorator.js"
import RotatedMarker from "./RotatedMarker.js"
import { useInterval } from "../util"
import { Box, Button } from "components/UIElements"
import { red } from "theme/Colors"
import { first, get } from "lodash"
import { promiseImpl } from "ejs"
import { hasSelectionSupport } from "@testing-library/user-event/dist/utils/index.js"

// v is onChange value, value is validated value (i.e. your data because to have been set it must have been validated), set is setter
const signedFloatValidation = (v, value, set) => {
	if (!Number.isNaN(Number(v)) && v.length > 0) {
		if (v.endsWith(".")) {
			set(null)
		} else {
			set(Number(v))
		}
		return v
	} else if (v.substring(0, v.length - 1).endsWith(".")) {
		return v.substring(0, v.length - 1)
	} else if (v.length === 0) {
		set(null)
		return v
	} else if (v.substring(0, Math.max(v.length - 1, 1)) === "-") {
		set(null)
		return v.substring(0, Math.max(v.length - 1, 1))
	} else if (Number.isNaN(parseFloat(v))) {
		return ""
	}

	return value
}

const positiveSignedIntValidation = (v, value, set) => {
	if (Number.isInteger(Number(v)) && v.length > 0 && !v.startsWith("-")) {
		set(Number(v))
		return v
	} else if (v.length === 0) {
		set(null)
		return v
	}

	return value
}

const FlightPlanMap = props => {
	const [state, setState] = useState({
		latlng: { lat: 38.315339, lng: -76.548108 },
	})

	// latlng: { lat: 38.528967, lng: -77.735695 }

	let mapRef = createRef()
	const [icons, setIcons] = useState({})
	const tileRef = useRef(null)

	useEffect(() => {

		httpget("/uav/commands/export", response => {
			let points = response.data.waypoints.map((marker) => {
				return { num: marker.num, cmd: marker.cmd, p1: marker.p1, p2: marker.p2, p3: marker.p3 * 3.281, p4: marker.p4, lat: marker.lat, lng: marker.lon, alt: marker.alt * 3.281 } // convert altitude from meters to feet
			})
			props.setters.path(points)
			props.setters.pathSave(structuredClone(points))
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
		var NoIcon = L.Icon.extend({
			options: {
				iconSize: [20, 20],
                iconAnchor: [10, 10],
				iconUrl: "../assets/icon-transparent.svg",
				popupAnchor: [0, 0],
				tooltipAnchor: [0, 0],
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
			flightBoundary: new NoIcon(),  // MarkerIcon({ iconUrl: "../assets/icon-flightBoundary.png" })
			airdropBoundary: new NoIcon(),  // MarkerIcon({ iconUrl: "../assets/icon-airdropBoundary.png" })
			home: new MarkerIcon({ iconUrl: "../assets/icon-home.png" }),
			unlim: new MarkerIcon({ iconUrl: "../assets/icon-unlim.png" }),
			turn: new MarkerIcon({ iconUrl: "../assets/icon-turn.png" }),
			time: new MarkerIcon({ iconUrl: "../assets/icon-time.png" }),
			path: new MarkerIcon({ iconUrl: "../assets/icon-path.png" }),
			jump: new MarkerIcon({ iconUrl: "../assets/icon-jump.png" }),
			uav: new VehicleIcon({ iconUrl: "../assets/uav.svg" }),
			uavDirection: new DirectionPointerIcon({ iconUrl: "../assets/pointer.svg" }),
			uavDirectionOutline: new DirectionPointerIcon({ iconUrl: "../assets/pointer-outline.svg" }),
			water: new VehicleIcon({ iconUrl: "../assets/water-drop.svg" }),
		})

		window.addEventListener("offline", () => {
			tileRef.current.setUrl("/map/{z}/{x}/{y}.png")
		})

		checkInternet()

	}, [])

	useEffect(() => {
		props.setters.firstJump(-1)
	}, [props.getters.placementType, props.getters.placementMode])

	const checkInternet = () => {
		if (navigator.onLine) {
			fetch("https://g.co", {
				mode: "no-cors"
			}).then(() => {
				tileRef.current.setUrl("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}")
			}).catch(() => {
				try {
					tileRef.current.setUrl("/map/{z}/{x}/{y}.png")
				} catch {}
			})
		} else {
			try {
				tileRef.current.setUrl("/map/{z}/{x}/{y}.png")
			} catch {}
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
		if (datatype == "unlim" || datatype == "time" || datatype == "turn") {
			datatype = "path"
		}
		let loc = { ...props.getters[datatype][idx], lat: event.target.getLatLng().lat, lng: event.target.getLatLng().lng, opacity: 0.5 }
		temp[idx] = loc
		set(temp)
		props.setters.pathSaved(false)
	}

	const handleClick = event => {
		console.log(props.getters.path)

		if (["disabled", "distance"].includes(props.getters.placementMode) || ["jump"].includes(props.getters.placementType)) {
			return
		}
		if (props.getters.placementType) {
			let get = props.getters.path
			let set = props.setters.path

			props.setters.pathSaved(false);

			if (props.getters.placementMode === "push" || (props.getters.placementMode === "insert" && get.length < 2)) {
				let temp = get.slice()
				let point = { lat: event.latlng.lat, lng: event.latlng.lng, opacity: 0.5, num: get.length + 1, cmd: Commands[props.getters.placementType] }
				temp.push(point)
				set(temp)
			} else if (props.getters.placementMode === "insert") {
				const getPerpendicularDistance = (i) => {
					let first
					let second
					if (get[i]?.cmd === Commands.jump) {
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
				if (get[min]?.cmd === Commands.jump) {
					path = [...path.slice(0, min), { num: min + 1, lat: event.latlng.lat, lng: event.latlng.lng, opacity: 0.5, cmd: Commands[props.getters.placementType] }, ...(path.slice(min).map(point => ({ ...point, num: point.num + 1 })))]
				} else {
					path = [...path.slice(0, min + 1), { num: min + (get[0]?.num === 0 ? 1 : 2), lat: event.latlng.lat, lng: event.latlng.lng, opacity: 0.5, cmd: Commands[props.getters.placementType] }, ...(path.slice(min + 1).map(point => ({ ...point, num: point.num + 1 })))]
				}
				set(path)
			}
		}
	}

	const waypointClick = (key, datatype) => {
		if (props.getters.placementMode === "disabled") {
			return
		} else if (["push", "insert"].includes(props.getters.placementMode)) {
			if (datatype === "unlim" || datatype === "turn" || datatype === "time" || datatype === "path") {
				if (props.getters.firstJump === -1) {
					props.setters.firstJump(key)
				} else {
					let path = props.getters.path.slice()
					let point = { num: props.getters.firstJump + 1, cmd: Commands.jump, p1: key + (key < props.getters.firstJump ? 0 : 1), p2: 999 }
					props.setters.path([...path.slice(0, props.getters.firstJump).map(p => {
						if (p.cmd == Commands.jump) {
							if (p.p1 > props.getters.firstJump) {
								p.p1 += 1
							}
						}

						return p
					}), point, ...path.slice(props.getters.firstJump, path.length).map(p => {
						p.num += 1
						if (p.p1 > props.getters.firstJump) {
							p.p1 += 1
						}
						return p
					})])
					props.setters.firstJump(-1)
					props.setters.pathSaved(false)
				}
			}
		} else if (props.getters.placementMode === "distance") {
			if (props.getters.firstPoint === -1) {
				props.setters.firstPoint(key)
				props.setters.currentDistance(-1)
			} else {
				let fromLatLng = L.latLng(props.getters.path[props.getters.firstPoint - 1])
				let toLatLng = L.latLng(props.getters.path[key - 1])
				props.setters.currentDistance(fromLatLng.distanceTo(toLatLng))
				props.setters.firstPoint(-1)
			}
		}
	}

	const popup = (latlng, key, datatype, popupMenu, draggable) => {
		return (
			<Marker
				datatype={datatype}
				icon={icons[datatype]}
				position={latlng}
				eventHandlers={{
					dragend: (event) => { handleMove(event, key - (props.getters.path[0].num === 0 ? 0 : 1), datatype) },
					click: () => {
						waypointClick(key, datatype)
					}
				}}
				onkeydown={event => handleKeyPress(event, key)}
				draggable={draggable}
				datatype={datatype}
				opacity={latlng.opacity}
			>
				<Tooltip>
					{"#" + key + ": " + props.display[datatype][0]} ({latlng.lat.toFixed(8)}, {latlng.lng.toFixed(8)}{latlng.alt ? ", " + latlng.alt.toFixed(2) + " ft" : null})
				</Tooltip>
				{popupMenu ?
					<Popup>
						{popupMenu}
					</Popup>
				: null}
			</Marker>
		)
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

	const MarkerPopup = ({ marker, i, datatype }) => {
		return (
			<div>
				{datatype !== "jump" && <div>
					<br />
					Latitude
					<Box style={{ "width": "12em", "margin-right": "4em", "height": "3em" }} editable={true} placeholder={"---"} content={marker?.lat} onChange={v => signedFloatValidation(v, marker.lat, (k) => {
						let path = props.getters.path
						props.setters.path([...path.slice(0, i), { ...marker, lat: k }, ...path.slice(i + 1)])
						props.setters.pathSaved(false)
					})} />
					<br />
					Longitude
					<Box style={{ "width": "12em", "margin-right": "4em", "height": "3em" }} editable={true} placeholder={"---"} content={marker?.lng} onChange={v => signedFloatValidation(v, marker.lng, (k) => {
						let path = props.getters.path
						props.setters.path([...path.slice(0, i), { ...marker, lng: k }, ...path.slice(i + 1)])
						props.setters.pathSaved(false)
					})} />
					<br />
					Altitude (feet)
					<Box style={{ "width": "12em", "margin-right": "4em", "height": "3em" }} editable={true} placeholder={"---"} content={marker?.alt} onChange={v => signedFloatValidation(v, marker.alt, (k) => {
						let path = props.getters.path
						props.setters.path([...path.slice(0, i), { ...marker, alt: k }, ...path.slice(i + 1)])
						props.setters.pathSaved(false)
					})} />
					{datatype !== "path" && <div>
						{datatype === "turn" && <div>
							<br />
							# of Turns
							<Box style={{ "width": "12em", "margin-right": "4em", "height": "3em" }} editable={true} placeholder={"---"} content={marker?.p1} onChange={v => positiveSignedIntValidation(v, marker.p1, (k) => {
								let path = props.getters.path
								props.setters.path([...path.slice(0, i), { ...marker, p1: k }, ...path.slice(i + 1)])
								props.setters.pathSaved(false)
							})} />
						</div>}
						{datatype === "time" && <div>
							<br />
							Time (seconds)
							<Box style={{ "width": "12em", "margin-right": "4em", "height": "3em" }} editable={true} placeholder={"---"} content={marker?.p1} onChange={v => positiveSignedIntValidation(v, marker.p1, (k) => {
								let path = props.getters.path
								props.setters.path([...path.slice(0, i), { ...marker, p1: k }, ...path.slice(i + 1)])
								props.setters.pathSaved(false)
							})} />
						</div>}
						<br />
						Radius (feet)
						<Box style={{ "width": "12em", "margin-right": "4em", "height": "3em" }} editable={true} placeholder={"---"} content={marker?.p3} onChange={v => signedFloatValidation(v, marker.p3, (k) => {
							let path = props.getters.path
							props.setters.path([...path.slice(0, i), { ...marker, p3: k }, ...path.slice(i + 1)])
							props.setters.pathSaved(false)
						})} />
					</div>}
				</div>}
				{datatype === "jump" && <div>
					<br />
					Jump From
					<Box style={{ "width": "12em", "margin-right": "4em", "height": "3em" }} editable={false} placeholder={"---"} content={i} onChange={v => positiveSignedIntValidation(v, marker.p0, (k) => {
						let path = props.getters.path
						props.setters.path([...path.slice(0, i), {...marker, p0: k}, ...path.slice(i + 1)])
						props.setters.pathSaved(false)
					})} />
					<br />
					Jump To
					<Box style={{ "width": "12em", "margin-right": "4em", "height": "3em" }} editable={true} placeholder={"---"} content={marker?.p1} onChange={v => positiveSignedIntValidation(v, marker.p1, (k) => {
						let path = props.getters.path
						props.setters.path([...path.slice(0, i), { ...marker, p1: k }, ...path.slice(i + 1)])
						props.setters.pathSaved(false)
					})} />
					<br />
					Repeat
					<Box style={{ "width": "12em", "margin-right": "4em", "height": "3em" }} editable={true} placeholder={"---"} content={marker?.p2} onChange={v => positiveSignedIntValidation(v, marker.p2, (k) => {
						let path = props.getters.path
						props.setters.path([...path.slice(0, i), { ...marker, p2: k}, ...path.slice(i + 1)])
						props.setters.pathSaved(false)
					})} />
				</div>}
				<br />
				<Button style={{ "margin-top": "0.5em" }} color={red} onClick={() => {
					const map = (p, j) => {
						if (p == null) {
							return null
						}
						if (p.cmd === Commands.jump) {
							if (p.num == j + 2) { // if starting point of jump is at waypoint to be deleted
								return null
							} else if (p.p1 > j + 1) {
								return { ...p, p1: p.p1 - 1, cmd: p.cmd, num: p.num - (p.num > j+1 ? 1 : 0) }
							} else if (p.p1 == j + 1) { // if destination of jump is to waypoint to be deleted
								return null // marked for deletion
							}
						}

						return { ...p, num: (p.num > j+1 ? p.num - 1 : p.num) }
					}

					const _delete = (_p, k) => {
						return [..._p.slice(0, k).map((p) => { return map(p, k) }), ..._p.slice(k + 1).map((p) => { return map(p, k) })]
					}
					let p = _delete(props.getters.path, i)

					// check for nulls that need to be deleted
					let hasNoNull = false
					while (!hasNoNull) {
						let hadNull = false
						for (let j = 0; j < p.length; j++) {
							if (p[j] == null) {
								p = _delete(p, j)
								let k = j
								while (p[k]?.cmd == Commands.jump || p[k] == null) {
									p = _delete(p, k)
								}
								hadNull = true
								break
							}
						}

						if (!hadNull) {
							hasNoNull = true
						}
					}

					props.setters.path(p)
					props.setters.pathSaved(false)
				}}>
					Delete
				</Button>
			</div>
		)
	}

	return (
		<div>
			<MapContainer
				center={state.latlng}
				length={4}
				onClick={handleClick}
				ref={mapRef}
				zoom={16.5}
				zoomSnap={0.5}
				wheelPxPerZoomLevel={120}
				style={{ height: "100%" }}
			>
				<TileLayer
					attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
					url={"/map/{z}/{x}/{y}.png"}
					ref={tileRef}
					maxNativeZoom={18}
					maxZoom={22}
				/>
				<ClickLocation />
				<LayersControl position="topright">
					{ /* Need for SUAS: geofence, airdrop, uav, waypoint */ }
					<LayersControl.Overlay checked name={props.display.flightBoundary[1]}>
						<LayerGroup>
							<Polyline positions={circle(props.getters.flightBoundary)} color="#000000" weight={4} />
							{props.getters.flightBoundary.map((marker, index) => {
								return popup(marker, index, "flightBoundary")
							})}
						</LayerGroup>
					</LayersControl.Overlay>
					<LayersControl.Overlay checked name={props.display.airdropBoundary[1]}>
						<LayerGroup>
							<Polyline positions={circle(props.getters.airdropBoundary)} color="#ee7313" weight={3} />
							{props.getters.airdropBoundary.map((marker, index) => {
								return popup(marker, index, "airdropBoundary")
							})}
						</LayerGroup>
					</LayersControl.Overlay>
					<LayersControl.Overlay checked name={props.display.uav[1]}>
						{props.getters.uav.heading == null ? null : (
							<LayerGroup>
								<RotatedMarker icon={icons.uavDirection} position={props.getters.uav.latlng} rotationAngle={props.getters.uav.heading} rotationOrigin={"50% 100%"} />
								<Marker datatype="uav" icon={icons.uav} position={props.getters.uav.latlng}>
									<Tooltip>
										UAV ({props.getters.uav.latlng.lat.toFixed(5)}, {props.getters.uav.latlng.lng.toFixed(5)})
									</Tooltip>
								</Marker>
								<RotatedMarker icon={icons.uavDirectionOutline} position={props.getters.uav.latlng} rotationAngle={props.getters.uav.heading} rotationOrigin={"50% 100%"} />
							</LayerGroup>
						)}
					</LayersControl.Overlay>
					<LayersControl.Overlay checked name={props.display.home[1]}>
						{props.getters.home.lat == null ? null : (
							<LayerGroup>
								<Marker datatype="home" icon={icons.home} position={props.getters.home}>
									<Tooltip>
										Home ({props.getters.home.lat.toFixed(5)}, {props.getters.home.lng.toFixed(5)})
									</Tooltip>
								</Marker>
							</LayerGroup>
						)}
					</LayersControl.Overlay>
					<LayersControl.Overlay name={props.display.water[1]}>
						{props.getters.water.lat == null ? null : (
							<LayerGroup>
								<Marker datatype="water" icon={icons.water} position={props.getters.water}>
									<Tooltip>
										Water ({props.getters.water.lat.toFixed(5)}, {props.getters.water.lng.toFixed(5)})
									</Tooltip>
								</Marker>
							</LayerGroup>
						)}
					</LayersControl.Overlay>
					<LayersControl.Overlay checked name={props.display.path[1]}>
						<LayerGroup>
							<PolylineDecorator layer="Waypoints" positions={props.getters.path.filter(marker => marker.cmd !== Commands.jump)} color="#10336B" decoratorColor="#1d5cc2" />
							{props.getters.path.map((marker, i) => {

								if (marker.cmd === Commands.jump) {
									let j = i - 1
									if (!props.getters.path[i - 1].lat) {
										while (j >= 0 && !props.getters.path[j].lat) {
											j--
										}
									}
									return (
										<>
											<PolylineDecorator layer="Waypoints" positions={[props.getters.path[j], props.getters.path[marker.p1 - 1]]} color="#17e3cb" decoratorColor="#61e8d9" />
											{popup({...marker, lng: (props.getters.path[j].lng + props.getters.path[marker.p1 - 1].lng)/2, lat: (props.getters.path[j].lat + props.getters.path[marker.p1 - 1].lat)/2}, marker.num, "jump", (
												<div>
													<h5>#{i + 1}: Jump</h5>
													{MarkerPopup({marker: marker, i: i, datatype: "jump"})}
												</div>
											), false)}
										</>
									)
								} else if (marker.cmd === Commands.unlimLoiter) {
									return popup(marker, marker.num, "unlim", (
										<div>
											<h5>#{i + 1}: Unlimited Loiter</h5>
											{MarkerPopup({marker: marker, i: i, datatype: "unlim"})}
										</div>
									), true)
								} else if (marker.cmd === Commands.turnLoiter) {
									return popup(marker, marker.num, "turn", (
										<div>
											<h5>#{i + 1} Turn Loiter</h5>
											{MarkerPopup({marker: marker, i: i, datatype: "turn"})}
										</div>
									), true)
								} else if (marker.cmd === Commands.timeLoiter) {
									return popup(marker, marker.num, "time", (
										<div>
											<h5>#{i + 1}: Time Loiter</h5>
											{MarkerPopup({marker: marker, i: i, datatype: "time"})}
										</div>
									), true)
								}

								return popup(marker, marker.num, "path", (
									<div>
										<h6>#{i + 1}: Mission Path Waypoint</h6>
										{MarkerPopup({marker: marker, i: i, datatype: "path"})}
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