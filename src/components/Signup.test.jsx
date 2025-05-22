import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Signup } from './Signup';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Signup Component', () => {
  const mockOnSignup = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (ui) => {
    return render(
      <MemoryRouter initialEntries={['/signup']}>
        <Routes>
          <Route path="/signup" element={ui} />
          <Route path="/login" element={<div>Login Page Mock</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders the signup form correctly', () => {
    renderWithRouter(<Signup onSignup={mockOnSignup} />);
    expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument(); // Exact match for "Password"
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByText(/already have an account?/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText(/note: this is a mock authentication/i)).toBeInTheDocument();
  });

  it('allows typing into input fields', () => {
    renderWithRouter(<Signup onSignup={mockOnSignup} />);
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'newpass123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'newpass123' } });

    expect(screen.getByLabelText(/username/i).value).toBe('newuser');
    expect(screen.getByLabelText(/^password$/i).value).toBe('newpass123');
    expect(screen.getByLabelText(/confirm password/i).value).toBe('newpass123');
  });

  it('displays error if fields are empty on submit', () => {
    renderWithRouter(<Signup onSignup={mockOnSignup} />);
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    expect(screen.getByText('Please fill in all fields.')).toBeInTheDocument();
    expect(mockOnSignup).not.toHaveBeenCalled();
  });

  it('displays error if passwords do not match', () => {
    renderWithRouter(<Signup onSignup={mockOnSignup} />);
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password321' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
    expect(mockOnSignup).not.toHaveBeenCalled();
  });
  
  it('displays error if password is less than 6 characters', () => {
    renderWithRouter(<Signup onSignup={mockOnSignup} />);
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: '12345' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: '12345' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    expect(screen.getByText('Password must be at least 6 characters long.')).toBeInTheDocument();
    expect(mockOnSignup).not.toHaveBeenCalled();
  });

  it('calls onSignup and navigates on successful signup', () => {
    mockOnSignup.mockReturnValue(true); // Simulate successful signup
    renderWithRouter(<Signup onSignup={mockOnSignup} />);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'newpass123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'newpass123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    expect(mockOnSignup).toHaveBeenCalledWith({ username: 'newuser', password: 'newpass123' });
    expect(mockNavigate).toHaveBeenCalledWith('/login');
    expect(screen.queryByText(/username already exists/i)).not.toBeInTheDocument();
  });

  it('displays error message if onSignup returns false (e.g., username taken)', () => {
    mockOnSignup.mockReturnValue(false); // Simulate username taken
    renderWithRouter(<Signup onSignup={mockOnSignup} />);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'existinguser' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    
    expect(mockOnSignup).toHaveBeenCalledWith({ username: 'existinguser', password: 'password123' });
    expect(screen.getByText('Username already exists or another error occurred.')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
  
  it('navigates to login page when "Login" link is clicked', () => {
    renderWithRouter(<Signup onSignup={mockOnSignup} />);
    const loginLink = screen.getByRole('link', { name: /login/i });
    fireEvent.click(loginLink);
    expect(loginLink.getAttribute('href')).toBe('/login');
    // Actual navigation test relies on MemoryRouter setup which is in renderWithRouter
  });
});
