import'dotenv/config';
import express from 'express';
import axios from'axios';
import pool from"./db/db.js";
import res from'express/lib/response.js';

const port = 3000;
const API_KEY = process.env.API_KEY;
const app = express();


const fetchRecentWeather = async (location) => {
  console.log("location", location)
  try{
    let response = await axios.get(`https://api.worldweatheronline.com/premium/v1/weather.ashx?key=${API_KEY}&q=${location}&format=json&extra=localObsTime`)
   return(
      {
        "location":response.data.data.request[0].query,
        "temperature" : response.data.data.current_condition[0].temp_C,
        "observation_time": new Date(),
        "description": response.data.data.current_condition[0].weatherDesc[0].value,
    }
      )

    } catch(error) {
      console.log("error is city", error)
      throw Error(error)

  }
}

//returns most recent weather entry
const previousCityWeatherEntry = async (location) => {
  try{
    const recentCityWeather = await pool.query(
      "SELECT * FROM weather_location WHERE location = $1 ORDER BY observation_time DESC",
      [location]
    )

    return recentCityWeather.rows[0];
  } catch (e) {
    console.log("Error" , e)
    throw Error(e)

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
    throw Error(e)

  }
}


app.get('/', async (req, res) => {
  console.log('req', req)
  try{

    //better way of getting the proper city string would be to format it prior to calling the api, to lessen load on the api. If format the city string, can check db directly instead of calling api to format the city string for us
    
    let updatedWeatherData = await fetchRecentWeather(req.query.location);
    console.log("update", updatedWeatherData)
    let previousCityWeather = await previousCityWeatherEntry(updatedWeatherData.location);
    console.log("prev", previousCityWeather)
    
    //check if the db found any weather for that city before, if so, continue 
    if(previousCityWeather) {
      let currentDataTime = new Date(updatedWeatherData.observation_time)
      let lastDataTime = new Date(previousCityWeather.observation_time)
      const diffSeconds = Math.abs(currentDataTime - lastDataTime)/1000/60;

      // check if previous data was from longer than 20s ago and return that previous data if it is, if not add updated weather and send it back to client
      if(diffSeconds <= 20) {
        res.status(200)
        res.send(previousCityWeather)
        return;
     }
    }
      await addUpdatedWeather(updatedWeatherData)
      res.status(200)
      res.send(updatedWeatherData)
      return;
  } catch(e) {
    console.log("error", e)
    throw Error(e)
  }
});


app.listen(port, () =>
  console.log(`Example app listening on port ${port}!`),
);

export default app;