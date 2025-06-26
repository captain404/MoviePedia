<script lang="ts">
  import type { Movie } from '$lib/types';
  import { myList } from '$lib/stores';

  export let movie: Movie;

  // Reactive statement to check if the movie is in myList
  $: isAdded = $myList.some(m => m.imdbID === movie.imdbID);

  function addToMyList() {
    if (!isAdded) {
      myList.update(list => [...list, movie]);
    }
  }

  function handleImageError(event: Event & { currentTarget: EventTarget & HTMLImageElement }) {
    if (event.currentTarget) {
      event.currentTarget.onerror = null; // Prevent infinite loop if placeholder also fails
      event.currentTarget.src = 'https://via.placeholder.com/300x450?text=No+Image';
    }
  }
</script>

<div class="card">
  <img
    src={movie.Poster === "N/A" ? 'https://via.placeholder.com/300x450?text=No+Image' : movie.Poster}
    alt={movie.Title}
    on:error={handleImageError}
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

  <!-- "You might also like" section has been removed -->
</div>

<style>
  /* Styles for MovieCard.svelte, primarily using global styles from app.css */
  /* .card, .card img, .add-to-list-btn, etc. are styled globally */
  /* .card img min-height is now handled by global app.css */

  /* Styles for the removed similar movies section can also be deleted if they were here, */
  /* but they were mostly global or very specific to the removed elements. */
  /* For instance, .similar-movies-section h4 and .similar-movie-card styles are no longer needed here. */
</style>
