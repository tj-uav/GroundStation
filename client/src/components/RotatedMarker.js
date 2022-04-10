import React, { useEffect } from "react"
import L from "leaflet"
import { useLeafletContext } from "@react-leaflet/core"
import "leaflet-rotatedmarker"

const RotatedMarker = ({ icon, position, rotationAngle, rotationOrigin }) => {
    const context = useLeafletContext()

    useEffect(() => {
        const marker = new L.marker(position, {
            rotationAngle: rotationAngle/2, // off by a factor of two for god knows what reason
            rotationOrigin: rotationOrigin,
            icon: icon
        })
        const container = context.layerContainer || context.map

        container.addLayer(marker)

        return () => {
            container.removeLayer(marker)
        }
    }, [position, rotationAngle])

    return (
        <div />
    )
}

export default RotatedMarker