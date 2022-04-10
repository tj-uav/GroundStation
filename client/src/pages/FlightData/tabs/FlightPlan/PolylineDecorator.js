import React, { useEffect } from "react"
import { useLeafletContext } from "@react-leaflet/core"
import L from "leaflet"
import "leaflet-polylinedecorator"

const PolylineDecorator = ({ color, positions, layer, ...props }) => {
	const context = useLeafletContext()

	const arrow = [
		{
			offset: "50%",
			repeat: 0,
			symbol: L.Symbol.arrowHead({
				pixelSize: 20,
				polygon: false,
				pathOptions: { stroke: true, color: props.color },
			}),
		},
	]

	useEffect(() => {
		const polyline = new L.Polyline(positions, {
			color: color
		})

		let temp = []
		let latlngs = polyline.getLatLngs()
		if (latlngs.length > 1) {
			for (let i of Array(latlngs.length - 1).keys()) {
				temp.push([latlngs[i], latlngs[i + 1]])
			}
		}
		const decorator = new L.polylineDecorator(temp, {
			patterns: arrow
		})

		const container = context.layerContainer || context.map

		container.addLayer(polyline)
		container.addLayer(decorator)

		return () => {
			container.removeLayer(polyline)
			container.removeLayer(decorator)
		}
	}, [positions])

	return (
		<div />
	)
}

export default PolylineDecorator
