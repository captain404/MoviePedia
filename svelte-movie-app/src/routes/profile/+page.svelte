<script lang="ts">
  import Profile from '$lib/components/Profile.svelte';
  export let data; // Comes from +page.ts load function, ensures user is loaded
</script>

{#if data.user}
  <Profile />
{:else}
  <!-- This should ideally not be shown due to redirect in load function -->
  <p>Please log in to view your profile.</p>
{/if}
