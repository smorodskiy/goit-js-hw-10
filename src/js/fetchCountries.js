const URL = "https://restcountries.com/v3.1/name/";

const fields = "name,capital,population,flags,languages";

export const getCountriesByName = (name) => {
    return fetch(`${URL}${name}?fields=${fields}`, {
        headers: {
            Accept: "application/json",
        },
    });
};
