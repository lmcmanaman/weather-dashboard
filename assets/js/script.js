let outputEl = document.getElementById("output");
let searchButton = document.getElementById("search-button");
let historyContainer = document.getElementById("history-container");
let fiveDayOutput = document.getElementById("five-day-output");

let apiKey = "a35d8c97828352c1df5878d1046bcfbe";
let cities = [];

// Five day forecast cards
function getFiveDay (fiveDayArray, temp, wind, humidity) {
    let date = moment().format("MMMM DD, YYYY");
    let iconArray = [];

   
    let container = document.createElement("div");
    let header = document.createElement("h1");
    let tempEl = document.createElement("p");
    let windEl = document.createElement("p");
    let humidityEl = document.createElement("p");
    let iconEl = document.createElement("img");

    // Pulls weather icons from API to put in above iconArray
    for (i = 0; i < 5; i++) {
        iconArray.push(fiveDayArray[i].weather[0].icon);
    }

    // similar to the current day forecast function, the if statement will look to see if the five day forecast container already exists - if it does, it will remove it and call this function again, otherwise it will create the dynamic elements below
    if (document.querySelector("#five-day") === null) {
        container.setAttribute("class", "box is-flex is-flex-direction-row is-flex-wrap-wrap is-justify-content-center");
        container.setAttribute("id", "five-day");

        if (document.querySelector("#five-day-header") === null) {
            header.setAttribute("class", "title is-3 custom-header");
            header.setAttribute("id", "five-day-header");
            header.textContent = "5 Day Forecast";
        }

        fiveDayOutput.appendChild(header);
        fiveDayOutput.appendChild(container);

        // Looping forecast five times for five days
        for (i = 0; i < 5; i++) {
            // dynamic HTML elements
            let card = document.createElement("div");
            let cardContent = document.createElement("div");
            let cardHeader = document.createElement("p");
            let iconSrc = `https://api.openweathermap.org/img/w/${iconArray[i]}.png`;

            // using the current date from moment.js, adding a day each iteration to construct five future dates 
            let addDaysToDate = moment(date, "MMMM DD, YYYY").add(i+1, 'd');
            var day = addDaysToDate.format('DD');
            var month = addDaysToDate.format('MMM');
            var year = addDaysToDate.format('YYYY');
            let futureDate = `${month} ${day}, ${year}`;

            // setting attributes for dynamic elements
            card.setAttribute("class", "card custom-card");
            cardHeader.setAttribute("class", "card-header-title");
            cardContent.setAttribute("class", "card-content");
            iconEl.setAttribute("src", iconSrc);
            
            // setting text content for dynamic elements using the API data and moment.js variables defined above
            cardHeader.textContent = `${futureDate}`;
            tempEl.textContent = `Temp: ${fiveDayArray[i].temp.day} F`;
            windEl.textContent = `Wind: ${fiveDayArray[i].wind_speed} mph`;
            humidityEl.textContent = `Humidity: ${fiveDayArray[i].humidity}%`;

            // appending elements to the appropriate containers to display the results on the screen
            card.appendChild(cardHeader);
            cardHeader.append(iconEl.cloneNode(true));
            card.appendChild(cardContent);
            cardContent.appendChild(tempEl.cloneNode(true));
            cardContent.appendChild(windEl.cloneNode(true));
            cardContent.appendChild(humidityEl.cloneNode(true));
            container.appendChild(card);
        }

    } else {
        document.querySelector("#five-day").remove();
        getFiveDay (fiveDayArray, temp, wind, humidity);
    }
}

// displays the weather for the current date
function getCurrentDay (location, temp, wind, humidity, uvIndex, icon) {
    // using moment.js to get the current day
    let currentDate = moment().format("MMMM Do, YYYY");
    // generating the source link for the weather icons
    let iconSrc = `https://api.openweathermap.org/img/w/${icon}.png`;

    // variables to create new HTML elements that results will be appended to
    let box = document.createElement("div");
    let header = document.createElement("h1");
    let dateEl = document.createElement("h1");
    let tempEl = document.createElement("p");
    let windEl = document.createElement("p");
    let humidityEl = document.createElement("p");
    let uvEl = document.createElement("span");
    let iconEl = document.createElement("img");

    // generate and append the current weather elements only if they do not currently exist in the HTML document
    if (document.querySelector("#current-weather") === null) {
        // setting attributes for dynamically generated elements
        header.setAttribute("class", "title is-3");
        dateEl.setAttribute("class", "subtitle");
        iconEl.setAttribute("src", iconSrc);
        box.setAttribute("class", "box");
        box.setAttribute("id", "current-weather");

        // setting the text content of dynamically generated elements using the data from the API passed in to this function
        header.textContent = `${location}`;
        dateEl.textContent = `${currentDate}`;
        tempEl.textContent = `Temp: ${temp} F`;
        windEl.textContent = `Wind: ${wind} mph`;
        humidityEl.textContent = `Humidity: ${humidity}%`;
        uvEl.textContent = `UV Index: ${uvIndex}`;

        // coloring the UV index tag based on the level/intensity of the value
        if (uvIndex < 3) {
            uvEl.setAttribute("class", "tag is-success");
        } else if (uvIndex < 7) {
            uvEl.setAttribute("class", "tag is-warning");
        } else {
            uvEl.setAttribute("class", "tag is-danger");
        }

        // building the output by appending the appropriate elements together
        header.append(iconEl);
        box.appendChild(header);
        box.appendChild(dateEl);
        box.appendChild(tempEl);
        box.appendChild(windEl);
        box.appendChild(humidityEl);
        box.appendChild(uvEl);
        outputEl.appendChild(box);

    } else {
        // if there is already a current day weather forecast displayed on the page, remove that element and then call this function again with the same inputs - will generate a new current day forecast instead of adding a second one to the page
        document.querySelector("#current-weather").remove();
        getCurrentDay(location, temp, wind, humidity, uvIndex, icon);
    }
}

// takes the location, latitude, and longitude to search the API for the weather data
function getWeather (location, lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=minutely,hourly&appid=${apiKey}`)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
        // finding the weather attributes to display 
        let temp = data.current.temp;
        let wind = data.current.wind_speed;
        let humidity = data.current.humidity;
        let uvIndex = data.current.uvi;
        let icon = data.current.weather[0].icon;
        // creates an array to store the five day forecast to be used in the five day forecast function
        let fiveDayArray = data.daily;

        // passes that info into functions that further specify which data to display - weather for the current day and the five day forecast
        getCurrentDay(location, temp, wind, humidity, uvIndex, icon);
        getFiveDay(fiveDayArray, temp, wind, humidity);

    })
    .catch(function (err) {
      console.error(err);
    });
}

// finds latitude and longitude of city input
function getLatLon (city) {
    if (city !== '') {
        // calls the open weather API using the city as a query
        fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${apiKey}`)
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
            // if data exists, sets the latitude and longitude of the location to variables that are passed in to the getWeather function, otherwise gives user an alert saying that the location is invalid. 
            if (data[0] !== undefined) {
                let location = data[0].name;
                let lat = data[0].lat;
                let lon = data[0].lon;

                getWeather(location, lat, lon);
            } else {
                alert("Invalid location, please check spelling and try again.");
                location.reload();
            }
        })
        .catch(function (err) {
          console.error(err);
        });
    } else {
        alert("Please enter a city into the search bar.")
        location.reload();
    }

}

// parses the local storage
function displaySearchHistory () {
    let searchHistory = JSON.parse(localStorage.getItem("history"));

    // if local storage is not empty, dynamically creates a button for each local storage item
    if (searchHistory !== null) {
        for (i = 0; i < searchHistory.length; i++) {
            let newButton = document.createElement("button");
            newButton.setAttribute("class", "button is-light");
            newButton.setAttribute("id", "history-button");
            newButton.textContent = searchHistory[i];
            historyContainer.appendChild(newButton.cloneNode(true));
        }

        // finds all dynamically created buttons, loops through them and adds event listeners for each, which will call the search process using the text associated with the button as the search term
        let historyButtons = document.querySelectorAll("#history-button");
        for (i = 0 ; i < historyButtons.length; i++) {
            historyButtons[i].addEventListener('click', function (event){
                let searchTerm = event.target.textContent;
                getLatLon(searchTerm);
            }) ; 
         }
    }
}

// this kicks off the search process once the button is clicked
function init (event) {
    // defines city as the user input associated with the submit button
    let city = event.target.parentElement.querySelector(".input").value.trim();
    // pushes that city into empty array to commit to local storage
    cities.push(city);
    // commits to local storage only if city is not blank
    if (city !== '') {
        localStorage.setItem("history", JSON.stringify(cities));
    }

    // creates a new button for the city that was just searched for - avoids having to reload the page to see it in local storage. this way users can search for multiple cities at once and still reference that city without reloading the page. 
    let newButton = document.createElement("button");
    newButton.setAttribute("class", "button is-light");
    newButton.setAttribute("id", "current-search-button");
    newButton.textContent = city;
    historyContainer.appendChild(newButton.cloneNode(true));
    let currentSearchButtons = document.querySelectorAll('#current-search-button');
    for (i = 0 ; i < currentSearchButtons.length; i++) {
        currentSearchButtons[i].addEventListener('click', function (event){
            let searchTerm = event.target.textContent;
            getLatLon(searchTerm);
        }) 
    }; 

    // calls the function to generate the latitude/longitude of the location
    getLatLon(city);
}

// upon page load, display the search history from local storage and set an event listener on the search button
displaySearchHistory();
searchButton.addEventListener("click", init);