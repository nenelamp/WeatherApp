const ddlUnits = document.querySelector("#ddlUnits");
const ddlDay = document.querySelector("#ddlDay");
const txtSearch = document.querySelector("#txtSearch");
const btnSearch = document.querySelector("#btnSearch");
const dvCityCountry = document.querySelector("#dvCityCountry"); 
const dvCurrDate = document.querySelector("#dvCurrDate"); 
const dvCurrTemp = document.querySelector("#dvCurrTemp"); 
const pFeelsLike = document.querySelector("#pFeelsLike"); 
const pHumidity = document.querySelector("#pHumidity"); 
const pWind = document.querySelector("#pWind"); 
const pPrecipitation = document.querySelector("#pPrecipitation"); 


let cityName, countryName, weatherData;


async function getGeoData() {
  let search = txtSearch.value;
  const url = `https://nominatim.openstreetmap.org/search?q=${search}&format=jsonv2&addressdetails=1`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    // console.log(result);
    let lat = result[0].lat;
    let lon = result[0].lon;

    LoadLocationData(result);
    getWeatherData(lat , lon);  
    

  } catch (error) {
    console.error(error.message);
  }
}


function LoadLocationData(LocationData) {  
  let Location = LocationData[0].address;
  cityName = Location.city;
  countryName = Location.country_code.toUpperCase();
  

   
  let dateoptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    weekday: "long",
  };

  let CurrDate = new Intl.DateTimeFormat("en-US", dateoptions).format(new Date());

  // console.log(cityName, countryName, date);

  dvCityCountry.textContent = `${cityName}, ${countryName}`;
  dvCurrDate.textContent = CurrDate;


}

async function getWeatherData(lat, lon) {
   let tempUnit = "celsius";
   let windUnit = "kmh";
   let precipUnit = "mm";

   // if toggle value = F
   if (ddlUnits.value === "F") {
    tempUnit = "fahrenheit";
    windUnit = "mph";
    precipUnit = "inch";
   }


  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,weather_code&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&wind_speed_unit=${windUnit}&temperature_unit=${tempUnit}&precipitation_unit=${precipUnit}`;
  // https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,weather_code&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&wind_speed_unit=mph&temperature_unit=fahrenheit&precipitation_unit=inch

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    weatherData = await response.json();
    console.log(weatherData);
    LoadCurrentWeather(weatherData);
    loadDailyForecast(weatherData);
    LoadHourlyForecast(weatherData);

  } catch (error) {
    console.error(error.message);
  }
}

function LoadCurrentWeather() {
  dvCurrTemp.textContent = `${Math.round(weatherData.current.temperature_2m)}`; 
  pFeelsLike.textContent = `${Math.round(weatherData.current.apparent_temperature)}°`;
  pHumidity.textContent = `${Math.round(weatherData.current.relative_humidity_2m)}%`;
  pWind.textContent = `${Math.round(weatherData.current.wind_speed_10m)} ${weatherData.current_units.wind_speed_10m.replace("mp/h", "mph")}`;
  pPrecipitation.textContent = `${weatherData.current.precipitation} ${weatherData.current_units.precipitation.replace("inches", "inch")}`;
  
}

function loadDailyForecast() {
 let daily = weatherData.daily
 for (let i = 0; i < 7; i++) {

    let date = new Date(daily.time[i]);
    let dayOfWeek = new Intl.DateTimeFormat("en-US", { weekday: "short"}).format(date);
    let dvForecastDay = document.querySelector(`#dvForecastDay${i + 1}`);
    let weatherCodeName = getWeatherCodeName(daily.weather_code[i]);
    let dailyHigh = Math.round(daily.temperature_2m_max[i]) + "°";
    let dailyLow = Math.round(daily.temperature_2m_min[i]) + "°";
    // console.log(dayOfWeek);
    // console.log(weatherCodeName);
    // console.log(dailyHigh);
    // console.log(dailyLow);

    while (dvForecastDay.firstChild) {
      dvForecastDay.removeChild(dvForecastDay.firstChild);
    }

    
    addDailyElement("p","daily_day-title", dayOfWeek, "", dvForecastDay, "afterbegin");
    addDailyElement("img","daily_day-icon", "", weatherCodeName,  dvForecastDay, "beforeend");
    addDailyElement("div","daily_day-temps", "", "", dvForecastDay, "beforeend");


    let dvDailyTemps = document.querySelector(`#dvForecastDay${i + 1} .daily_day-temps`);
    addDailyElement("p","daily_day-high", dailyHigh, "", dvDailyTemps, "afterbegin");
    addDailyElement("p","daily_day-low", dailyLow, "", dvDailyTemps, "beforeend");
 }

}

function addDailyElement(tag, className, content, weatherCodeName, parentElement, position) {
const newElement = document.createElement(tag);
newElement.setAttribute("class", className);
if (content !== "") {
  const newContent = document.createTextNode(content);
  newElement.appendChild(newContent);
}
if (tag === "img") {
  newElement.setAttribute("src", `/assets/images/icon-${weatherCodeName}.webp`);
  newElement.setAttribute("alt", weatherCodeName);
  newElement.setAttribute("width", "320");
  newElement.setAttribute("height", "320");


}
  parentElement.insertAdjacentElement(position, newElement);
}

function addHourlyElement(tag, className, content, weatherCodeName, parentElement, position) {
const newElement = document.createElement(tag);
newElement.setAttribute("class", className);
if (content !== "") {
  const newContent = document.createTextNode(content);
  newElement.appendChild(newContent);
}
if (tag === "img") {
  newElement.setAttribute("src", `/assets/images/icon-${weatherCodeName}.webp`);
  newElement.setAttribute("alt", weatherCodeName);
  newElement.setAttribute("width", "320");
  newElement.setAttribute("height", "320");

}
  parentElement.insertAdjacentElement(position, newElement);
}

function LoadHourlyForecast(Weather) {
  let dayIndex = parseInt(ddlDay.value, 10);

  console.log(`Day ${dayIndex + 1}`);
  let FirstHour = 24 * dayIndex;
  let LastHour = 24 * (dayIndex + 1) - 1;

  let weatherCodes = weatherData.hourly.weather_code;
  let temps = weatherData.hourly.temperature_2m;
  let hours = weatherData.hourly.time;
  let id = 1;

  for (let h = FirstHour; h <=   LastHour; h++) {
    console.log(`Hour ${h}`);
    let weatherCodeName = getWeatherCodeName(weatherCodes[h]);
    let temp = Math.round(temps[h])+ "°";
    let hour = new Date(hours[h]).toLocaleString("en-US", { hour: "numeric", hour12: true });
    console.log(hour, weatherCodeName, temp);

    let dvForecastHour = document.querySelector(`#dvForecastHour${id}`);

    while (dvForecastHour.firstChild) {
      dvForecastHour.removeChild(dvForecastHour.firstChild);
    }



    addDailyElement("img","hourly_hour-icon", "", weatherCodeName,  dvForecastHour, "afterbegin");
    addDailyElement("p","hourly_hour-time", hour, "", dvForecastHour, "beforeend");
    addDailyElement("p","hourly_hour-temp", temp, "", dvForecastHour, "beforeend");

    id++;
  }
}

function getHours() {
    for (let h = 0; h <=23; h++) {
      console.log(h);
  }
}

function getWeatherCodeName(code) {
  const weatherCodes = {
    0: "sunny",
    1: "partly-cloudy",
    2: "partly-cloudy",
    3: "overcast",
    45: "fog",
    48: "fog",
    51: "drizzle",
    53: "drizzle",
    55: "drizzle",
    56: "drizzle",
    57: "drizzle",
    61: "rain",
    63: "rain",
    65: "rain",
    66: "rain",
    67: "rain",
    80: "rain",
    81: "rain",
    82: "rain",
    71: "snow",
    73: "snow",
    75: "snow",
    77: "snow",
    85: "snow",
    86: "snow",
    95: "snow",
    96: "snow",
    99: "snow",
  };


  return weatherCodes[code];
}

function populateDayOfWeek() {

let currDate = new Date();
let currDay;
for( let i = 0; i < 7; i++) {

    currDay = new Intl.DateTimeFormat("en-US", {weekday: "long"}).format(currDate);

    const newOption = document.createElement("option");
    const dayOfWeek = document.createTextNode(currDay);
    newOption.setAttribute("class", "hourly_select-day");
    newOption.setAttribute("value", i);
    newOption.appendChild(dayOfWeek);

    ddlDay.insertAdjacentElement("beforeend", newOption);

    currDate.setDate(currDate.getDate() + 1);

  }
}

populateDayOfWeek();
getGeoData();


btnSearch.addEventListener("click", getGeoData );
ddlUnits.addEventListener("change", getGeoData );
ddlDay.addEventListener("change", LoadHourlyForecast);