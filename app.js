require('dotenv/config');
const express = require('express');
const axios = require('axios');
const pool = require("./db/db")

const port = 3000;
const API_KEY = process.env.API_KEY;
const app = express();

const fetchRecentWeather = async (location) => {
  try{
    let response = await axios.get(`https://api.worldweatheronline.com/premium/v1/weather.ashx?key=${API_KEY}&q=${location}&format=json&extra=localObsTime`)
   return(
      {
        "location":response.data.data.request[0].query,
        "temperature" : response.data.data.current_condition[0].temp_C,
        "observation_time": response.data.data.current_condition[0].localObsDateTime,
        "description": response.data.data.current_condition[0].weatherDesc[0].value,
        "feels_like": response.data.data.current_condition[0].FeelsLikeC
    }
      )
    } catch(error) {
      console.log("error is ", error)
  }
}

const checkRecentWeather = async (location) => {
  try{
    const recentCityWeather = await pool.query(
      "SELECT observation_time FROM weather_location WHERE location = $1",
      [location]
    )

    return recentCityWeather.rows;
  } catch (e) {
    console.log("Error" , e)
  }
}


app.get('/', async (req, res) => {

  try{
    let updatedData = await fetchRecentWeather(req.query.location);
    let recentCityWeather = await checkRecentWeather(updatedData.location);

    let currentDataTime = new Date(updatedData.observation_time)
    let lastDataTime = new Date(recentCityWeather[0].observation_time)
    const diffSeconds = Math.abs(currentDataTime - lastDataTime)/1000;

    diffSeconds <= 20 ? res.send(recentCityWeather) : 
    console.log("recentCityWeather", recentCityWeather[0].observation_time);


    res.send(updatedData)

  } catch(e) {
    console.log("error", e)
  }
});


app.listen(port, () =>
  console.log(`Example app listening on port ${port}!`),
);