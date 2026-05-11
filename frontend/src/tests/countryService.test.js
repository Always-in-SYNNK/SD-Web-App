// frontend/src/services/__tests__/countryService.test.js

import { getAllCountries, searchCountry } from "../services/countryService";

global.fetch = vi.fn();

describe("countryService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getAllCountries", () => {
        it("should fetch and transform countries correctly", async () => {
            const mockCountries = [
                {
                    cca2: "ZA",
                    name: { common: "South Africa" },
                    idd: {
                        root: "+2",
                        suffixes: ["7"],
                    },
                    flags: {
                        svg: "https://flagcdn.com/za.svg",
                        alt: "Flag of South Africa",
                    },
                },
                {
                    cca2: "US",
                    name: { common: "United States" },
                    idd: {
                        root: "+1",
                        suffixes: [""],
                    },
                    flags: {
                        png: "https://flagcdn.com/us.png",
                    },
                },
                {
                    cca2: "AQ",
                    name: { common: "Antarctica" },
                    // Missing idd.root → should be filtered out
                    idd: {},
                },
            ];

            fetch.mockResolvedValue({
                ok: true,
                json: vi.fn().mockResolvedValue(mockCountries),
            });

            const result = await getAllCountries();

            expect(fetch).toHaveBeenCalledWith(
                "https://restcountries.com/v3.1/all?fields=name,cca2,idd,flags"
            );

            expect(result).toEqual([
                {
                    code: "ZA",
                    name: "South Africa",
                    phone_code: "+27",
                    flag_url: "https://flagcdn.com/za.svg",
                    flag_alt: "Flag of South Africa",
                },
                {
                    code: "US",
                    name: "United States",
                    phone_code: "+1",
                    flag_url: "https://flagcdn.com/us.png",
                    flag_alt: "Flag of United States",
                },
            ]);
        });

        it("should return countries sorted alphabetically", async () => {
            const mockCountries = [
                {
                    cca2: "US",
                    name: { common: "United States" },
                    idd: {
                        root: "+1",
                        suffixes: [""],
                    },
                    flags: {
                        png: "us.png",
                    },
                },
                {
                    cca2: "ZA",
                    name: { common: "South Africa" },
                    idd: {
                        root: "+2",
                        suffixes: ["7"],
                    },
                    flags: {
                        svg: "za.svg",
                    },
                },
            ];

            fetch.mockResolvedValue({
                ok: true,
                json: vi.fn().mockResolvedValue(mockCountries),
            });

            const result = await getAllCountries();

            expect(result[0].name).toBe("South Africa");
            expect(result[1].name).toBe("United States");
        });

        it("should return empty array if fetch fails", async () => {
            fetch.mockResolvedValue({
                ok: false,
            });

            const result = await getAllCountries();

            expect(result).toEqual([]);
        });

        it("should return empty array on fetch error", async () => {
            fetch.mockRejectedValue(new Error("Network error"));

            const result = await getAllCountries();

            expect(result).toEqual([]);
        });
    });

    describe("searchCountry", () => {
        it("should fetch and transform a country correctly", async () => {
            const mockCountry = [
                {
                    cca2: "ZA",
                    name: { common: "South Africa" },
                    idd: {
                        root: "+2",
                        suffixes: ["7"],
                    },
                    flags: {
                        svg: "https://flagcdn.com/za.svg",
                    },
                    capital: ["Pretoria"],
                    population: 60000000,
                    region: "Africa",
                },
            ];

            fetch.mockResolvedValue({
                ok: true,
                json: vi.fn().mockResolvedValue(mockCountry),
            });

            const result = await searchCountry("south africa");

            expect(fetch).toHaveBeenCalledWith(
                "https://restcountries.com/v3.1/name/south africa"
            );

            expect(result).toEqual({
                code: "ZA",
                name: "South Africa",
                phone_code: "+27",
                flag_url: "https://flagcdn.com/za.svg",
                capital: "Pretoria",
                population: 60000000,
                region: "Africa",
            });
        });

        it("should return null if country is not found", async () => {
            fetch.mockResolvedValue({
                ok: false,
            });

            const result = await searchCountry("unknown-country");

            expect(result).toBeNull();
        });

        it("should return null on fetch error", async () => {
            fetch.mockRejectedValue(new Error("Network error"));

            const result = await searchCountry("South Africa");

            expect(result).toBeNull();
        });

        it("should handle missing suffixes correctly", async () => {
            const mockCountry = [
                {
                    cca2: "US",
                    name: { common: "United States" },
                    idd: {
                        root: "+1",
                    },
                    flags: {
                        svg: "us.svg",
                    },
                    capital: ["Washington D.C."],
                    population: 331000000,
                    region: "Americas",
                },
            ];

            fetch.mockResolvedValue({
                ok: true,
                json: vi.fn().mockResolvedValue(mockCountry),
            });

            const result = await searchCountry("USA");

            expect(result.phone_code).toBe("+1");
        });
    });
});