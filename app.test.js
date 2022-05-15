import supertest from 'supertest';
import app from './app.js'
import request from 'supertest'
const API_KEY = process.env.API_KEY;
describe('GET /', () => {

    it('it should get the weather currently in Toronto and return status code of 200', async () => {
        const response =  await request(app).get("/").query({"location": "Toronto"})
        expect(response.statusCode).toBe(200)
        expect(response.body.location).toBe("Toronto, Canada")

  
    })

    it("it should get the latest database weather information if same city is called twice within 20 mins", async() => {
        const response =  await request(app).get("/").query({"location": "Toronto"})
        const response2 =  await request(app).get("/").query({"location": "Toronto"})

    })
  
})