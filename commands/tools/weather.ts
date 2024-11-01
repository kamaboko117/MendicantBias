import { EmbedBuilder, SlashCommandBuilder } from "@discordjs/builders";
import dotenv from "dotenv";
import GuildCommandInteraction from "../../classes/GuildCommandInteraction";
import { Mendicant } from "../../classes/Mendicant";
dotenv.config({ path: "./.env" });
const key = process.env.WEATHER;
const MAPBOX_BASE = "https://api.mapbox.com/geocoding/v5/mapbox.places/";
const WEATHER_BASE = "https://api.openweathermap.org/data/2.5/weather";

interface IWeather {
  currentTemp: number;
  description: string;
  feelsLike: number;
  humidity: number;
  windSpeed: string;
  windDirection: string;
}

interface IPlace {
  city: string;
  state: string;
  country: string;
}

const getGeocode = async (location: string) => {
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

const getWindDirection = (degrees: number) => {
  if (degrees >= 337.5 || degrees < 22.5) return "N⬆️";
  if (degrees >= 22.5 && degrees < 67.5) return "NE↗️";
  if (degrees >= 67.5 && degrees < 112.5) return "E➡️";
  if (degrees >= 112.5 && degrees < 157.5) return "SE↘️";
  if (degrees >= 157.5 && degrees < 202.5) return "S⬇️";
  if (degrees >= 202.5 && degrees < 247.5) return "SW↙️";
  if (degrees >= 247.5 && degrees < 292.5) return "W⬅️";
  if (degrees >= 292.5 && degrees < 337.5) return "NW↖️";
  return "ERROR";
};

const MPStoKPH = (mps: number) => {
  return mps * 3.6;
};

const getWeather = async (location: string) => {
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
  const windSpeed = MPStoKPH(weatherResult.wind.speed).toFixed(2);
  const windDirection = getWindDirection(weatherResult.wind.deg);

  return [
    { currentTemp, description, feelsLike, humidity, windSpeed, windDirection },
    placeName,
  ];
};

export default {
  data: new SlashCommandBuilder()
    .setName("weather")
    .setDescription("Gets the weather for a location")
    .addStringOption((option) =>
      option.setName("location").setDescription("location").setRequired(true)
    ),

  async execute(interaction: GuildCommandInteraction, mendicant: Mendicant) {
    const option1 = interaction.options.getString("location");
    console.log(`${interaction.user.username} used /weather ${option1}`);

    const response = await getWeather(option1!);
    const weatherResult = response[0] as IWeather;
    const placeResult = response[1] as IPlace;
    let embed = new EmbedBuilder()
      .setTitle(`Weather for **${placeResult.country}, ${placeResult.city}**`)
      // set first letter to uppercase
      .setDescription(
        weatherResult.description.charAt(0).toUpperCase() +
          weatherResult.description.slice(1)
      )
      .setColor(mendicant.color)
      .addFields([
        {
          name: "Current Temperature:",
          value: `${weatherResult.currentTemp}°C`,
        },
        {
          name: "Feels like:",
          value: `${weatherResult.feelsLike}°C`,
        },
        {
          name: "Humidity:",
          value: `${weatherResult.humidity}%`,
        },
        {
          name: "Wind:",
          value: `${weatherResult.windSpeed}km/h ${weatherResult.windDirection}`,
        },
      ]);

    await interaction.reply({
      embeds: [embed],
    });
  },

  // usage: 'Use carefully: Yellow Members might endure the consequences of this action'
};
