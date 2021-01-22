import data from './data.js';
import sunPic from './assets/sunrise.png';
import setPic from './assets/sunset.png';

const UI = (function() {

    function capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function createQuick(type, text, parent, img) {

        let ele = document.createElement(type);
        let eleText = document.createTextNode(text);
        ele.appendChild(eleText);
        parent.appendChild(ele);
        if (img) ele.src = img;
        return ele;

    }

    function displayMain() {

        let content = createQuick('div', '', document.querySelector('body'));
        let title = createQuick('h1', 'Welcome to the Weather App!', content);
        title.setAttribute('id', 'intro-title');
        let subtitle = createQuick('h2', 'Please enter city information to ' +
        'get weather information', content);
        subtitle.setAttribute('id', 'intro-subtitle');

    }

    function makeForm() {


        function makeInput(type, form) {

            let label = document.createElement('label');
            label.setAttribute('for', `${type}-search`);
            
            let prompt = document.createElement('span');
            if (type === 'state') prompt.textContent = 'State name (if in US), select N/A if not in US: ';
            else prompt.textContent = `${capitalize(type)} name: `;
            label.appendChild(prompt);
            
            let search = document.createElement('input');
            search.setAttribute('type', 'text');
            search.setAttribute('id', `${type}-search`);
            search.setAttribute('name', `${type}-search`);
            search.required = true;
            label.appendChild(search);

            if (type === 'city') {

                search.setAttribute('pattern', data.locationData.cities.join('|'));
                search.setAttribute('list', 'cities');

                let list = document.createElement('datalist');
                list.setAttribute('id', 'cities');

                for (let city of data.locationData.cities) {

                    let option = document.createElement('option');
                    option.textContent = city;
                    list.appendChild(option);

                }

                label.appendChild(list);

            } else if (type === 'state') {
                search.setAttribute('pattern', data.locationData.states.join('|') + '|N/A');
                search.setAttribute('list', 'states');

                let list = document.createElement('datalist');
                list.setAttribute('id', 'states');

                let emptyOption = document.createElement('option');
                emptyOption.textContent = 'N/A';
                list.appendChild(emptyOption);
                for (let state of data.locationData.states) {

                    let option = document.createElement('option');
                    option.textContent = state;
                    list.appendChild(option);
                }

                label.appendChild(list);
            } else if (type === 'country') {
                 search.setAttribute('pattern', data.locationData.countries.join('|'));
                 search.setAttribute('list', 'countries');

                 let list = document.createElement('datalist');
                 list.setAttribute('id', 'countries');

                 for (let country of data.locationData.countries) {
                    
                    let option = document.createElement('option');
                    option.textContent = country;
                    list.appendChild(option);
                }

                label.appendChild(list);
            };

            search.addEventListener('input', (e) => {

                if (search.validity.valid) {
                    error.textContent = "";
                } else {
                    showErrorMessage();
                }
            })


            let error = document.createElement('span');
            error.classList.add('error');
            error.setAttribute('aria-live', 'polite');

            function showErrorMessage() {

                if (search.validity.valueMissing) {
                    error.textContent = `Please enter a value for the ${type}.`
                } else if (!search.validity.valid) {
                    error.textContent = `Please enter an appropriate value for the ${type}.`
                }
            }

            label.appendChild(error);

            form.appendChild(label);
        }


        let formy = document.createElement('form');
        formy.setAttribute('id', 'search-form');
        formy.classList.add('type1');
        formy.nonvalidate = true;

        makeInput('city', formy);
        makeInput('state', formy);
        makeInput('country', formy);

        let submit = document.createElement('input');
        submit.setAttribute('type', 'submit');
        submit.setAttribute('value', 'Find weather data');
        formy.appendChild(submit);

        formy.addEventListener('submit', (e) => {

            let valid = true;
            e.preventDefault();

            for (let input of document.getElementsByTagName('input')) {

                if (input.type === 'submit') break;
                else if (!input.validity.valid) {
                    alert("You must fix one or more fields.");
                    valid = false;
                }
            }

            if (valid) {

                data.getWeatherData().then(response => {
                    displayWeatherData(response);
                })

            }

    
        });

        document.querySelector('body').appendChild(formy);  
        return formy;
    }


    function displayWeatherData(weather) {

        if (document.querySelector('#intro-title')) {

            document.querySelector('#search-form').remove();
            document.querySelector('#intro-title').remove();
            document.querySelector('#intro-subtitle').remove();
        }
        
        if (document.querySelector('#weather-display')) 
        document.querySelector('#weather-display').remove();

        let displayContent = document.createElement('div');
        displayContent.setAttribute('id', 'weather-display');
        document.querySelector('body').appendChild(displayContent);
        let city = createQuick('h1', `${weather.city}, ${weather.country}`, displayContent);

        
        let currentTime = data.getTime(weather.timezone);
        let timeDisplay = createQuick('h2', `${currentTime.hour}:${currentTime.minutes} ${currentTime.ampm}`, displayContent);
        timeDisplay.setAttribute('id', 'time-display');

        let clock = setInterval(function() {   
            let time = data.getTime(weather.timezone);
            timeDisplay.textContent = `${time.hour}:${time.minutes} ${time.ampm}`
        }, 60000);


        let sunnies = createQuick('div', '', displayContent);
        sunnies.setAttribute('id', 'sun-info');
        let sunriseBox = createQuick('div', '', sunnies);
        sunriseBox.setAttribute('id', 'sunrise-box');
        let sunrise = createQuick('img', '', sunriseBox, sunPic);
        let riseText = createQuick('p', 'Sunrise:', sunriseBox);
        let riseTime = createQuick('p', `${weather.sunrise.hour}:${weather.sunrise.minutes} ${weather.sunrise.ampm}`, sunriseBox);

        
        let sunsetBox = createQuick('div', '', sunnies);
        let sunset = createQuick('img', '', sunsetBox, setPic);
        sunriseBox.setAttribute('id', 'sunset-box');
        let setText = createQuick('p', 'Sunset:', sunsetBox);
        let setTime = createQuick('p', `${weather.sunset.hour}:${weather.sunset.minutes} ${weather.sunset.ampm}`, sunsetBox);


        let tempButton = createQuick('button', 'to Celsius', displayContent);
        tempButton.addEventListener('click', changeTempUnit);
        tempButton.setAttribute('id', 'temp-button');


        let tempBox = createQuick('table', '', displayContent);
        tempBox.setAttribute('id', 'temp-box');

        let titles = createQuick('tr', '', tempBox);
        let actualField = createQuick('th', 'Actual temperature:', titles);
        let feelsField = createQuick('th', 'Feels like:', titles);
        let minField = createQuick('th', 'Minimum temperature:', titles);
        let maxField = createQuick('th', 'Maximum temperature', titles);
        actualField.classList.add('temp-field');
        feelsField.classList.add('temp-field');
        minField.classList.add('temp-field');
        maxField.classList.add('temp-field');


        let numbers = createQuick('tr', '', tempBox);
        let actualNum = createQuick('th', `${Math.round((weather.temp - 273.15) * 1.8 + 32)}°F`, numbers);
        let feelsNum = createQuick('th', `${Math.round((weather.feelsLike - 273.15) * 1.8 + 32)}°F`, numbers);
        let minNum = createQuick('th', `${Math.round((weather.min - 273.15) * 1.8 + 32)}°F`, numbers);
        let maxNum = createQuick('th', `${Math.round((weather.max - 273.15) * 1.8 + 32)}°F`, numbers);
        actualNum.classList.add('temp-num');
        feelsNum.classList.add('temp-num');
        minNum.classList.add('temp-num');
        maxNum.classList.add('temp-num');

        let currentFahr = true;

        function changeTempUnit() {

            if (currentFahr) {

            actualNum.textContent = `${Math.round(weather.temp - 273.15)}°C`;
            feelsNum.textContent = `${Math.round(weather.feelsLike - 273.15)}°C`;
            minNum.textContent = `${Math.round(weather.min - 273.15)}°C`;
            maxNum.textContent = `${Math.round(weather.max - 273.15)}°C`;
            tempButton.textContent = 'to Fahrenheit'
            currentFahr = false;
        
            } else {

                actualNum.textContent = `${Math.round((weather.temp - 273.15) * 1.8 + 32)}°F`;
                feelsNum.textContent = `${Math.round((weather.feelsLike - 273.15) * 1.8 + 32)}°F`;
                minNum.textContent = `${Math.round((weather.min - 273.15) * 1.8 + 32)}°F`;
                maxNum.textContent = `${Math.round((weather.max - 273.15) * 1.8 + 32)}°F`;
                tempButton.textContent = 'to Celsius'
                currentFahr = true;

            }
        }

        let botBox = createQuick('div', '', displayContent);
        botBox.setAttribute('id', 'bot-box');

        let weatherBox = createQuick('div', '', botBox);
        weatherBox.setAttribute('id', 'weather-box');

        let name = createQuick('h4', weather.weather, weatherBox);
        let weatherPic = createQuick('img', '', weatherBox, weather.imgSrc);
        weatherPic.setAttribute('id', 'weather-pic');
        let nameSub = createQuick('p', weather.sub, weatherBox);

        let formBox = makeForm();
        botBox.appendChild(formBox);
        formBox.classList.remove('type1');
        formBox.classList.add('type2');

      

        return displayContent;

    }

    
    return {
        makeForm,
        displayWeatherData,
        displayMain,
    }
})();

export default UI;