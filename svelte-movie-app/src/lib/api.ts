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
// Removed fetchSimilarMovies function as it's no longer used.
