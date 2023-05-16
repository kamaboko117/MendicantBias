import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { SlashCommandBuilder, EmbedBuilder } from "@discordjs/builders";
// const fetch = require("node-fetch");
const key = process.env.WEATHER;
const MAPBOX_BASE = "https://api.mapbox.com/geocoding/v5/mapbox.places/";
const WEATHER_BASE = "https://api.openweathermap.org/data/2.5/weather";

const getGeocode = async (location) => {
  const URL = `${MAPBOX_BASE}${location}.json?types=place&access_token=${process.env.GEOCODE}`;

  const geocodeList = await fetch(URL)
    .then((data) => data.json())
    .then((result) => result.features);

  // The coordinates of the feature’s center in the form [longitude,latitude]
  const coordinates = geocodeList[0].center;
  // The ternary operator prevents return of placeName in non-Latin letters (places with Japanese letters for example)
  const placeName = geocodeList[0].matching_text
    ? geocodeList[0].matching_text
    : geocodeList[0].text;
  // console.log(geocodeList[0]);
  const state = geocodeList[0].context[0].text;
  const country = geocodeList[0].context[1]
    ? geocodeList[0].context[1].text
    : geocodeList[0].context[0].text;

  return { coordinates, placeName, state, country };
};

const getWeather = async (location) => {
  const geocodeResult = await getGeocode(location);
  const [lon, lat] = geocodeResult.coordinates;
  // .split(/\b\s[Ss]hi\b/) cut off japanese city sufix ('Iwata Shi' == after split() ==> 'Iwata')
  const placeName = {
    city: geocodeResult.placeName.split(/\b\s[Ss]hi\b/)[0],
    state: geocodeResult.state,
    country: geocodeResult.country,
  };

  const URL = `${WEATHER_BASE}?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=metric&appid=${key}&units=metric`;

  const weatherResult = await fetch(URL)
    .then((data) => data.json())
    .then((result) => result);
  const currentTemp = weatherResult.main.temp;
  const feelsLike = weatherResult.main.feels_like;
  const description = weatherResult.weather[0].description;
  const humidity = weatherResult.main.humidity;

  return [{ currentTemp, description, feelsLike, humidity }, placeName];
};

export default {
  data: new SlashCommandBuilder()
    .setName("weather")
    .setDescription("Gets the weather for a location")
    .addStringOption((option) =>
      option.setName("location").setDescription("location").setRequired(true)
    ),

  async execute(interaction, client) {
    const option1 = interaction.options.getString("location");
    console.log(`${interaction.member.displayName} used /weather ${option1}`);

    const response = await getWeather(option1);
    let embed = new EmbedBuilder()
      .setTitle(`weather for **${response[1].country}, ${response[1].city}**`)
      .setDescription(response[0].description)
      .setColor(client.color)
      .addFields([
        {
          name: "Current Temperature:",
          value: `${response[0].currentTemp}°C`,
        },
        {
          name: "Feels like:",
          value: `${response[0].feelsLike}°C`,
        },
        {
          name: "Humidity:",
          value: `${response[0].humidity}%`,
        },
      ]);

    await interaction.reply({
      embeds: [embed],
    });
  },

  // usage: 'Use carefully: Yellow Members might endure the consequences of this action'
};
