import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ListedMovieItem } from './ListedMovieItem';

describe('ListedMovieItem Component', () => {
  const mockMovie = {
    imdbID: 'tt0076759',
    Title: 'Star Wars: A New Hope',
    Year: '1977',
    Poster: 'https://example.com/starwars_poster.jpg',
  };

  it('renders movie details correctly', () => {
    render(<ListedMovieItem movie={mockMovie} />);

    expect(screen.getByText(`${mockMovie.Title} (${mockMovie.Year})`)).toBeInTheDocument();
    const posterImg = screen.getByAltText(mockMovie.Title);
    expect(posterImg).toBeInTheDocument();
    expect(posterImg.src).toBe(mockMovie.Poster);
  });

  it('renders nothing if movie prop is not provided', () => {
    const { container } = render(<ListedMovieItem movie={null} />);
    expect(container.firstChild).toBeNull();
  });
  
  it('handles image loading error for the poster', () => {
    render(<ListedMovieItem movie={mockMovie} />);
    const posterImg = screen.getByAltText(mockMovie.Title);
    
    // Simulate an error event
    fireEvent.error(posterImg);
    
    // Check if the src is updated to the placeholder
    expect(posterImg.src).toBe('https://via.placeholder.com/150x225?text=No+Image');
  });
});
