import { getCountriesByName } from "./fetchCountries";
import { debounce } from "lodash";
import "./css/styles.css";
import Notiflix from "notiflix";

const input = document.getElementById("search-box");
const inputHighlightElem = document.querySelector(".input-highlight");
const countryListElem = document.querySelector(".country-list");
const countryInfoElem = document.querySelector(".country-info");

const DEBOUNCE_DELAY = 300;

// Event on input typing
input.addEventListener("input", (e) => {
    inputHighlightElem.innerText = input.value;
    debouncedGetCountries(e);
});

function clearData() {
    countryInfoElem.innerHTML = "";
    countryListElem.innerHTML = "";
}

// Debounce func for get req
const debouncedGetCountries = debounce((e) => {
    const inputValue = e.target.value;

    if (inputValue == "") {
        clearData();
        return;
    }

    // Post http req and get names
    getCountriesByName(inputValue)
        .then((response) => {
            if (!response.ok) {
                throw new Error(response.status);
            }
            return response.json();
        })
        .then((foundedCountries) => showCountries(foundedCountries))
        .catch(() => {
            Notiflix.Notify.failure("Oops, there is no country with that name");
        });
}, DEBOUNCE_DELAY);

// Show names of countries
function showCountries(countries) {
    // console.log(countries);
    if (countries.length > 10) {
        Notiflix.Notify.info("Too many matches found. Please enter a more specific name.");
        return;
    }

    if (countries.length == 1) {
        renderInfo(countries[0]);
        return;
    }

    if (countries.length <= 10 && countries.length > 1) {
        renderList(countries);
        return;
    }
}

function renderList(countries) {
    const markup = countries

        .map((country) => {
            const {
                name: { official },
                flags: { svg },
            } = country;

            return `
                    <li class="country-item">
                        <img class="country-pic" src="${svg && svg}" alt="${
                official && official
            } flag" />
                        <p>${official && official}</p>
                    </li>
                    `;
        })
        .join("");

    clearData();
    countryListElem.innerHTML = markup;
}

function renderInfo(country) {
    const {
        name: { official },
        flags: { svg },
        capital,
        population,
        languages,
    } = country;

    const markup = `
            <ul class="country-list">
                <li class="country-item large">
                    <img class="country-pic" src="${svg && svg}" alt="${official && official} flag" />
                    <p class="country-name"><b>${official}</b></p>
                </li>
                <li class="country-item">
                    <p><span class="label">Capital: </span> ${capital}</p>
                </li>
                <li class="country-item">
                    <p><span class="label">Population: </span> ${population}</p>
                </li>
                <li class="country-item">
                    <p><span class="label">Languages: </span> ${Object.values(languages).join(", ")}</p>
                </li>
            </ul>
    `;
    clearData();
    countryInfoElem.innerHTML = markup;
    // svg && console.log(`svg: ${svg}`);
    // official && console.log(`Name: ${official}`);
    // capital && console.log(`Capital: ${[...capital]}`);
    // population && console.log(`Population: ${population}`);
    // languages && console.log(`Languages: ${Object.values(languages).join(", ")}`);
}
