<script lang="ts">
  import { goto } from '$app/navigation';
  import { currentUser, myList, logout as storeLogout } from '$lib/stores';
  import type { Movie, User } from '$lib/types';

  let user: User | null = null;
  let userMovies: Movie[] = [];

  currentUser.subscribe(value => {
    user = value;
    if (!user) {
      // This check should ideally be in the +page.svelte load function for the route
      // to prevent rendering this component if no user is logged in.
      // For now, if somehow this component is rendered without a user, redirect.
      if (typeof window !== 'undefined') goto('/login');
    }
  });

  myList.subscribe(value => {
    userMovies = value;
  });

  function handleLogout() {
    storeLogout();
    goto('/login');
  }

  function handleRemoveFromList(imdbIDToRemove: string) {
    myList.update(list => list.filter(movie => movie.imdbID !== imdbIDToRemove));
  }

  function handleDeleteAccount() {
    if (!user) return;

    if (window.confirm('Are you absolutely sure you want to delete your account? This action cannot be undone and will remove all your data.')) {
      let usersString = localStorage.getItem('mockUsers');
      let users: Array<User & { password?: string }> = usersString ? JSON.parse(usersString) : [];

      users = users.filter(u => u.username !== user?.username);
      localStorage.setItem('mockUsers', JSON.stringify(users));

      // Also clear their movie list from the shared 'myMovieList' for this demo.
      // In a real app, user-specific lists would be handled differently.
      // For this mock, the current behavior of App.jsx is that myList is not user-specific
      // but rather a general list overwritten by the last logged-in user.
      // So, deleting the user from mockUsers and logging out is the primary action.
      // If we want to clear the list the user was seeing:
      // myList.set([]); // This would clear the list for the next user too if they log in quickly.
      // The original React app's myList is not strictly tied to a user after they log out,
      // it persists as the last state. Let's mimic that by not clearing myList here,
      // only logging out. The `handleLogout` in App.jsx also doesn't clear `myList`.

      storeLogout(); // This clears currentUser store and its localStorage
      goto('/signup'); // Redirect to signup or login after account deletion
    }
  }

  function handleImageError(event: Event & { currentTarget: EventTarget & HTMLImageElement }) {
    if (event.currentTarget) {
      event.currentTarget.onerror = null;
      event.currentTarget.src = 'https://via.placeholder.com/130x195?text=No+Image';
    }
  }

</script>

<div class="profile-container container">
  {#if user}
    <h2>Profile</h2>
    <div class="profile-details">
      <p><strong>Username:</strong> {user.username}</p>

      <h3>My Movie List</h3>
      {#if userMovies.length > 0}
        <div class="listed-movies-grid">
          {#each userMovies as movie (movie.imdbID)}
            <div class="listed-movie-item">
              <img
                class="listed-movie-poster"
                src={movie.Poster === "N/A" ? 'https://via.placeholder.com/130x195?text=No+Image' : movie.Poster}
                alt={movie.Title}
                on:error={handleImageError}
              />
              <div class="listed-movie-details">
                <h5 class="listed-movie-title">{movie.Title} ({movie.Year})</h5>
              </div>
              <button class="remove-from-list-btn" on:click={() => handleRemoveFromList(movie.imdbID)}>
                Remove
              </button>
            </div>
          {/each}
        </div>
      {:else}
        <p class="empty-list-message">Your movie list is empty. Add some movies!</p>
      {/if}
    </div>

    <div class="profile-actions">
      <button class="auth-button logout-button" on:click={handleLogout}>Logout</button>
      <button class="auth-button delete-account-button" on:click={handleDeleteAccount}>Delete Account</button>
    </div>
  {:else}
    <!-- This part should ideally not be reached if route guards are in place -->
    <p>Loading user profile or please <a href="/login">log in</a>.</p>
  {/if}
</div>

<style>
  /* Styles for Profile.svelte, primarily using global styles from app.css */
  /* .profile-container, .profile-details, .auth-button, etc. are styled globally */

  .remove-from-list-btn {
    background-color: #e74c3c; /* Red for remove/delete actions */
    color: white;
    border: none;
    border-radius: 4px;
    padding: 6px 10px;
    font-size: 12px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    margin-top: 8px; /* Space between details and button */
    width: 100%; /* Make button full width of its parent */
    box-sizing: border-box;
  }

  .remove-from-list-btn:hover {
    background-color: #c0392b; /* Darker red on hover */
  }

  .listed-movie-item {
    /* Ensure this item allows the button to be full width if needed */
  }
  .listed-movie-poster {
    min-height: 195px; /* Consistency for poster height */
  }
</style>
