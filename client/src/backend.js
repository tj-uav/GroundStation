import axios from "axios"

import { useBackendConnection } from "./GlobalSettings"

const httpget = async (url, endpoint, func, error) => {
    try {
        console.log("httpget", url + endpoint)
        const response = await axios.get(url + endpoint, {
            headers: { "Content-Type": "application/json", Accept: "application/json" },
        })
        if (func) func(response)
        return response
    } catch (e) {
        if(error) {
            error(e)
        }
    }
}

const httppost = async (url, endpoint, data, func) => {
    const response = await axios.post(url + endpoint, data)
    if (func) func(response)
    return response
}

export { httpget, httppost }
