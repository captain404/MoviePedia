<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import '../app.css'; // Ensure global styles are imported here if not handled by app.html effectively for all cases
                       // app.html should be sufficient, but this is a fallback.
  // You can also import other global things here if needed, e.g., a Svelte store initialization
  // that needs to run for every page, though stores are typically self-managing.
</script>

<Header />

<main class="main-content">
  <slot></slot> <!-- Page content will be injected here -->
</main>

<style>
  /* Styles for the layout, if any are needed beyond global app.css */
  /* .main-content is styled in app.css */
  /* Ensure main has some padding if header is fixed, though current header is static */
</style>
