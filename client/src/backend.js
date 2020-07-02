import axios from "axios"

const httpget = async (endpoint, func) => {
	axios
		.get(endpoint, {
			headers: { "Content-Type": "application/json", Accept: "application/json" },
		})
		.then(function (response) {
			func(response)
		})
}

export { httpget }
