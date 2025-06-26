<script lang="ts">
  import type { Movie } from '$lib/types';
  import MovieCard from './MovieCard.svelte';

  export let movies: Movie[] = [];
</script>

{#if movies && movies.length > 0}
  <div class="wrapper">
    {#each movies as movie (movie.imdbID)}
      <MovieCard {movie} />
    {/each}
  </div>
{:else}
  <!-- Message for no movies will be handled by the parent page component -->
  <!-- This component only renders the list if movies are present -->
{/if}

<style>
  /* Styles for MovieList.svelte, primarily using global styles from app.css */
  /* .wrapper is styled globally in app.css */
</style>
