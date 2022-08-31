
import { getCountriesByName } from "./fetchCountries";
import { debounce } from "lodash";
import "./css/styles.css";
import Notiflix from "notiflix";

const input = document.getElementById("search-box");
const countryListElem = document.querySelector(".country-list");
const countryInfoElem = document.getElementsByClassName("country-info");

const DEBOUNCE_DELAY = 300;

// const string = new URLSearchParams({
//     name: name,
// });

// Event on input typing
input.addEventListener("input", (e) => debouncedGetCountries(e));

// Debounce func for get req
const debouncedGetCountries = debounce((e) => {
    const inputValue = e.target.value;

    // Post http req and get names
    getCountriesByName(inputValue)
        .then((response) => {
            if (!response.ok) {
                throw new Error(response.status);
            }
            return response.json();
        })
        .then((foundedCountries) => showCountries(foundedCountries));
}, DEBOUNCE_DELAY);

// Show names of countries
function showCountries(countries) {
    // console.log(countries);
    if (countries.length > 50) {
        Notiflix.Notify.info("Too many matches found. Please enter a more specific name.");
        return;
    }

    if (countries.length == 1) {
        renderInfo(countries[0]);
        return;
    }

    if (countries.length <= 50 && countries.length > 1) {
        renderList(countries);
        return;
    }
}

function renderList(countries) {
    
    const markup = countries
    
    .map((country) => {
        const {
            name: { common },
            flags: { png, svg },
        } = country;

        return `
        <li class="country-item">
            <img class="country-pic" src="${png && png}" alt="${common && common} flag" />
            <p class="country-name">${common && common}</p>
        </li>
        `
    })
    .join('');

    countryListElem.innerHTML = markup;
}

function renderInfo(country) {

    const {
        name: { common },
        flags: { png, svg },
        capital,
        population,
        languages,
    } = country;

    const markup =  `
    <ul>
        <li class="country-item">
        <b>Name</b>
            <b>Capital</b>
            <p class="country-name">${common && common}</p>
        </li>
    </ul>
    `;

    png && console.log(`png: ${png}`);
    common && console.log(`Name: ${common}`);
    capital && console.log(`Capital: ${[...capital]}`);
    population && console.log(`Population: ${population}`);
    languages && console.log(`Languages: ${Object.values(languages).join(", ")}`);
}
