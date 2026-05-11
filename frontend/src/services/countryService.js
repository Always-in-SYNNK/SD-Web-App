// frontend/src/services/countryService.js
// Fetches countries from RestCountries API (same as your lab)

const COUNTRIES_API_URL = 'https://restcountries.com/v3.1/all';
const COUNTRY_BY_NAME_URL = 'https://restcountries.com/v3.1/name/';

// Fetch all countries (for dropdown)
export async function getAllCountries() {
    try {
        const response = await fetch(`${COUNTRIES_API_URL}?fields=name,cca2,idd,flags`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch countries');
        }
        
        const countries = await response.json();
        
        // Transform to format we need: { code, name, phone_code, flag_url, example }
        return countries
            .filter(country => country.idd && country.idd.root) // Only countries with phone codes
            .map(country => {
                // Build full phone code (root + suffixes)
                let phoneCode = country.idd.root;
                if (country.idd.suffixes && country.idd.suffixes.length > 0) {
                    phoneCode += country.idd.suffixes[0];
                }
                
                return {
                    code: country.cca2,
                    name: country.name.common,
                    phone_code: phoneCode,
                    flag_url: country.flags?.svg || country.flags?.png,
                    flag_alt: country.flags?.alt || `Flag of ${country.name.common}`
                };
            })
            .sort((a, b) => a.name.localeCompare(b.name)); // Alphabetical order
    } catch (error) {
        console.error('Error fetching countries:', error);
        return [];
    }
}

// Search for a specific country (if needed)
export async function searchCountry(countryName) {
    try {
        const response = await fetch(`${COUNTRY_BY_NAME_URL}${countryName}`);
        
        if (!response.ok) {
            throw new Error('Country not found');
        }
        
        const countries = await response.json();
        const country = countries[0];
        
        return {
            code: country.cca2,
            name: country.name.common,
            phone_code: country.idd.root + (country.idd.suffixes?.[0] || ''),
            flag_url: country.flags?.svg,
            capital: country.capital?.[0],
            population: country.population,
            region: country.region
        };
    } catch (error) {
        console.error('Error searching country:', error);
        return null;
    }
}