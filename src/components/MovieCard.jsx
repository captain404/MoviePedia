import React, { useState, useEffect } from "react";

// TODO: Move API key and URL to a shared constants file or pass as props for better practice
const apiKey = "afdc4dff"; 
const apiBaseURL = `https://www.omdbapi.com/?apikey=${apiKey}`;

export const MovieCard = ({ result, onAddToList, myList }) => { // Added onAddToList and myList props
  const [similarMovies, setSimilarMovies] = useState([]);
  const [similarMoviesError, setSimilarMoviesError] = useState("");

  const isMovieAdded = myList && myList.some(movie => movie.imdbID === result.imdbID);

  useEffect(() => {
    const fetchSimilarMovies = async () => {
      if (!result || !result.Title || !result.imdbID) {
        setSimilarMovies([]);
        setSimilarMoviesError("");
        return;
      }

      const titleParts = result.Title.trim().split(" ");
      let searchTerm = titleParts[0];
      if (titleParts.length > 1 && (titleParts[0].length < 3 || titleParts[0].toLowerCase() === "the" || titleParts[0].toLowerCase() === "a")) {
        searchTerm = titleParts[1];
      }
      if (searchTerm.length < 3 && titleParts.length > 2) {
          if (titleParts[0].toLowerCase() === "the" || titleParts[0].toLowerCase() === "a") {
            searchTerm = titleParts[1] + " " + titleParts[2];
          } else {
            searchTerm = titleParts[0] + " " + titleParts[1];
          }
      }
      if (!searchTerm && titleParts.length > 0) {
        searchTerm = titleParts[0];
      }

      if (!searchTerm) {
        setSimilarMovies([]);
        setSimilarMoviesError("");
        return;
      }
      
      try {
        setSimilarMoviesError("");
        setSimilarMovies([]); 
        const response = await fetch(`${apiBaseURL}&s=${encodeURIComponent(searchTerm)}&type=movie`);
        const data = await response.json();

        if (data.Response === "True" && data.Search) {
          const filteredMovies = data.Search.filter(
            (movie) => movie.imdbID !== result.imdbID 
          ).slice(0, 4);
          
          setSimilarMovies(filteredMovies);
          if (filteredMovies.length === 0) {
            setSimilarMoviesError(`No other movies found for term: "${searchTerm}"`);
          }
        } else {
          setSimilarMovies([]);
          if (data.Error === "Movie not found!" || data.Error === "Too many results.") {
            setSimilarMoviesError(`Could not find similar movies for "${searchTerm}".`);
          } else {
            setSimilarMoviesError(data.Error || "No similar movies found.");
          }
        }
      } catch (error) {
        console.error("Error fetching similar movies:", error);
        setSimilarMovies([]);
        setSimilarMoviesError("Failed to fetch similar movies due to a network or server issue.");
      }
    };

    if (result && result.Title) {
        fetchSimilarMovies();
    } else {
        setSimilarMovies([]);
        setSimilarMoviesError("");
    }
  }, [result]);

  const handleImageError = (e, isSimilar = false) => {
    e.target.onerror = null;
    if (isSimilar) {
      e.target.src = 'https://via.placeholder.com/100x150?text=No+Image';
    } else {
      e.target.src = 'https://via.placeholder.com/300x450?text=No+Image';
    }
  };

  if (!result) {
    return null;
  }

  const handleAddClick = () => {
    if (!isMovieAdded && onAddToList) {
      onAddToList(result);
    }
  };

  return (
    <div className="card">
      <img 
        src={result.Poster} 
        alt={result.Title} 
        onError={(e) => handleImageError(e, false)} 
      />
      <h2>
        {result.Title} ({result.Year})
      </h2>
      <p>Type: {result.Type}</p>
      
      <button 
        className={`add-to-list-btn ${isMovieAdded ? 'added' : ''}`}
        onClick={handleAddClick}
        disabled={isMovieAdded}
      >
        {isMovieAdded ? 'Added to List' : 'Add to List'}
      </button>

      {similarMovies.length > 0 && (
        <div className="similar-movies-section">
          <h4>You might also like:</h4>
          <div className="similar-movies-grid">
            {similarMovies.map((movie) => (
              <div key={movie.imdbID} className="similar-movie-card">
                <img 
                  src={movie.Poster} 
                  alt={movie.Title} 
                  onError={(e) => handleImageError(e, true)} 
                />
                <p>{movie.Title} ({movie.Year})</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {similarMoviesError && similarMovies.length === 0 && (
        <p className="error-message-similar">{similarMoviesError}</p>
      )}
    </div>
  );
};
