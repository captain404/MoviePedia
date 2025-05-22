import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Profile } from './Profile';
// ListedMovieItem is rendered by Profile, so it's implicitly tested for rendering if myList has items.
// No need to mock ListedMovieItem unless it has complex internal logic we want to isolate from.

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock window.confirm
global.confirm = vi.fn();

describe('Profile Component', () => {
  const mockCurrentUser = { username: 'testuser' };
  const mockMyList = [
    { imdbID: 'tt1', Title: 'Movie 1', Year: '2020', Poster: 'poster1.jpg' },
    { imdbID: 'tt2', Title: 'Movie 2', Year: '2021', Poster: 'poster2.jpg' },
  ];
  const mockOnLogout = vi.fn();
  const mockOnDeleteAccount = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Default confirm to true, can be overridden in specific tests
    global.confirm.mockReturnValue(true); 
  });

  const renderWithRouter = (ui, { route = '/profile' } = {}) => {
    return render(
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/profile" element={ui} />
          <Route path="/login" element={<div>Login Page Mock for Redirect</div>} />
          <Route path="/" element={<div>Homepage Mock for Redirect</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('redirects to /login if no currentUser is provided', () => {
    renderWithRouter(
      <Profile 
        currentUser={null} 
        onLogout={mockOnLogout} 
        myList={[]} 
        onDeleteAccount={mockOnDeleteAccount} 
      />
    );
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
  });

  it('renders user information and movie list correctly', () => {
    renderWithRouter(
      <Profile 
        currentUser={mockCurrentUser} 
        onLogout={mockOnLogout} 
        myList={mockMyList} 
        onDeleteAccount={mockOnDeleteAccount} 
      />
    );

    expect(screen.getByRole('heading', { name: /user profile/i })).toBeInTheDocument();
    // Use a custom text matcher for the username paragraph
    expect(screen.getByText((content, element) => {
        return element.tagName.toLowerCase() === 'p' && 
               element.textContent === `Username: ${mockCurrentUser.username}`;
    })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /my movie list/i })).toBeInTheDocument();
    
    // Check for movie items (rendered by ListedMovieItem)
    expect(screen.getByText('Movie 1 (2020)')).toBeInTheDocument();
    expect(screen.getByText('Movie 2 (2021)')).toBeInTheDocument();
    expect(screen.getAllByRole('img').length).toBeGreaterThanOrEqual(2); // Assuming ListedMovieItem renders img
  });

  it('displays empty list message if myList is empty', () => {
    renderWithRouter(
      <Profile 
        currentUser={mockCurrentUser} 
        onLogout={mockOnLogout} 
        myList={[]} 
        onDeleteAccount={mockOnDeleteAccount} 
      />
    );
    expect(screen.getByText('Your movie list is currently empty. Add some movies!')).toBeInTheDocument();
  });

  it('calls onLogout and navigates when Logout button is clicked', () => {
    renderWithRouter(
      <Profile 
        currentUser={mockCurrentUser} 
        onLogout={mockOnLogout} 
        myList={mockMyList} 
        onDeleteAccount={mockOnDeleteAccount} 
      />
    );
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);

    expect(mockOnLogout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  describe('Delete Account Button', () => {
    it('calls onDeleteAccount if user confirms deletion', () => {
      global.confirm.mockReturnValueOnce(true); // User clicks "OK"
      renderWithRouter(
        <Profile 
          currentUser={mockCurrentUser} 
          onLogout={mockOnLogout} 
          myList={mockMyList} 
          onDeleteAccount={mockOnDeleteAccount} 
        />
      );
      const deleteButton = screen.getByRole('button', { name: /delete account/i });
      fireEvent.click(deleteButton);

      expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to delete your account? This action cannot be undone.');
      expect(mockOnDeleteAccount).toHaveBeenCalledTimes(1);
    });

    it('does not call onDeleteAccount if user cancels deletion', () => {
      global.confirm.mockReturnValueOnce(false); // User clicks "Cancel"
      renderWithRouter(
        <Profile 
          currentUser={mockCurrentUser} 
          onLogout={mockOnLogout} 
          myList={mockMyList} 
          onDeleteAccount={mockOnDeleteAccount} 
        />
      );
      const deleteButton = screen.getByRole('button', { name: /delete account/i });
      fireEvent.click(deleteButton);

      expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to delete your account? This action cannot be undone.');
      expect(mockOnDeleteAccount).not.toHaveBeenCalled();
    });
  });
});
