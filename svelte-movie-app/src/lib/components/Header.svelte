<script lang="ts">
  import { currentUser, logout } from '$lib/stores';
  import { page } from '$app/stores'; // For active link styling
  import { goto } from '$app/navigation'; // For navigation on logout

  let currentUsername: string | null = null;

  currentUser.subscribe(value => {
    currentUsername = value ? value.username : null;
  });

  function handleLogout() {
    logout();
    goto('/login'); // Redirect to login page after logout
  }

  // Reactive declaration for active class (optional, but good UX)
  $: isRouteActive = (path: string) => $page.url.pathname === path;

</script>

<nav class="main-nav">
  <a href="/" class="nav-logo">MoviePedia</a>
  <div class="nav-links">
    {#if $currentUser}
      <a href="/profile" class:active={isRouteActive('/profile')}>Profile ({currentUsername})</a>
      <button on:click={handleLogout} class="nav-button logout-nav-btn">Logout</button>
    {:else}
      <a href="/login" class:active={isRouteActive('/login')}>Login</a>
      <a href="/signup" class:active={isRouteActive('/signup')}>Sign Up</a>
    {/if}
  </div>
</nav>

<style>
  /* Styles for Header.svelte, can also rely on global app.css */
  /* .main-nav, .nav-logo, .nav-links, etc. are styled globally in app.css */
  /* Active class styling (example, if not fully covered by global) */
  .nav-links a.active {
    background-color: #3498db; /* Ensure this matches global or is desired override */
    color: #fff;
  }

  /* Ensure nav buttons have consistent styling if not fully covered by global */
  .logout-nav-btn {
    /* Styles are in app.css, but can be refined here if needed */
  }
</style>
