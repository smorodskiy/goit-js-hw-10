import { getCountriesByName } from "./fetchCountries";
import { debounce } from "lodash";
import "../css/styles.css";
import Notiflix from "notiflix";

const input = document.getElementById("search-box");
const inputHighlightElem = document.querySelector(".input-highlight");
const countryListElem = document.querySelector(".country-list");
const countryInfoElem = document.querySelector(".country-info");
const buttonsElem = document.querySelectorAll("button");
let countriesRef;

const DEBOUNCE_DELAY = 300;
const NUMBERS_COUNTRIES_TOSHOW = 10;

// Event on buttons typing
buttonsElem.forEach((btn) => {
    btn.addEventListener("click", (e) => {
        // console.log(e.currentTarget);

        if (e.currentTarget.classList.contains("button-clear")) {
            input.value = "";
            inputHighlightElem.innerText = "";
            clearData();
        }
        if (e.currentTarget.classList.contains("button-search")) {

            if (input.value == '')
            Notiflix.Notify.info("Type the name of country for search");

            debouncedGetCountries(input.value);
        }
    });
});

// Event on input typing
input.addEventListener("input", () => {
    inputHighlightElem.innerText = input.value;
    debouncedGetCountries(input.value);
});

// Clear all elements
function clearData() {
    countryInfoElem.innerHTML = "";
    countryListElem.innerHTML = "";
}

// Debounce func for get req
const debouncedGetCountries = debounce((inputValue) => {

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
        if (countries.length > NUMBERS_COUNTRIES_TOSHOW) {
            Notiflix.Notify.info("Too many matches found. Please enter a more specific name.");
            return;
        }

        if (countries.length == 1) {
            renderInfo(countries[0]);
            return;
        }

        if (countries.length <= NUMBERS_COUNTRIES_TOSHOW && countries.length > 1) {
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
function setEventOnItems(countryListElem) {
    countryListElem.addEventListener("click", renderDetailOnClick);
}

// Render info for a country in the list, that is clicked
function renderDetailOnClick(e) {
    const elem = e.target.parentNode;
    if (elem.nodeName == "LI") {
        // Get id from target elem
        const id = elem.getAttribute("data-id");
        // Show detail of selected country
        renderInfo(countriesRef[id]);
        // Remove event
        countryListElem.removeEventListener("click", renderDetailOnClick, false);
    }
}

// Rendering detail info for country
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
                <li class="country-info-item">
                    <p><span class="country-label">Capital: </span> ${capital}</p>
                </li>
                <li class="country-info-item">
                    <p><span class="country-label">Population: </span> ${population}</p>
                </li>
                <li class="country-info-item">
                    <p><span class="country-label">Languages: </span> ${Object.values(
                        languages,
                    ).join(", ")}</p>
                </li>
            </ul>
    `;
    clearData();
    countryInfoElem.innerHTML = markup;
}
