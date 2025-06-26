export interface User {
  username: string;
  // Add other user-related fields if necessary, e.g., email, id, etc.
  // For this project, only username is stored post-login.
  // Password should never be stored in the frontend user object or localStorage directly after login.
}

export interface Movie {
  imdbID: string;
  Title: string;
  Year: string;
  Poster: string;
  Type: string; // e.g., "movie", "series", "episode"
  // Add other movie details if needed from the API
}

// Interface for the OMDb API search result
export interface OMDbMovieSearchResult {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

// Interface for the OMDb API response (for search)
export interface OMDbSearchResponse {
  Search?: OMDbMovieSearchResult[];
  totalResults?: string;
  Response: "True" | "False";
  Error?: string;
}

// Interface for a more detailed movie response (if fetching by ID, not used in current React app but good for future)
// export interface OMDbMovieDetailResponse extends OMDbMovieSearchResult {
//   Rated?: string;
//   Released?: string;
//   Runtime?: string;
//   Genre?: string;
//   Director?: string;
//   Writer?: string;
//   Actors?: string;
//   Plot?: string;
//   Language?: string;
//   Country?: string;
//   Awards?: string;
//   Ratings?: Array<{ Source: string; Value: string }>;
//   Metascore?: string;
//   imdbRating?: string;
//   imdbVotes?: string;
//   DVD?: string;
//   BoxOffice?: string;
//   Production?: string;
//   Website?: string;
// }
