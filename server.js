//OPEN WEATHER MAP: API KEY
const apiKey = "33831b5edaf31cdc9378937ba7166f6d";
const apiCall = (zip, country, units, apikey = apiKey) => {
  return `http://api.openweathermap.org/data/2.5/weather?zip=${zip},${country}&units=${units}&appid=${apikey}`;
};

// Setup empty JS object to act as endpoint for all routes
const projectData = [];

//#red SERVER & IMPORTS SETUP
/* Express to run server and routes */
const express = require("express");
/* Start up an instance of app */
const app = express();

//jsdom to convert web scraped text into DOM
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

//the node-fetch library, to run fetch() in node.js
const fetch = require("node-fetch");

/* Dependencies */
const bodyParser = require("body-parser");
/* Middleware*/
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const cors = require("cors");
const { text } = require("body-parser");
const { response } = require("express");
app.use(cors());

// Initialize the main project folder
app.use(express.static("website"));

// Setup Server
const port = 3000;
/* Spin up the server*/
const server = app.listen(port, listening);
function listening() {
  // console.log(server);
  console.log(`running on localhost: http://localhost:${port}`);
}
//#

//#cyan
/*
 *Getting the list of country codes as per the ISO 3166, as mentioned in the OWM API Docs,
 *to evaluate inputs against specifc Country's Zip code
 */
app.get("/countriesList", (request, response) => {
  getCountriesCodesList().then((result) => {
    // console.log(result.countries);
    response.send(result);
  });
});
//server-test the getCountriesCodesList() method
//  const countriesList = getCountriesCodesList().then((result) => {
//   // console.log(result.countries);
//   response.send(result);
// });

async function getCountriesCodesList() {
  const url = "https://www.iban.com/country-codes";
  try {
    const response = await fetch(url);
    const htmlText = await response.text();
    const dom = await new JSDOM(htmlText);
    const doc = dom.window.document;
    const countries = [];
    const codes = [];

    const table = doc.querySelector(
      "table#myTable.table.table-bordered.downloads.tablesorter"
    );
    let [, ...rows] = table.querySelectorAll("tr");

    rows.forEach((tr) => {
      countries.push(tr.children[0].textContent);
      codes.push(tr.children[1].textContent);
    });
    // console.log(countries, codes);
    return { countries, codes };
  } catch (error) {
    console.error(
      `An Error Happened While Loading the external Country Codes list\n${error}`
    );
  }
}
//#

//#red
//returned object from frontEnd: {countryCode, zipCode, selectedUnits, feelingsText, date, fullDate};
//POST for a New Entry
app.post("/addWeatherRequest", async (request, response) => {
  let data = request.body;
  // console.log(data);

  console.log(`----\nNew Entry Recieved`);
  let res = await OpenWeatherMapApiCall(
    data.zipCode,
    data.countryCode,
    data.selectedUnits
  );
  data.weather = res;
  data.apiCallURL = apiCall(
    data.zipCode,
    data.countryCode,
    data.selectedUnits,
    "{APIKEY}"
  );
  projectData.push(data);

  console.log(
    `RESULT VALIDATION :\n${data.weather.cod}\n${data.weather.message}\n${data.weather.name}`
  );
  response.send(res);
});
//#

//#yellow
//fetching data from the Open Weather Map website API
async function OpenWeatherMapApiCall(zip, country, units) {
  let url = apiCall(zip, country, units);
  console.log(url);
  try {
    const response = await fetch(url);
    let jsonData = null;
    await response.json().then((r) => {
      jsonData = r;
    });
    // console.log(jsonData);
    return jsonData;
  } catch (error) {
    console.log(error);
  }
}
//#

//#red
//sending last entry data back to the front-end
app.get("/getLastEntry", async (request, response) => {
  let i = projectData.length;
  console.log(`\nGET REQUEST FOR LAST ENTRY\nall recorded entries (${i}):`);
  let sendData = false;
  if (i !== 0) {
    sendData = projectData[i - 1];
  }

  //debug check for all entries
  projectData.forEach((x) => {
    console.log(x.weather.cod);
  });
  console.log("-----");
  response.send(sendData);
});
//#
