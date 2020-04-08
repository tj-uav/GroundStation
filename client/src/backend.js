import axios from 'axios'

const get = async (endpoint, func) => {
    axios.get(endpoint, {
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    }).then(function(response){
        func(response);
    });
}

const load = (filetype) => {
    console.log("Loading " + filetype);
    return [[50, 60], [70, 80]]
}


export { get, load };