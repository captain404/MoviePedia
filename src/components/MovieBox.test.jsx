import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MovieBox } from './MovieBox';
// MovieCard and Search are child components. We'll mostly test that MovieBox renders them
// and passes correct props, rather than testing their internal logic here again.

// Mock global fetch
global.fetch = vi.fn();

// Mock child components for simplicity in some tests, or let them render
vi.mock('./Search', () => ({
  Search: vi.fn(({ keyword, changeHandler, clickHandler }) => (
    <div>
      <input type="text" value={keyword} onChange={changeHandler} data-testid="search-input" />
      <button onClick={clickHandler} data-testid="search-button">Search</button>
    </div>
  )),
}));

// We will let MovieCard render to check if it receives props,
// but its internal fetch for similar movies needs to be handled if we don't mock it.
// For MovieBox tests, it's better to mock MovieCard if its internal async operations interfere.
// However, MovieCard's similar movies fetch is triggered by its own props, not MovieBox directly.
// Let's try without fully mocking MovieCard first, ensuring its similar movies fetch is controlled.
vi.mock('./MovieCard', () => ({
    MovieCard: vi.fn(({ result, myList, onAddToList }) => (
      <div data-testid={`movie-card-${result.imdbID}`}>
        <h3>{result.Title}</h3>
        <p>MyList Count: {myList ? myList.length : 0}</p>
        <button onClick={() => onAddToList(result)}>Add</button>
      </div>
    )),
  }));


describe('MovieBox Component', () => {
  const mockAppManagedMyList = [{ imdbID: 'tt001', Title: 'In List Movie' }];
  const mockAppManagedOnAddToList = vi.fn();

  beforeEach(async () => { // Made beforeEach async
    vi.clearAllMocks();
    // Default successful fetch for movie search (empty results)
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ Response: 'True', Search: [] }),
    });
    // Reset mocks for child components
    // Since Search and MovieCard are auto-mocked via vi.mock at the top of the file,
    // we can import them and then clear their mocks.
    const { Search } = await import('./Search');
    const { MovieCard } = await import('./MovieCard');
    if (vi.isMockFunction(Search)) Search.mockClear();
    if (vi.isMockFunction(MovieCard)) MovieCard.mockClear();
  });

  it('renders Search component', () => {
    render(
      <MovieBox 
        appManagedMyList={mockAppManagedMyList} 
        appManagedOnAddToList={mockAppManagedOnAddToList} 
      />
    );
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    expect(screen.getByTestId('search-button')).toBeInTheDocument();
  });

  it('displays "Please enter something..." if search is clicked with empty keyword', async () => {
    render(
      <MovieBox 
        appManagedMyList={mockAppManagedMyList} 
        appManagedOnAddToList={mockAppManagedOnAddToList} 
      />
    );
    const searchButton = screen.getByTestId('search-button');
    fireEvent.click(searchButton);

    expect(await screen.findByText('Please enter something...')).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('calls fetch with correct URL and renders movies on successful search', async () => {
    const searchResults = [
      { imdbID: 'tt123', Title: 'Movie A', Year: '2020' },
      { imdbID: 'tt456', Title: 'Movie B', Year: '2021' },
    ];
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ Response: 'True', Search: searchResults }),
    });

    render(
      <MovieBox 
        appManagedMyList={mockAppManagedMyList} 
        appManagedOnAddToList={mockAppManagedOnAddToList} 
      />
    );

    const searchInput = screen.getByTestId('search-input');
    const searchButton = screen.getByTestId('search-button');

    fireEvent.change(searchInput, { target: { value: 'Matrix' } });
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('s=Matrix'));
    });
    
    // Check if MovieCard mock was called for each movie
    const { MovieCard: MovieCardMock } = await import('./MovieCard'); // Get the mock
    await waitFor(() => {
        expect(MovieCardMock).toHaveBeenCalledTimes(searchResults.length);
        expect(screen.getByText('Movie A')).toBeInTheDocument(); // Check if rendered by mock
        expect(screen.getByText('Movie B')).toBeInTheDocument();
    });
    
    // Verify props passed to MovieCard mock
    expect(MovieCardMock.mock.calls[0][0].result).toEqual(searchResults[0]);
    expect(MovieCardMock.mock.calls[0][0].myList).toEqual(mockAppManagedMyList);
    expect(MovieCardMock.mock.calls[0][0].onAddToList).toBe(mockAppManagedOnAddToList);
  });

  it('displays "No movies found" message if API returns Response "False"', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ Response: 'False', Error: 'Movie not found!' }),
    });
    render(
      <MovieBox 
        appManagedMyList={mockAppManagedMyList} 
        appManagedOnAddToList={mockAppManagedOnAddToList} 
      />
    );
    fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'NonExistentMovie123' } });
    fireEvent.click(screen.getByTestId('search-button'));

    expect(await screen.findByText('Movie not found!')).toBeInTheDocument();
  });
  
  it('displays "No movies found for..." message if API returns empty Search array', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ Response: 'True', Search: [] }), // Empty search results
    });
    render(
        <MovieBox 
          appManagedMyList={mockAppManagedMyList} 
          appManagedOnAddToList={mockAppManagedOnAddToList} 
        />
      );
    fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'RareMovieTerm' } });
    fireEvent.click(screen.getByTestId('search-button'));

    expect(await screen.findByText('No movies found for "RareMovieTerm". Try a different search.')).toBeInTheDocument();
  });

  it('displays error message if fetch call fails', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));
    render(
      <MovieBox 
        appManagedMyList={mockAppManagedMyList} 
        appManagedOnAddToList={mockAppManagedOnAddToList} 
      />
    );
    fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'Test' } });
    fireEvent.click(screen.getByTestId('search-button'));

    expect(await screen.findByText('Failed to fetch movies. Check your connection.')).toBeInTheDocument();
  });
  
  it('renders initial message when no search has been performed yet', () => {
    render(
      <MovieBox 
        appManagedMyList={mockAppManagedMyList} 
        appManagedOnAddToList={mockAppManagedOnAddToList} 
      />
    );
    expect(screen.getByText('Search for movies to see results.')).toBeInTheDocument();
  });
});
