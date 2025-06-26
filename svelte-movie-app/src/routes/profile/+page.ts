import type { PageLoad } from './$types';
import { currentUser } from '$lib/stores';
import { get } from 'svelte/store';
import { redirect } from '@sveltejs/kit';
import type { User } from '$lib/types';

export const load: PageLoad = async () => {
  // Ensure this runs only on the client-side if localStorage access is problematic during SSR,
  // or ensure stores are initialized in a way that's SSR-compatible.
  // For this setup, `get(currentUser)` reads the store's current value, which is initialized
  // from localStorage in stores.ts (which has a typeof localStorage check).

  const user = get(currentUser);

  if (!user) {
    // If no user is logged in, redirect to the login page
    throw redirect(307, '/login');
  }

  // If user is logged in, pass the user data to the page component
  return {
    user: user as User // Cast to User as we know it's not null here
  };
};
