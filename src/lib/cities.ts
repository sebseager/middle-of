import citiesData from "./cities.json";

export type Region = "US" | "Americas" | "EU" | "Asia" | "World";

export interface City {
  city: string;
  state: string;
  abbr: string;
  country: string;
  lat: number;
  lng: number;
  population: number;
  region: Region;
}

export const ALL_CITIES: City[] = citiesData as City[];

export type PopulationFilter = "easy" | "normal" | "hard";

export const POP_THRESHOLDS: Record<PopulationFilter, number> = {
  easy: 500_000,
  normal: 250_000,
  hard: 50_000,
};

const ASIA_COUNTRIES = new Set<string>([
  "Afghanistan",
  "Armenia",
  "Azerbaijan",
  "Bahrain",
  "Bangladesh",
  "Bhutan",
  "Brunei",
  "Brunei Darussalam",
  "Cambodia",
  "China",
  "Cyprus",
  "Georgia",
  "Hong Kong",
  "India",
  "Indonesia",
  "Iran",
  "Iran, Islamic Republic of",
  "Iraq",
  "Israel",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Korea, Democratic People's Republic of",
  "Korea, Republic of",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Lao People's Democratic Republic",
  "Lebanon",
  "Macao",
  "Macau",
  "Malaysia",
  "Maldives",
  "Mongolia",
  "Myanmar",
  "Nepal",
  "North Korea",
  "Oman",
  "Pakistan",
  "Palestine",
  "Philippines",
  "Qatar",
  "Russian Federation",
  "Russia",
  "Saudi Arabia",
  "Singapore",
  "South Korea",
  "Sri Lanka",
  "State of Palestine",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Thailand",
  "Timor-Leste",
  "Turkey",
  "Turkmenistan",
  "United Arab Emirates",
  "Uzbekistan",
  "Vietnam",
  "Yemen",
]);

const isAsiaCity = (city: City): boolean => ASIA_COUNTRIES.has(city.country);

export function filterCities(
  region: Region,
  populationFilter: PopulationFilter,
): City[] {
  const minPop = POP_THRESHOLDS[populationFilter];

  return ALL_CITIES.filter((c) => {
    if (c.population < minPop) return false;

    switch (region) {
      case "US":
        return c.region === "US";
      case "Americas":
        return c.region === "US" || c.region === "Americas";
      case "EU":
        return c.region === "EU";
      case "Asia":
        return isAsiaCity(c);
      case "World":
        return true;
    }
  });
}

export function cityLocationName(city: City): string {
  return city.region === "US" ? city.state : city.country;
}

export function cityLabel(city: City): string {
  return `${city.city}, ${cityLocationName(city)}`;
}

export function cityLabels(cities: City[]): string[] {
  return cities.map((city) => cityLabel(city));
}

// Legacy compat - default to world, no filter
export const CITIES = ALL_CITIES;
export const CITY_LABELS: string[] = cityLabels(ALL_CITIES);
