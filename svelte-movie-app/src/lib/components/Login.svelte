<script lang="ts">
  import { goto } from '$app/navigation';
  import { currentUser } from '$lib/stores';
  import type { User } from '$lib/types';

  let username = '';
  let password = '';
  let errorMessage = '';

  function handleLogin() {
    errorMessage = ''; // Reset error message
    if (!username || !password) {
      errorMessage = 'Username and password are required.';
      return;
    }

    const usersString = localStorage.getItem('mockUsers');
    const users: Array<User & { password?: string }> = usersString ? JSON.parse(usersString) : [];

    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      // On successful login, store user info (without password) in the Svelte store
      currentUser.set({ username: user.username });
      // Redirect to profile or home page
      goto('/profile');
    } else {
      errorMessage = 'Invalid username or password.';
    }
  }
</script>

<div class="auth-form-container">
  <h2>Login</h2>
  {#if errorMessage}
    <p class="error-message">{errorMessage}</p>
  {/if}
  <form on:submit|preventDefault={handleLogin}>
    <div class="form-group">
      <label for="username">Username</label>
      <input type="text" id="username" bind:value={username} required />
    </div>
    <div class="form-group">
      <label for="password">Password</label>
      <input type="password" id="password" bind:value={password} required />
    </div>
    <button type="submit" class="auth-button">Login</button>
  </form>
  <p class="switch-auth-link">
    Don't have an account? <a href="/signup">Sign Up</a>
  </p>
</div>

<style>
  /* Styles for Login.svelte, primarily using global styles from app.css */
  /* .auth-form-container, .form-group, .auth-button, .error-message, .switch-auth-link */
  /* are styled globally in app.css */
</style>
