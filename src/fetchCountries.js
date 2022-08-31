import "./css/styles.css";

const URL = "https://restcountries.com/v3.1/name/";

export const getCountriesByName = (name) => {
    // name = name.toLowerCase();
    return fetch(`${URL}${name}`, {
        headers: {
            Accept: "application/json",
        },
    });
};
