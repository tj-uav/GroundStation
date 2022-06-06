import { useEffect } from "react"

const useInterval = (ms, callback) => {
	useEffect(() => {
		const tick = setInterval(() => {
			callback()
		}, ms)
		return () => clearInterval(tick)
	}, [])
}

export { useInterval }