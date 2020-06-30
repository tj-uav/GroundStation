import React, { useState, useEffect } from 'react';
import axios from 'axios'

const Submissions = () => {

  const [submissions, setSubmissions] = useState([]);

  const get = async (endpoint, func) => {
    axios.get(endpoint, {
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    }).then(function (response) {
      func(response);
    });
  }

  useEffect(() => {
    const interval = setInterval(() => {
      get('/odlcs/all/all', (response) => {
        console.log(response);
      })
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ "marginLeft": 20 }}>
      Submissions page
    </div>
  )
}

export default Submissions;