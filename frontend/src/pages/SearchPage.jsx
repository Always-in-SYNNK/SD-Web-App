import React, { useState } from "react";
import SearchBar from "../components/SearchBar";
import OpportunityList from "../components/OpportunityList";
import "../styles/SearchPage.css";

const SearchPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query) => {
    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/opportunities?search=${query}`
      );
      const data = await response.json();

      setResults(data);
    } catch (error) {
      console.error("Error fetching opportunities:", error);
    }

    setLoading(false);
  };

  return (
    <section className="search-page">
      <h1>Search Opportunities</h1>

      <SearchBar onSearch={handleSearch} />

      {loading ? (
        <p>Loading...</p>
      ) : (
        <OpportunityList opportunities={results} />
      )}
    </section>
  );
};

export default SearchPage;