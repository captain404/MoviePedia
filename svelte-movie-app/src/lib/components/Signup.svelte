<script lang="ts">
  import { goto } from '$app/navigation';
  import type { User } from '$lib/types';

  let username = '';
  let password = '';
  let confirmPassword = '';
  let errorMessage = '';
  let successMessage = '';

  function handleSignup() {
    errorMessage = '';
    successMessage = '';

    if (!username || !password || !confirmPassword) {
      errorMessage = 'All fields are required.';
      return;
    }
    if (password !== confirmPassword) {
      errorMessage = 'Passwords do not match.';
      return;
    }
    if (password.length < 6) { // Basic password length validation
        errorMessage = 'Password must be at least 6 characters long.';
        return;
    }

    const usersString = localStorage.getItem('mockUsers');
    const users: Array<User & { password?: string }> = usersString ? JSON.parse(usersString) : [];

    const userExists = users.some(user => user.username === username);

    if (userExists) {
      errorMessage = 'Username already exists. Please choose another.';
      return;
    }

    // IMPORTANT: Mock password storage. In a real app, hash passwords securely on the backend.
    const newUser = { username, password }; // Storing password directly for mock purposes
    users.push(newUser);
    localStorage.setItem('mockUsers', JSON.stringify(users));

    successMessage = 'Signup successful! Redirecting to login...';
    // Clear form
    username = '';
    password = '';
    confirmPassword = '';

    setTimeout(() => {
      goto('/login');
    }, 2000); // Redirect after 2 seconds
  }
</script>

<div class="auth-form-container">
  <h2>Sign Up</h2>
  {#if errorMessage}
    <p class="error-message">{errorMessage}</p>
  {/if}
  {#if successMessage}
    <p class="success-message">{successMessage}</p> <!-- Needs styling -->
  {/if}
  <form on:submit|preventDefault={handleSignup}>
    <div class="form-group">
      <label for="username">Username</label>
      <input type="text" id="username" bind:value={username} required />
    </div>
    <div class="form-group">
      <label for="password">Password</label>
      <input type="password" id="password" bind:value={password} required />
    </div>
    <div class="form-group">
      <label for="confirmPassword">Confirm Password</label>
      <input type="password" id="confirmPassword" bind:value={confirmPassword} required />
    </div>
    <button type="submit" class="auth-button">Sign Up</button>
  </form>
  <p class="auth-disclaimer">
    Note: This is a demo. Passwords are stored in plain text in local storage for mock purposes only.
    Do not use real passwords.
  </p>
  <p class="switch-auth-link">
    Already have an account? <a href="/login">Login</a>
  </p>
</div>

<style>
  /* Styles for Signup.svelte, primarily using global styles from app.css */
  .success-message {
    background-color: #d4edda; /* Light green */
    color: #155724; /* Dark green */
    padding: 10px;
    border-radius: 4px;
    margin-bottom: 15px;
    text-align: center;
    border: 1px solid #c3e6cb;
  }
</style>
