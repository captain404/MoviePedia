import { useState } from "react";
import { MovieCard } from "./MovieCard";
import { Search } from "./Search";

export const MovieBox = ({ appManagedMyList, appManagedOnAddToList }) => { // Correctly receive props
  const [keyword, setKeyword] = useState("");
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState("");
  // Removed myList state and handleAddToMyList. These are now managed by App.jsx

  const changeHandler = (e) => {
    setKeyword(e.target.value);
  };

  // API Details - Consider moving to a config/constants file
  const apiKey = "afdc4dff"; // This should ideally also be passed as a prop or from a config
  const apiURL = `https://www.omdbapi.com/?apikey=${apiKey}&s=${keyword}`;

  // API Call
  const clickHandler = async () => {
    if (keyword === "" || keyword == null) {
      setError("Please enter something...");
      setMovies([]);
      // setKeyword(""); // Keep keyword to allow user to see what they searched for
    } else {
      try {
        const response = await fetch(apiURL);
        const data = await response.json();
        if (data.Response === "False") {
          setError(data.Error || "No results found");
          setMovies([]);
        } else {
          setError("");
          setMovies(data.Search || []); // Ensure movies is an array
        }
      } catch (err) {
        setError("Failed to fetch movies. Check your connection.");
        setMovies([]);
      }
    }
  };

  return (
    <div className="wrapper">
      <Search
        keyword={keyword}
        changeHandler={changeHandler}
        clickHandler={clickHandler}
      />
      {error && <p className="error-message">{error}</p>}
      {movies && movies.length > 0 ? (
        movies.map((movie) => (
          <MovieCard 
            key={movie.imdbID} 
            result={movie} 
            onAddToList={appManagedOnAddToList} // Use prop from App.jsx
            myList={appManagedMyList}         // Use prop from App.jsx
          />
        ))
      ) : (
        // Display message only if no error and no movies.
        // If there's an error, the error message will show.
        // If movies array is empty after a search that yields no results but no error, this shows.
        // If movies array is empty initially before any search, this also shows.
        !error && keyword && movies.length === 0 && <p>No movies found for "{keyword}". Try a different search.</p> 
      )}
      {!error && !keyword && movies.length === 0 && <p>Search for movies to see results.</p>}
    </div>
  );
};
