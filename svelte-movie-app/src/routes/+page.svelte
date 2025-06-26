<script lang="ts">
  import Search from '$lib/components/Search.svelte';
  import MovieList from '$lib/components/MovieList.svelte';
  import type { Movie } from '$lib/types';
  import { searchMovies } from '$lib/api';

  let keywordFromSearch = ''; // This will be bound to the Search component's keyword prop
  let movies: Movie[] = [];
  let error: string = '';
  let isLoading: boolean = false;
  let initialLoad: boolean = true; // To track if it's the first load before any search

  async function handleSearch(event: CustomEvent<string>) {
    const searchTerm = event.detail;
    keywordFromSearch = searchTerm; // Update keyword for display if needed
    initialLoad = false; // A search has been initiated

    if (!searchTerm.trim()) {
      error = 'Please enter something to search.';
      movies = [];
      isLoading = false;
      return;
    }

    isLoading = true;
    error = '';
    movies = [];

    const result = await searchMovies(searchTerm);
    if (result.movies) {
      movies = result.movies;
    } else if (result.error) {
      error = result.error;
    }
    isLoading = false;
  }
</script>

<div class="container">
  <h1>MoviePedia</h1>
  <p>
    Explore a vast cinematic universe with our user-friendly movie search website. Discover, rate, and find your favorite films effortlessly.
  </p>

  <Search bind:keyword={keywordFromSearch} on:search={handleSearch} />

  {#if isLoading}
    <p>Loading movies...</p>
  {:else if error}
    <div class="wrapper"> <!-- Wrapper needed for grid-column span on error message -->
      <p class="error-message">{error}</p>
    </div>
  {:else if movies.length > 0}
    <MovieList {movies} />
  {:else if !initialLoad && movies.length === 0 && keywordFromSearch}
    <div class="wrapper">
       <p>No movies found for "{keywordFromSearch}". Try a different search.</p>
    </div>
  {:else if !initialLoad || (initialLoad && !keywordFromSearch)}
     <!-- Message before any search or if search was cleared -->
    <div class="wrapper">
      <p>Search for movies to see results.</p>
    </div>
  {/if}
</div>

<style>
  /* Scoped styles for +page.svelte if needed */
  .container h1 {
    /* Specific styling for h1 on this page if needed */
  }
  .container p {
    /* Specific styling for p on this page if needed */
  }
  /* Ensure messages like "Loading movies..." or "No movies found..." are styled appropriately. */
  /* The global .error-message class will handle API errors. */
  /* Other messages can use simple <p> tags or have their own classes if complex styling is needed. */
  /* The .wrapper for messages ensures they fit into the grid layout similar to how errors are handled */
  .wrapper > p {
    color: #555;
    font-size: 16px;
    text-align: center;
    padding: 10px;
    background-color: #f9f9f9;
    border-radius: 5px;
    grid-column: 1 / -1; /* Make message span full width of the grid */
    margin-top: 15px;
  }
</style>
