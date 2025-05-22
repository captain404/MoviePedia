import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
// MemoryRouter should not be used here if App.jsx already provides BrowserRouter
// import { MemoryRouter } from 'react-router-dom'; 
import App from './App'; // Assuming App is the default export

// Mock child components that are heavily tested elsewhere or make external calls not relevant to App logic
// MovieBox has its own fetch calls, so mocking it simplifies App tests.
vi.mock('./components/MovieBox', () => ({
  MovieBox: vi.fn(({ appManagedMyList, appManagedOnAddToList }) => (
    <div data-testid="moviebox-mock">
      <p>My List Count (from MovieBox mock): {appManagedMyList.length}</p>
      <button onClick={() => appManagedOnAddToList({ imdbID: 'newMovie', Title: 'New Movie' })}>
        Add Movie (MovieBox Mock)
      </button>
    </div>
  )),
}));
// Login, Signup, Profile are part of the routes, so we'll let them render to test navigation.

describe('App Component and Authentication Logic', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    // Mock fetch for any potential calls if not all children are perfectly mocked
    global.fetch = vi.fn(() => Promise.resolve({
        json: () => Promise.resolve({ Response: "False", Error: "Mocked fetch" }),
        ok: true,
    }));
  });

  const renderApp = (initialRoute = '/') => {
    // Change window.location to simulate navigating to the initialRoute
    window.history.pushState({}, 'Test page', initialRoute);
    return render(<App />); // App already has BrowserRouter
  };

  describe('Routing and Navigation', () => {
    it('renders MovieBox (mocked) on the default route "/"', () => {
      renderApp('/');
      expect(screen.getByTestId('moviebox-mock')).toBeInTheDocument();
      // Be more specific: Check for the H1 title on the main page
      expect(screen.getByRole('heading', { name: 'MoviePedia', level: 1 })).toBeInTheDocument();
      // And check for the nav logo
      expect(screen.getByRole('link', { name: 'MoviePedia' })).toBeInTheDocument();
    });

    it('navigates to Login page when "Login" link is clicked', async () => {
      renderApp('/');
      fireEvent.click(screen.getByRole('link', { name: /login/i }));
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
      });
    });

    it('navigates to Signup page when "Sign Up" link is clicked', async () => {
      renderApp('/');
      fireEvent.click(screen.getByRole('link', { name: /sign up/i }));
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument();
      });
    });
    
    it('redirects to /login if trying to access /profile when not logged in', () => {
        renderApp('/profile');
        expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument(); // Should be redirected to Login
    });
  });

  describe('Authentication Logic (Signup, Login, Logout, Delete)', () => {
    it('handleSignup creates a user in localStorage and allows login', async () => {
      renderApp('/signup');
      
      // Signup
      fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
      fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

      await waitFor(() => { // Signup navigates to Login
        expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
      });
      const users = JSON.parse(localStorage.getItem('mockUsers'));
      expect(users).toEqual(expect.arrayContaining([expect.objectContaining({ username: 'testuser' })]));

      // Login with new credentials
      fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
      
      await waitFor(() => { // Login navigates to Home, showing MovieBox mock
        expect(screen.getByTestId('moviebox-mock')).toBeInTheDocument();
      });
      expect(screen.getByText(/profile \(testuser\)/i)).toBeInTheDocument(); // Nav link updates
      expect(JSON.parse(localStorage.getItem('currentUser'))).toEqual({ username: 'testuser' });
    });

    it('handleLogout clears currentUser and updates nav', async () => {
      // Setup: Signup and Login first
      localStorage.setItem('mockUsers', JSON.stringify([{ username: 'logoutuser', password: 'password123' }]));
      localStorage.setItem('currentUser', JSON.stringify({ username: 'logoutuser' }));
      
      renderApp('/'); // Start at home, already logged in

      expect(screen.getByText(/profile \(logoutuser\)/i)).toBeInTheDocument();
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument(); // Nav updates
      });
      expect(localStorage.getItem('currentUser')).toBeNull();
    });
    
    it('handleDeleteAccount removes user and logs out', async () => {
        // Setup: Create user and log them in
        localStorage.setItem('mockUsers', JSON.stringify([
            { username: 'deleteuser', password: 'password123' },
            { username: 'anotheruser', password: 'password456'}
        ]));
        localStorage.setItem('currentUser', JSON.stringify({ username: 'deleteuser' }));
        
        renderApp('/profile'); // Navigate to profile page

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /user profile/i})).toBeInTheDocument();
        });
        
        global.confirm = vi.fn(() => true); // Mock confirm to return true

        const deleteButton = screen.getByRole('button', { name: /delete account/i });
        fireEvent.click(deleteButton);

        await waitFor(() => {
            // After deletion and logout, user should be redirected (e.g., to login or home)
            // App.jsx Profile route redirects to /login if !currentUser
            expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
        });

        const usersAfterDeletion = JSON.parse(localStorage.getItem('mockUsers'));
        expect(usersAfterDeletion.find(u => u.username === 'deleteuser')).toBeUndefined();
        expect(usersAfterDeletion.find(u => u.username === 'anotheruser')).toBeDefined();
        expect(localStorage.getItem('currentUser')).toBeNull();
    });
  });

  describe('MyList Management', () => {
    it('handleAddToMyList adds a movie to myList and updates localStorage', async () => {
      // Log in a user first to interact with MovieBox mock that has add button
      localStorage.setItem('mockUsers', JSON.stringify([{ username: 'listuser', password: 'password123' }]));
      localStorage.setItem('currentUser', JSON.stringify({ username: 'listuser' }));
      
      renderApp('/');
      
      await waitFor(() => {
        expect(screen.getByTestId('moviebox-mock')).toBeInTheDocument();
      });

      // Initial list from localStorage (or default empty)
      let myList = JSON.parse(localStorage.getItem('myMovieList')) || [];
      expect(myList.length).toBe(0);

      const addMovieButtonInMock = screen.getByText('Add Movie (MovieBox Mock)');
      fireEvent.click(addMovieButtonInMock);

      await waitFor(() => {
        myList = JSON.parse(localStorage.getItem('myMovieList'));
        expect(myList.length).toBe(1);
        expect(myList[0]).toEqual({ imdbID: 'newMovie', Title: 'New Movie' });
      });
      
      // Example: check if Profile page reflects this (though Profile itself is not deeply tested here)
      // fireEvent.click(screen.getByText(/profile \(listuser\)/i));
      // await waitFor(() => {
      //    expect(screen.getByText(/you have 1 movie\(s\) in your list/i)).toBeInTheDocument();
      // });
    });
  });
});
