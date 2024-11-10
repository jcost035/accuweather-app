const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();

const port = 3000;

app.get('/weather', async (req, res) => {
    
    const city = req.query.city;
    if (!city) {
        return res.json({ message: 'Please provide a city name.' });
    }

    try {
        // Get location key from API
        const locationKeyResponse = await axios.get('http://dataservice.accuweather.com/locations/v1/cities/search', {
            params: {
                apikey: process.env.ACCUWEATHER_API_KEY,
                q: city
            }
        });

        const locationKey = locationKeyResponse.data[0]?.Key;

        if (!locationKey) {
            return res.json({ message: 'City not found.' });
        }

        // Get weather data using location key
        const weatherResponse = await axios.get('http://dataservice.accuweather.com/currentconditions/v1/${locationKey}', {
            params: {
                apikey: process.env.ACCUWEATHER_API_KEY,
                details: true
            }
        });

        const weather = weatherResponse.data[0];
        res.json({ 
            message: 'The weather in ${city} is ${weather.WeatherText} with a temperature of ${weather.Temperature.Imperial.Value}°F',
            weatherText: weather.WeatherText,
            tempF: weather.Temperature.Imperial.Value,
            tempC: weather.Temperature.Metric.Value,
            wind: weather.Wind.Speed.Imperial.Value,
            gust: weather.WindGust.Speed.Imperial.Value,
            UVIndex: weather.UVIndexText,
            isDayTime: weather.IsDayTime,
            location: locationKeyResponse.data[0]?.EnglishName
        });
    } 
    catch (error) {
        res.json({ message: 'Error fetching weather data' });
    }
});

app.get('/autocomplete', async (req, res) => {
    const query = req.query.query;
    if (!query) {
        return res.json([]);
    }

    try {
        const response = await axios.get('http://dataservice.accuweather.com/locations/v1/cities/autocomplete', {
            params: {
                apikey: process.env.ACCUWEATHER_API_KEY,
                q: query
            }
        });

        res.json(response.data);
    } catch (error) {
        res.json([]);
    }
});

app.get('/dummyweather', async (req, res) => {

    res.json({ 
        message: 'The weather in city is vibes',
        weatherText: "Chill vibes in the air",
        tempF: 79,
        tempC: 27,
        wind: 12,
        gust: 2000,
        UVIndex: "Epic",
        location: "Miamiville"
    });

});

app.get('/', (req, res) => {
    res.sendFile('index.html', {root: __dirname});     
                                                        
});

app.listen(port, () => {
    console.log('Now listening on port ${port}'); 
});

