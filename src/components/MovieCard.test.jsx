import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MovieCard } from './MovieCard';

// Mock the global fetch API
global.fetch = vi.fn();

describe('MovieCard Component', () => {
  const mockMovie = {
    imdbID: 'tt12345',
    Title: 'Test Movie Title',
    Year: '2023',
    Type: 'movie',
    Poster: 'https://via.placeholder.com/300x450?text=Test+Poster',
  };

  const mockMyList = [];
  const mockOnAddToList = vi.fn();

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    // Default successful fetch for similar movies (empty for now, can be overridden)
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ Response: 'True', Search: [] }),
    });
    // Give a default mock for any fetch call within useEffect that runs on initial mount
    // This ensures that even if not explicitly testing similar movies, the fetch call
    // within useEffect is handled.
    fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ Response: 'True', Search: [] }), // Default to no similar movies
    });
  });

  it('renders movie details correctly', async () => {
    render(<MovieCard result={mockMovie} myList={mockMyList} onAddToList={mockOnAddToList} />);
    
    // Wait for any potential state updates from initial useEffect to settle
    await waitFor(() => {
      expect(screen.getByText(`${mockMovie.Title} (${mockMovie.Year})`)).toBeInTheDocument();
      expect(screen.getByText(`Type: ${mockMovie.Type}`)).toBeInTheDocument();
    });
    const posterImg = screen.getByAltText(mockMovie.Title);
    expect(posterImg).toBeInTheDocument();
    expect(posterImg.src).toBe(mockMovie.Poster);
  });

  it('renders "Add to List" button when movie is not in list', async () => {
    render(<MovieCard result={mockMovie} myList={[]} onAddToList={mockOnAddToList} />);
    const addButton = await screen.findByRole('button', { name: /add to list/i });
    expect(addButton).toBeInTheDocument();
    expect(addButton).not.toBeDisabled();
  });

  it('calls onAddToList when "Add to List" button is clicked', async () => {
    render(<MovieCard result={mockMovie} myList={[]} onAddToList={mockOnAddToList} />);
    const addButton = await screen.findByRole('button', { name: /add to list/i });
    fireEvent.click(addButton);
    expect(mockOnAddToList).toHaveBeenCalledWith(mockMovie);
  });

  it('renders "Added to List" button when movie is in list and button is disabled', async () => {
    render(<MovieCard result={mockMovie} myList={[mockMovie]} onAddToList={mockOnAddToList} />);
    const addedButton = await screen.findByRole('button', { name: /added to list/i });
    expect(addedButton).toBeInTheDocument();
    expect(addedButton).toBeDisabled();
  });

  it('does not call onAddToList when "Added to List" button is clicked (as it is disabled)', async () => {
    render(<MovieCard result={mockMovie} myList={[mockMovie]} onAddToList={mockOnAddToList} />);
    const addedButton = await screen.findByRole('button', { name: /added to list/i });
    fireEvent.click(addedButton); // Clicking a disabled button shouldn't do anything
    expect(mockOnAddToList).not.toHaveBeenCalled();
  });

  describe('Similar Movies Functionality', () => {
    const similarMovieResults = [
      { imdbID: 'tt67890', Title: 'Similar Movie 1', Year: '2022', Poster: 'poster1.jpg' },
      { imdbID: 'tt09876', Title: 'Similar Movie 2', Year: '2021', Poster: 'poster2.jpg' },
    ];

    it('fetches and displays similar movies', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ Response: 'True', Search: similarMovieResults }),
      });

      render(<MovieCard result={mockMovie} myList={[]} onAddToList={mockOnAddToList} />);

      // Wait for similar movies to appear
      expect(await screen.findByText('You might also like:')).toBeInTheDocument();
      expect(screen.getByText('Similar Movie 1 (2022)')).toBeInTheDocument();
      expect(screen.getByText('Similar Movie 2 (2021)')).toBeInTheDocument();
      // Check that the original movie itself is not listed as similar (if API included it)
      expect(screen.queryByText(`${mockMovie.Title} (${mockMovie.Year})`, { selector: '.similar-movie-card p' })).not.toBeInTheDocument();
    });

    it('displays "No other movies found" message if API returns no similar results for the term', async () => {
        // Mock fetch to simulate no similar movies found for the search term
        fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ Response: 'True', Search: [] }), // Empty search results
        });
  
        render(<MovieCard result={mockMovie} myList={[]} onAddToList={mockOnAddToList} />);
        
        // Check for the specific message. The exact wording depends on implementation.
        // Current implementation: `No other movies found for term: "${searchTerm}"`
        // The searchTerm is derived, so we look for a partial match.
        await waitFor(() => {
            expect(screen.getByText(/No other movies found for term:/i)).toBeInTheDocument();
        });
        expect(screen.queryByText('You might also like:')).not.toBeInTheDocument();
      });

    it('displays error message if fetching similar movies fails', async () => {
      fetch.mockRejectedValueOnce(new Error('API error for similar movies'));
      render(<MovieCard result={mockMovie} myList={[]} onAddToList={mockOnAddToList} />);
      
      expect(await screen.findByText('Failed to fetch similar movies due to a network or server issue.')).toBeInTheDocument();
      expect(screen.queryByText('You might also like:')).not.toBeInTheDocument();
    });

    it('does not attempt to fetch similar movies if main movie result is incomplete', () => {
        const incompleteMovie = { ...mockMovie, Title: undefined }; // Missing title
        render(<MovieCard result={incompleteMovie} myList={[]} onAddToList={mockOnAddToList} />);
        
        // Verify fetch was not called for similar movies
        // The initial fetch in MovieCard is for similar movies.
        // If title is missing, it should not proceed.
        // The base URL is https://www.omdbapi.com/?apikey=afdc4dff
        // It makes a call like `${apiBaseURL}&s=${encodeURIComponent(searchTerm)}&type=movie`
        // So, if fetch is called, it would contain this base URL.
        // Here, we assert it's NOT called.
        expect(fetch).not.toHaveBeenCalledWith(expect.stringContaining('&s='));
        expect(screen.queryByText('You might also like:')).not.toBeInTheDocument();
      });
  });
});
