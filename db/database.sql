CREATE DATABASE weather_db;

CREATE TABLE weather_location(
     weather_id SERIAL PRIMARY KEY, 
     location TEXT,
     temperature VARCHAR(3),
     observation_time TIMESTAMP NOT NULL, 
     description TEXT
);