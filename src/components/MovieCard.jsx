import React from "react";

export const MovieCard = ({ result }) => {
  return (
    <>
      <div className="card">
        <img src={result.Poster} alt={result.Title} />
        <h2>
          {result.Title} ({result.Year})
        </h2>
        <p>Type: {result.Type}</p>
      </div>
    </>
  );
};
