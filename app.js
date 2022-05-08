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


const addUpdatedWeather = async (updatedWeatherData) => {
  try{
    const weatherInsertResponse = await pool.query(
      "INSERT INTO weather_location (location, temperature, observation_time, description) VALUES ($1, $2, $3, $4);",
      [updatedWeatherData.location, updatedWeatherData.temperature, updatedWeatherData.observation_time, updatedWeatherData.description]
    )
    return weatherInsertResponse;
  } catch (e) {
    console.log("error" , e)
  }
}


app.get('/', async (req, res) => {

  try{

    //better way of getting the proper city string would be to format it prior to calling the api, to lessen load on the api. If format the city string, can check db directly instead of calling api to format the city string for us
    
    let updatedWeatherData = await fetchRecentWeather(req.query.location);
    let previousCityWeather = await checkRecentWeather(updatedWeatherData.location);
    

    //check if the db found any weather for that city before, if so, continue 
    if(previousCityWeather.length) {
      let currentDataTime = new Date(updatedWeatherData.observation_time)
      let lastDataTime = new Date(previousCityWeather[0].observation_time)
      const diffSeconds = Math.abs(currentDataTime - lastDataTime)/1000;

      // check if previous data was from longer than 20mins ago and return that previous data if it is, if not add updated weather and send it back to client
      diffSeconds <= 20 ? res.send(previousCityWeather) : null;

     }
      await addUpdatedWeather(updatedWeatherData)
      res.send(updatedWeatherData)
  } catch(e) {
    console.log("error", e)
  }
});


app.listen(port, () =>
  console.log(`Example app listening on port ${port}!`),
);