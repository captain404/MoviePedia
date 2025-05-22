import React from 'react';

export const ListedMovieItem = ({ movie }) => {
  const handleImageError = (e) => {
    e.target.onerror = null; // Prevent infinite loop
    e.target.src = 'https://via.placeholder.com/150x225?text=No+Image'; // Placeholder for smaller card
  };

  if (!movie) {
    return null;
  }

  return (
    <div className="listed-movie-item">
      <img 
        src={movie.Poster} 
        alt={movie.Title} 
        onError={handleImageError} 
        className="listed-movie-poster"
      />
      <div className="listed-movie-details">
        <h5 className="listed-movie-title">{movie.Title} ({movie.Year})</h5>
        {/* Optionally, add more details like Type or a Remove button later */}
        {/* <p>Type: {movie.Type}</p> */}
      </div>
    </div>
  );
};
