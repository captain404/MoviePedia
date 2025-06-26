<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let keyword: string = ""; // Bound from parent

  const dispatch = createEventDispatcher<{ search: string }>();

  function handleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    keyword = target.value;
    // Parent can bind to 'keyword' directly, explicit dispatch for change not strictly needed
    // if using bind:keyword in parent.
  }

  function handleClick() {
    dispatch('search', keyword);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      handleClick();
    }
  }
</script>

<div class="inputBox">
  <input
    type="text"
    bind:value={keyword}
    on:input={handleChange}
    on:keydown={handleKeydown}
    placeholder="Search for movies..."
  />
  <button on:click={handleClick}>Search</button>
</div>

<style>
  /* Styles for Search.svelte, primarily using global styles from app.css */
  /* .inputBox, .inputBox input, .inputBox button are styled globally */
</style>
