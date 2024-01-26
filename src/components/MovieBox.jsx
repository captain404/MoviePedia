import { useState } from "react";
import { MovieCard } from "./MovieCard";
import { Search } from "./Search";

export const MovieBox = () => {
  // State
  const [keyword, setKeyword] = useState("");
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState("");
  const changeHandler = (e) => {
    setKeyword(e.target.value);
  };
  // API Details
  const apiKey = "afdc4dff";
  const apiURL = `https://www.omdbapi.com/?apikey=${apiKey}&s=${keyword}`;
  // API Call
  const clickHandler = async () => {
    if (keyword == "" || keyword == null) {
      setError("Please enter something...");
      setMovies([]);
      setKeyword("");
    } else {
      const response = await fetch(apiURL);
      const data = await response.json();
      console.log(data);
      if (data.Response == "False") {
        setError("No results found");
        setMovies([]);
        setKeyword("");
      } else {
        setError("");
        setMovies(data.Search);
        setKeyword("");
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
      {error}
      {movies &&
        movies.map((movie, index) => {
          return <MovieCard key={index} result={movie} />;
        })}
    </div>
  );
};
