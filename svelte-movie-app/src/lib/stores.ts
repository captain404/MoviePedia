import { writable, type Writable } from 'svelte/store';
import type { User, Movie } from './types';

// Helper function to get initial value from localStorage or return a default
function getFromLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof localStorage !== 'undefined') {
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
      try {
        return JSON.parse(storedValue);
      } catch (e) {
        console.error(`Error parsing localStorage item ${key}:`, e);
        localStorage.removeItem(key); // Remove corrupted item
        return defaultValue;
      }
    }
  }
  return defaultValue;
}

// Helper function to update localStorage whenever the store changes
function persistStore<T>(store: Writable<T>, key: string) {
  store.subscribe(value => {
    if (typeof localStorage !== 'undefined') {
      if (value === null || value === undefined) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    }
  });
}

// Current User Store
const initialUser = getFromLocalStorage<User | null>('currentUser', null);
export const currentUser = writable<User | null>(initialUser);
persistStore(currentUser, 'currentUser');

// My List Store (list of movies)
const initialMyList = getFromLocalStorage<Movie[]>('myMovieList', []);
export const myList = writable<Movie[]>(initialMyList);
persistStore(myList, 'myMovieList');

// Mock users store for login/signup demonstration (not typically a Svelte store for this)
// This will be managed by direct localStorage access in auth components/functions
// as it's not something that needs to be reactive across the app in the same way as currentUser.
// However, if we needed to display a list of users or something, then a store would be appropriate.

export function logout() {
  currentUser.set(null);
  // Potentially clear other user-specific data if needed
}
