//city data provided by worldcities.com

import cityData from "./worldcities.csv";
//just import the form variable from UI
import weatherKeys from "./city.list.json";
import { utcToZonedTime } from "date-fns-tz";

const data = (function () {
  const locationData = (function () {
    let data = cityData;

    let cities = [];
    let cityAlts = [];
    let countries = [];
    let countryCodes = [];
    let states = [
      "Alabama",
      "Alaska",
      "Arizona",
      "Arkansas",
      "California",
      "Colorado",
      "Connecticut",
      "Delaware",
      "District of Columbia",
      "Florida",
      "Georgia",
      "Hawaii",
      "Idaho",
      "Illinois",
      "Indiana",
      "Iowa",
      "Kansas",
      "Kentucky",
      "Louisiana",
      "Maine",
      "Maryland",
      "Massachusetts",
      "Michigan",
      "Minnesota",
      "Mississippi",
      "Missouri",
      "Montana",
      "Nebraska",
      "Nevada",
      "New Hampshire",
      "New Jersey",
      "New Mexico",
      "New York",
      "North Carolina",
      "North Dakota",
      "Ohio",
      "Oklahoma",
      "Oregon",
      "Pennsylvania",
      "Rhode Island",
      "South Carolina",
      "South Dakota",
      "Tennessee",
      "Texas",
      "Utah",
      "Vermont",
      "Virginia",
      "Washington",
      "West Virginia",
      "Wisconsin",
      "Wyoming",
    ];
    let stateCodes = [
      "AL",
      "AK",
      "AZ",
      "AR",
      "CA",
      "CO",
      "CT",
      "DE",
      "DC",
      "FL",
      "GA",
      "HI",
      "ID",
      "IL",
      "IN",
      "IA",
      "KS",
      "KY",
      "LA",
      "ME",
      "MD",
      "MA",
      "MI",
      "MN",
      "MS",
      "MO",
      "MT",
      "NE",
      "NV",
      "NH",
      "NJ",
      "NM",
      "NY",
      "NC",
      "ND",
      "OH",
      "OK",
      "OR",
      "PA",
      "RI",
      "SC",
      "SD",
      "TN",
      "TX",
      "UT",
      "VT",
      "VA",
      "WA",
      "WV",
      "WI",
      "WY",
    ];

    for (let entry of data) {
      cities.push(entry.city_ascii);
      cityAlts.push(entry.city);
      if (countries.indexOf(entry.country) === -1) {
        countries.push(entry.country);
        countryCodes.push(entry.iso2);
      }
    }

    return {
      data,
      cities,
      cityAlts,
      countries,
      countryCodes,
      states,
      stateCodes,
    };
  })();

  function getFormData() {
    const INPUT_FIELDS = 3;
    let inputs = document.getElementsByTagName("input");
    let formData = [];
    for (let i = 0; i < INPUT_FIELDS; i++) {
      if (inputs[i] === "submit") break;
      else formData[i] = inputs[i].value;
    }
    return formData;
  }

  function matchID(formData) {
    let ID;
    let altName =
      locationData.cityAlts[locationData.cities.indexOf(formData[0])];
    let stateID =
      locationData.stateCodes[locationData.states.indexOf(formData[1])];

    if (formData[0] && formData[1] !== "N/A" && formData[2]) {
      if (formData[2] !== "United States") ID = "ERROR";

      for (let entry of weatherKeys) {
        if (
          entry.country === "US" &&
          entry.name === formData[0] &&
          entry.state === stateID
        )
          ID = entry.id;
        else if (
          entry.country === "US" &&
          entry.name === altName &&
          entry.state === stateID
        )
          ID = entry.id;
      }
    } else if (formData[0] && formData[2] && formData[1] === "N/A") {
      let country_ID =
        locationData.countryCodes[locationData.countries.indexOf(formData[2])];

      for (let entry2 of weatherKeys) {
        if (entry2.country === country_ID && entry2.name === formData[0])
          ID = entry2.id;
        else if (entry2.country === country_ID && entry2.name === altName)
          ID = entry2.id;
      }
    }

    if (!Number.isInteger(ID)) ID = "ERROR";

    return ID;
  }

  function WeatherData(
    city,
    country,
    temp,
    max,
    min,
    feelsLike,
    sunset,
    sunrise,
    timezone,
    weather,
    sub,
    src
  ) {
    this.city = city;
    this.country = country;
    this.temp = temp;
    this.max = max;
    this.min = min;
    this.feelsLike = feelsLike;
    this.sunset = sunset;
    this.sunrise = sunrise;
    this.timezone = timezone;
    this.weather = weather;
    this.sub = sub;
    this.imgSrc = src;
  }

  function getWeatherData(formData) {
    if (!formData) formData = getFormData();
    let city_ID = matchID(formData);
    return fetch(
      `https://api.openweathermap.org/data/2.5/weather?id=${city_ID}&appid=37ea418809aa56c31726ace0173d68da`,
      { mode: "cors" }
    )
      .then((response) => response.json())
      .then((response) => {
        console.log(response);

        let weatherData = new WeatherData(
          response.name,
          response.sys.country,
          response.main.temp,
          response.main.temp_max,
          response.main.temp_min,
          response.main.feels_like,
          new Date(response.sys.sunset * 1000),
          new Date(response.sys.sunrise * 1000),
          "",
          response.weather[0].main,
          response.weather[0].description,
          `http://openweathermap.org/img/wn/${response.weather[0].icon}@2x.png`
        );

        console.log(weatherData);

        return getTimeZone(response.coord.lat, response.coord.lon, weatherData);
      })
      .catch((err) => {
        alert('City not found, please enter a valid city.');
        console.error(err);
        location.reload();

      });
  }

  function getTimeZone(latitude, longitude, weatherData) {
    return fetch(
      `https://api.timezonedb.com/v2.1/get-time-zone?key=O0TVTNRS9DFL&format=json&by=position&lat=${latitude}&lng=${longitude}`,
      { mode: "cors" }
    )
      .then((response) => response.json())
      .then((response) => {
        console.log(response);
        weatherData.timezone = response.zoneName;

        //edit sundata
        weatherData.sunrise = getTime(
          weatherData.timezone,
          weatherData.sunrise
        );

        weatherData.sunset = getTime(weatherData.timezone, weatherData.sunset);

        return weatherData;
      })
      .catch((err) => {
        console.error(err);
      });
  }

  function getTime(timezone, time) {
    if (!time) {
      time = new Date();
    }

    console.log(time);

    let localTime = utcToZonedTime(time.toISOString(), timezone);

    let timeData = {
      year: localTime.getFullYear(),
      month: localTime.getMonth() + 1,
      date: localTime.getDate(),
      hour: localTime.getHours(),
      minutes: localTime.getMinutes(),
      seconds: localTime.getSeconds(),
      ampm: "",
    };

    if (timeData.hour > 11) {
      timeData.hour -= 12;
      timeData.ampm = "PM";
    } else timeData.ampm = "AM";

    if (!timeData.hour) timeData.hour = 12;

    if (!Math.floor(timeData.minutes / 10))
      timeData.minutes = "0" + timeData.minutes;

    console.log(localTime);
    console.log(timeData);

    return timeData;
  }

  return {
    locationData,
    getWeatherData,
    getTime,
  };
})();

export default data;
