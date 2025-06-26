import type { PageLoad } from './$types';
import { currentUser } from '$lib/stores';
import { get } from 'svelte/store';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = async () => {
  const user = get(currentUser);
  if (user) {
    // If user is already logged in, redirect them from the signup page
    throw redirect(307, '/profile');
  }
  return {}; // Return empty object if no redirection
};
