import { getCountriesByName } from "./fetchCountries";
import { debounce } from "lodash";
import "../css/styles.css";
import Notiflix from "notiflix";

const input = document.getElementById("search-box");
const inputHighlightElem = document.querySelector(".input-highlight");
const countryListElem = document.querySelector(".country-list");
const countryInfoElem = document.querySelector(".country-info");
let countriesRef;

const DEBOUNCE_DELAY = 300;

// Event on input typing
input.addEventListener("input", (e) => {
    inputHighlightElem.innerText = input.value;
    debouncedGetCountries(e);
});

// Clear all elements
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
        .then((foundedCountries) => {
            try {
                showCountries(foundedCountries);
            } catch (error) {
                console.log(error);
                Notiflix.Notify.failure(error.message);
            }
        })
        .catch(() => {
            Notiflix.Notify.failure("Oops, there is no country with that name");
        });
}, DEBOUNCE_DELAY);

// Show names of countries
function showCountries(countries) {
    if (countries != undefined) {
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

    throw new Error("Oops, data is not correct");
}

// Rendering list in html
function renderList(countries) {
    const markup = countries
        .map((country, id) => {
            const {
                name: { official },
                flags: { svg },
            } = country;

            return `
                    <li class="country-item" data-id=${id}>
                        <img class="country-pic" src="${svg}" alt="${official} flag" />
                        <p>${official}</p>
                    </li>
                    `;
        })
        .join("");

    clearData();
    countryListElem.innerHTML = markup;

    // Start listening click event on Items
    countriesRef = countries;
    setEventOnItems(countryListElem, countries);
}

// Set event on item click
function setEventOnItems(countryListElem, countries) {
    countryListElem.addEventListener("click", renderDetailOnClick);
}

// Render info for country which clicked on list
function renderDetailOnClick(e) {
    const elem = e.target.parentNode;
    if (elem.nodeName == "LI") {
        const id = elem.getAttribute("data-id");
        renderInfo(countriesRef[id]);
        countryListElem.removeEventListener("click", renderDetailOnClick, false);
    }
}

// Rendering info for one country
function renderInfo(country) {
    const {
        name: { official },
        flags: { svg },
        capital,
        population,
        languages,
    } = country;

    const markup = `
            <ul class="country-info-list">
                <li class="country-info-item large">
                    <img class="country-pic" src="${svg}" alt="${official} flag" />
                    <p class="country-name"><b>${official}</b></p>
                </li>
                <li class="country-info">
                    <p><span class="country-label">Capital: </span> ${capital}</p>
                </li>
                <li class="country-info">
                    <p><span class="country-label">Population: </span> ${population}</p>
                </li>
                <li class="country-info">
                    <p><span class="country-label">Languages: </span> ${Object.values(
                        languages,
                    ).join(", ")}</p>
                </li>
            </ul>
    `;
    clearData();
    countryInfoElem.innerHTML = markup;
}
