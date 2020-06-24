//I'm using the Color Assit vs-code extension with the color blocking syntax //#red ---> //#

/* Global Variables */
const dom_btnGenerate = document.getElementById("generate");
const dom_zip = document.getElementById("zip");
const dom_countryList = document.querySelector("select#country");
const [...dom_units] = document.getElementsByName("units");
const dom_feelings = document.getElementById("feelings");
const dom_map = document.getElementById("map");
const dom_holder_content = document.querySelector("#entryHolder #content");
const dom_holder_date = document.querySelector("#entryHolder #date");
const dom_holder_feeling = document.querySelector("#entryHolder #temp");

//#red
/* Function to POST data */
const postData = async (url = "", data = {}) => {
  console.log(data);
  try {
    const response = await fetch(url, {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const content = await response;
    return content;
  } catch (error) {
    console.log(error);
  }
};
//#

//#yellow
/* Function to GET data */
const getData = async (url = "") => {
  const response = await fetch(url);
  try {
    const collect = await response.json();
    return collect;
  } catch (error) {
    console.log(error);
  }
};
//#

//#magenta
function generate() {
  //get selected unit option:
  let selectedUnits = null;
  dom_units.forEach((r) => {
    if (r.checked) {
      selectedUnits = r.value;
    }
  });
  let countryCode = dom_countryList.value;
  let countryName = dom_countryList.selectedOptions[0].textContent;
  let zipCode = dom_zip.value;
  let feelingsText = dom_feelings.value;

  // Create a new date instance dynamically with JS
  let fullDate = new Date();
  let date = `${
    fullDate.getMonth() + 1
  }.${fullDate.getDate()}.${fullDate.getFullYear()}`;

  return {
    countryCode,
    countryName,
    zipCode,
    selectedUnits,
    feelingsText,
    date,
    fullDate,
  };
}
//#

//#yellow
let updateMapLocation = (lon, lat, margin) => {
  return `https://www.openstreetmap.org/export/embed.html?bbox=${
    lon + margin
  }%2C${lat + margin}%2C${lon - margin}%2C${
    lat - margin
  }&amp;layer=mapnik&amp;marker=${lat}%2C${lon}`;
};
//#

//#cyan
//populate the dropdown countries list
dom_btnGenerate.style.display = "none";
getData("/countriesList").then((result) => {
  const docFrag = document.createDocumentFragment();
  // const codes = result.codes;
  // console.log(codes);
  for (let i = 0; i < result.countries.length; i++) {
    const country = result.countries[i];
    const code = result.codes[i];
    const op = document.createElement("option");
    op.value = code;
    op.textContent = country;
    docFrag.appendChild(op);
  }
  dom_countryList.appendChild(docFrag);
  dom_countryList.value = "AU";
  dom_btnGenerate.style.display = "block";
});
//#

let x = null;

//#red
//attaching to the Event of Generate Button to send POST & GET Requests
dom_btnGenerate.addEventListener("click", async () => {
  console.log("POST REQUEST");
  const post = await postUserDataEntry();
  if (post) {
    console.log("GET REQUEST");
    x = await getLastUserDataEntry();
  }
  console.log("DONE!");
});

async function postUserDataEntry() {
  let generateObject = await generate();
  if (generateObject.zipCode !== "") {
    if (generateObject.feelingsText === "") {
      generateObject.feelingsText = "Not much feelings were around!";
    }
    // console.log(generate);
    //post the collected user data object to the server
    const result = await postData("/addWeatherRequest", generateObject);
    const res = await result.json();

    //check validity of response
    if (res.cod.toString().substring(0, 1) === "4") {
      console.log("not a valid request!");
      console.error(res.message);
      alert(res.message);
      return false;
    }

    return true;
  } else {
    alert("Please provide a Zip Code!");
    return false;
  }
}

// dom_holder_content
// dom_holder_date
// dom_holder_feeling
// {countryCode, zipCode, selectedUnits, feelingsText, date, fullDate, weather, apiCallURL };

async function getLastUserDataEntry() {
  const result = await getData("/getLastEntry");
  console.log(result);

  if (result === false) {
    return;
  }

  const w = result.weather;

  //update map location
  let longitude = w.coord.lon;
  let latitude = w.coord.lat;
  let mapZoom = 0.05;
  dom_map.src = updateMapLocation(longitude, latitude, mapZoom);

  const units = result.selectedUnits === "metric" ? "°C" : "°F";

  //sky description
  const c_sky = w.weather[0].description;

  const content = `The weather in ${w.name} (${result.zipCode}), ${
    result.countryName
  }, is ${c_sky} with temperature of ${w.main.temp + units} that feels like ${
    w.main.feels_like + units
  } with a low tempreture of ${w.main.temp_min + units} and a high of ${
    w.main.temp_max + units
  }. The humidity level is around ${w.main.humidity}%.`;

  dom_holder_content.textContent = content;
  dom_holder_date.textContent = result.date;
  dom_holder_feeling.textContent = `" ${result.feelingsText} "`;

  return result;
}
getLastUserDataEntry();
//#
