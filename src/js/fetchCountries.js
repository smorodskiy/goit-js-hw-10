import { debounce } from "lodash";

const URL = "https://restcountries.com/v3.1/name/";
const fields = "name,capital,population,flags,languages";
const DEBOUNCE_DELAY = 300;

// Fetch countries by name
export const fetchCountries = (name) => {
        const fetched = () => {
                return fetch(`${URL}${name}?fields=${fields}`, {
                        headers: {
                                Accept: "application/json",
                        },
                });
        };

        const debouncedFetch = asyncDebounce(fetched, DEBOUNCE_DELAY);

        return debouncedFetch();
};

// Async debounce
function asyncDebounce(func, wait) {
        const debounced = debounce((resolve, reject, args) => {
                func(...args)
                        .then(resolve)
                        .catch(reject);
        }, wait);

        return (...args) =>
                new Promise((resolve, reject) => {
                        debounced(resolve, reject, args);
                });
}
