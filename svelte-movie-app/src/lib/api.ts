import type { OMDbSearchResponse, Movie, OMDbMovieSearchResult } from './types';

const API_KEY = 'afdc4dff'; // Hardcoded API key as in the original React app
const BASE_URL = `https://www.omdbapi.com/?apikey=${API_KEY}`;

/**
 * Searches for movies by a keyword.
 * @param keyword The search term.
 * @returns A promise that resolves to an array of movies or an error string.
 */
export async function searchMovies(keyword: string): Promise<{ movies?: Movie[]; error?: string }> {
  if (!keyword.trim()) {
    return { error: 'Please enter a search term.' };
  }

  try {
    const response = await fetch(`${BASE_URL}&s=${encodeURIComponent(keyword)}`);
    if (!response.ok) {
      // Network error or non-2xx HTTP status
      return { error: `Network response was not ok: ${response.statusText}` };
    }
    const data: OMDbSearchResponse = await response.json();

    if (data.Response === 'True' && data.Search) {
      // Map OMDbMovieSearchResult to our Movie type
      const movies: Movie[] = data.Search.map(result => ({
        imdbID: result.imdbID,
        Title: result.Title,
        Year: result.Year,
        Poster: result.Poster,
        Type: result.Type,
      }));
      return { movies };
    } else {
      return { error: data.Error || 'No results found.' };
    }
  } catch (err) {
    console.error('Failed to fetch movies:', err);
    // Check if err is an instance of Error to safely access message property
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
    return { error: `Failed to fetch movies. ${errorMessage}` };
  }
}

/**
 * Fetches "similar" movies. In the context of the original app,
 * this meant searching based on a keyword derived from the original movie's title.
 * @param title The title of the movie to find similar ones for.
 * @param originalImdbID The imdbID of the original movie to exclude it from results.
 * @returns A promise that resolves to an array of similar movies or an error string.
 */
export async function fetchSimilarMovies(title: string, originalImdbID: string): Promise<{ movies?: Movie[]; error?: string }> {
  if (!title) {
    return { movies: [] }; // No title, no similar movies
  }

  // Logic to extract a search term from the title (simplified from React's MovieCard)
  const titleParts = title.trim().split(" ");
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
    return { movies: [] }; // No valid search term extracted
  }

  try {
    const response = await fetch(`${BASE_URL}&s=${encodeURIComponent(searchTerm)}&type=movie`);
    if (!response.ok) {
      return { error: `Network response was not ok: ${response.statusText}` };
    }
    const data: OMDbSearchResponse = await response.json();

    if (data.Response === 'True' && data.Search) {
      const similarMovies: Movie[] = data.Search
        .filter(movie => movie.imdbID !== originalImdbID) // Exclude the original movie
        .slice(0, 4) // Take up to 4 similar movies
        .map(result => ({ // Map to our Movie type
          imdbID: result.imdbID,
          Title: result.Title,
          Year: result.Year,
          Poster: result.Poster,
          Type: result.Type,
        }));

      if (similarMovies.length === 0) {
        return { error: `No other movies found for term: "${searchTerm}"`, movies: [] };
      }
      return { movies: similarMovies };
    } else {
      // Gracefully handle "Movie not found!" or "Too many results." from OMDb for similar search
      if (data.Error === "Movie not found!" || data.Error === "Too many results.") {
        return { error: `Could not find similar movies for "${searchTerm}".`, movies: [] };
      }
      return { error: data.Error || 'No similar movies found.', movies: [] };
    }
  } catch (err) {
    console.error('Error fetching similar movies:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
    return { error: `Failed to fetch similar movies. ${errorMessage}`, movies: [] };
  }
}
