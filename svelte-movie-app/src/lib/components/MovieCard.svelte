<script lang="ts">
  import { onMount } from 'svelte';
  import type { Movie } from '$lib/types';
  import { myList } from '$lib/stores';
  import { fetchSimilarMovies } from '$lib/api';

  export let movie: Movie;

  let similarMovies: Movie[] = [];
  let similarMoviesError: string = "";
  let isLoadingSimilarMovies: boolean = false;

  // Reactive statement to check if the movie is in myList
  $: isAdded = $myList.some(m => m.imdbID === movie.imdbID);

  function addToMyList() {
    if (!isAdded) {
      myList.update(list => [...list, movie]);
    }
  }

  function handleImageError(event: Event & { currentTarget: EventTarget & HTMLImageElement }, isSimilar = false) {
    if (event.currentTarget) {
      event.currentTarget.onerror = null; // Prevent infinite loop if placeholder also fails
      event.currentTarget.src = isSimilar
        ? 'https://via.placeholder.com/100x150?text=No+Image'
        : 'https://via.placeholder.com/300x450?text=No+Image';
    }
  }

  onMount(async () => {
    if (movie && movie.Title && movie.imdbID) {
      isLoadingSimilarMovies = true;
      similarMoviesError = "";
      const result = await fetchSimilarMovies(movie.Title, movie.imdbID);
      if (result.movies) {
        similarMovies = result.movies;
      }
      if (result.error) {
        similarMoviesError = result.error;
      }
      isLoadingSimilarMovies = false;
    }
  });
</script>

<div class="card">
  <img
    src={movie.Poster === "N/A" ? 'https://via.placeholder.com/300x450?text=No+Image' : movie.Poster}
    alt={movie.Title}
    on:error={(e) => handleImageError(e)}
  />
  <h2>{movie.Title} ({movie.Year})</h2>
  <p>Type: {movie.Type}</p>

  <button
    class="add-to-list-btn"
    class:added={isAdded}
    on:click={addToMyList}
    disabled={isAdded}
  >
    {isAdded ? 'Added to List' : 'Add to List'}
  </button>

  {#if isLoadingSimilarMovies}
    <p>Loading similar movies...</p>
  {:else if similarMovies.length > 0}
    <div class="similar-movies-section">
      <h4>You might also like:</h4>
      <div class="similar-movies-grid">
        {#each similarMovies as similarMovie (similarMovie.imdbID)}
          <div class="similar-movie-card">
            <a href="https://www.imdb.com/title/{similarMovie.imdbID}/" target="_blank" rel="noopener noreferrer">
              <img
                src={similarMovie.Poster === "N/A" ? 'https://via.placeholder.com/100x150?text=No+Image' : similarMovie.Poster}
                alt={similarMovie.Title}
                on:error={(e) => handleImageError(e, true)}
              />
              <p>{similarMovie.Title} ({similarMovie.Year})</p>
            </a>
          </div>
        {/each}
      </div>
    </div>
  {:else if similarMoviesError && !isLoadingSimilarMovies}
    <p class="error-message-similar">{similarMoviesError}</p>
  {/if}
</div>

<style>
  /* Styles for MovieCard.svelte, primarily using global styles from app.css */
  /* .card, .card img, .add-to-list-btn, etc. are styled globally */
  .similar-movies-section h4 {
    text-align: center; /* Centering the "You might also like" text */
  }
  .similar-movie-card a {
    text-decoration: none;
    color: inherit;
  }
  .similar-movie-card img {
     min-height: 150px; /* ensure placeholder and image have same height */
  }
  /* .card img min-height is now handled by global app.css */
</style>
