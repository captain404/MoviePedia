import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom'; // For Link and useNavigate
import { Login } from './Login';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Login Component', () => {
  const mockOnLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (ui, { route = '/' } = {}) => {
    window.history.pushState({}, 'Test page', route);
    return render(
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path={route} element={ui} />
          {/* Add other routes if Link navigates elsewhere during test */}
          <Route path="/signup" element={<div>Signup Page Mock</div>} />
        </Routes>
      </MemoryRouter>
    );
  };


  it('renders the login form correctly', () => {
    renderWithRouter(<Login onLogin={mockOnLogin} />);
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account?/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
  });

  it('allows typing into username and password fields', () => {
    renderWithRouter(<Login onLogin={mockOnLogin} />);
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(usernameInput.value).toBe('testuser');
    expect(passwordInput.value).toBe('password123');
  });

  it('displays an error message if fields are empty on submit', () => {
    renderWithRouter(<Login onLogin={mockOnLogin} />);
    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);

    expect(screen.getByText('Please enter both username and password.')).toBeInTheDocument();
    expect(mockOnLogin).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('calls onLogin with credentials and navigates on successful login', () => {
    mockOnLogin.mockReturnValue(true); // Simulate successful login
    renderWithRouter(<Login onLogin={mockOnLogin} />);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(mockOnLogin).toHaveBeenCalledWith({ username: 'testuser', password: 'password123' });
    expect(mockNavigate).toHaveBeenCalledWith('/'); // Navigates to homepage
    expect(screen.queryByText('Invalid username or password.')).not.toBeInTheDocument();
  });

  it('displays an error message on unsuccessful login (onLogin returns false)', () => {
    mockOnLogin.mockReturnValue(false); // Simulate failed login
    renderWithRouter(<Login onLogin={mockOnLogin} />);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'wronguser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(mockOnLogin).toHaveBeenCalledWith({ username: 'wronguser', password: 'wrongpass' });
    expect(screen.getByText('Invalid username or password.')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
  
  it('navigates to signup page when "Sign Up" link is clicked', () => {
    renderWithRouter(<Login onLogin={mockOnLogin} />, { route: '/login' });
    const signupLink = screen.getByRole('link', { name: /sign up/i });
    fireEvent.click(signupLink);
    // In a real app, this would navigate. Here we check if the link has the correct path.
    // Or, if MemoryRouter is set up with a /signup route, we could check for content of that page.
    expect(signupLink.getAttribute('href')).toBe('/signup');
    // To test actual navigation, the MemoryRouter needs to be configured with the target route.
    // This is already handled by renderWithRouter if the target route is added.
    // For this, we can just check the link, or ensure the test setup for MemoryRouter is robust.
  });
});
