const ddlUnits = document.querySelector("#ddlUnits");
const txtSearch = document.querySelector("#txtSearch");
const btnSearch = document.querySelector("#btnSearch");
const dvCityCountry = document.querySelector("#dvCityCountry");
const dvCurrDate = document.querySelector("#dvCurrDate");
const dvCurrTemp = document.querySelector("#dvCurrTemp");
const pFeelsLike = document.querySelector("#pFeelsLike");
const pHumidity = document.querySelector("#pHumidity");
const pWind = document.querySelector("#pWind");
const pPrecipitation = document.querySelector("#pPrecipitation");
const btnFavorite = document.querySelector("#btnFavorite");
const ddlFavorites = document.querySelector("#ddlFavorites");
const weatherAssistant = document.querySelector("#weatherAssistant");

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
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
                      //console.log(result);

                      let lat = result[0].lat;
                      let lon = result[0].lon;

                      loadLocationData(result);
                      getWeatherData(lat, lon);
                    } catch (error) {
                      console.error(error.message);
                    }
}

function loadLocationData(locationData) {    

                  let location = locationData[0].address;
                  cityName = location.city;
                  countryName = location.country_code.toUpperCase();

                  let dateOptions = {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    weekday: "long",
                  };

                  let currDate = new Intl.DateTimeFormat("en-US", dateOptions).format(new Date());

                  //console.log(cityName, countryName, date);

                  dvCityCountry.textContent = `${cityName}, ${countryName}`;
                  dvCurrDate.textContent = currDate;
  
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

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,weather_code&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,precipitation,wind_speed_10m&wind_speed_unit=${windUnit}&temperature_unit=${tempUnit}&precipitation_unit=${precipUnit}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    weatherData = await response.json();
    console.log(weatherData);

    loadCurrentWeather(weatherData);
    loadDailyForecast(weatherData);
  } catch (error) {
    console.error(error.message);
  }
}

function loadCurrentWeather() {
  dvCurrTemp.textContent = Math.round(weatherData.current.temperature_2m);
  pFeelsLike.textContent = Math.round(weatherData.current.apparent_temperature);
  pHumidity.textContent = weatherData.current.relative_humidity_2m;
  pWind.textContent = `${weatherData.current.wind_speed_10m} ${weatherData.current_units.wind_speed_10m.replace("mp/h", "mph")}`;
  pPrecipitation.textContent = `${weatherData.current.precipitation} ${weatherData.current_units.precipitation.replace("inch", "in")}`;
}

function loadDailyForecast() {
  let daily = weatherData.daily;

  for (let i = 0; i < 7; i++) {
    let date = new Date(daily.time[i]);
    let dayOfWeek = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date);
    let dvForecastDay = document.querySelector(`#dvForecastDay${i + 1}`);
    let weatherCodeName = getWeatherCodeName(daily.weather_code[i]);
    let dailyHigh = Math.round(daily.temperature_2m_max[i]) + "°";
    let dailyLow = Math.round(daily.temperature_2m_min[i]) + "°";

    while (dvForecastDay.firstChild) {
      dvForecastDay.removeChild(dvForecastDay.firstChild);
      setWeatherBackground(weatherData.current.weather_code);
weatherAssistantLogic();
    }

    addDailyElement("p", "daily__day-title", dayOfWeek, "", dvForecastDay, "afterbegin");
    addDailyElement("img", "daily__day-icon", "", weatherCodeName, dvForecastDay, "beforeend");
    addDailyElement("div", "daily__day-temps", "", "", dvForecastDay, "beforeend");

    let dvDailyTemps = document.querySelector(`#dvForecastDay${i + 1} .daily__day-temps`);
    addDailyElement("p", "daily__day-high", dailyHigh, "", dvDailyTemps, "afterbegin");
    addDailyElement("p", "daily__day-low", dailyLow, "", dvDailyTemps, "beforeend");
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
    95: "storm",
    96: "storm",
    99: "storm",
  };

  return weatherCodes[code];
}


getGeoData();

btnSearch.addEventListener("click", getGeoData);
ddlUnits.addEventListener("change", getGeoData);
function setWeatherBackground(code) {
  let body = document.body;

  if (code === 0) {
    body.style.background = "linear-gradient(135deg,#fceabb,#f8b500)";
  }
  else if (code === 1 || code === 2) {
    body.style.background = "linear-gradient(135deg,#89f7fe,#66a6ff)";
  }
  else if (code === 3) {
    body.style.background = "linear-gradient(135deg,#3a3a3a,#1c1c1c)";
  }
  else if (code >= 51 && code <= 67) {
    body.style.background = "linear-gradient(135deg,#4e54c8,#8f94fb)";
  }
  else if (code >= 71 && code <= 77) {
    body.style.background = "linear-gradient(135deg,#83a4d4,#b6fbff)";
  }
  else if (code >= 95) {
    body.style.background = "linear-gradient(135deg,#000428,#004e92)";
  }
}
function weatherAssistantLogic() {
  let temp = weatherData.current.temperature_2m;
  let wind = weatherData.current.wind_speed_10m;
  let code = weatherData.current.weather_code;

  let msg = "";

  if (code >= 95) {
    msg = "⚠️ عاصفة قوية! خليك بالبيت";
  }
  else if (code >= 61) {
    msg = "🌧️ خذ مظلة معك";
  }
  else if (temp > 30) {
    msg = "🔥 الجو حار جدًا، اشرب ماء";
  }
  else if (temp < 10) {
    msg = "❄️ الجو بارد، البس جاكيت";
  }
  else {
    msg = "🌤️ الجو مناسب للخروج";
  }

  weatherAssistant.textContent = "🤖 " + msg;
}
function loadFavorites() {
  ddlFavorites.innerHTML = `<option value="">My Favorites</option>`;

  favorites.forEach(city => {
    let option = document.createElement("option");
    option.value = city;
    option.textContent = city;
    ddlFavorites.appendChild(option);
  });
}

btnFavorite.addEventListener("click", () => {
  let city = dvCityCountry.textContent;

  if (!favorites.includes(city)) {
    favorites.push(city);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    loadFavorites();
  }
});

ddlFavorites.addEventListener("change", () => {
  txtSearch.value = ddlFavorites.value.split(",")[0];
  getGeoData();
});
loadFavorites();