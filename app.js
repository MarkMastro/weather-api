import 'dotenv/config'
import express from 'express';
import axios from 'axios';

const port = 3000;
const API_KEY = process.env.API_KEY;

const app = express();

// const callApi = async (location)=>{
//   try{
//     const {data} = await axios.get(`https://api.worldweatheronline.com/premium/v1/weather.ashx?key=${API_KEY}&q=${location}&format=json`)
//     return data.data.current_condition[0].temp_C
//     } catch(error) {
//       console.log("error is ", error)
//   }
// }

app.get('/', (req, res) => {
  try{
    axios.get(`https://api.worldweatheronline.com/premium/v1/weather.ashx?key=${API_KEY}&q=${req.query.location}&format=json`)
    .then(response=> res.send(response.data.data.current_condition[0]))
    
    } catch(error) {
      console.log("error is ", error)
  }
});


app.listen(port, () =>
  console.log(`Example app listening on port ${port}!`),
);