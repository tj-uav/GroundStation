import axios from "axios"

// there will be a connection page which will be able to change this
// for now it stays constant
var url = "http://localhost:5000"

const httpget = async (endpoint, func, error) => {
    try {
        const response = await axios.get(url + endpoint, {
            headers: { "Content-Type": "application/json", Accept: "application/json" },
        })
        if (func) func(response)
        return response
    } catch (e) {
        if(error) {
            error(e)
        }
        if (e.response) {
            return {"error": e.response.status}
        }
    }
}

const httppost = async (endpoint, data, func) => {
    const response = await axios.post(url + endpoint, data)
    if (func) func(response)
    return response
}

const getUrl = () => {
    return url
}

const setUrl = (u) => {
    url = u;
}

export { httpget, httppost, getUrl, setUrl }
