import React, { useContext, useEffect, useState } from "react"

const BackendConnection = React.createContext()

export function useBackendConnection() {
	return useContext(BackendConnection)
}

export function GlobalsProvider({ children }) {
	const [backendConnection, setBackendConnection] = useState("http://localhost:5000")
	return (
		<BackendConnection.Provider value={{ backendConnection, setBackendConnection }}>
			{children}
		</BackendConnection.Provider>
	)
}
