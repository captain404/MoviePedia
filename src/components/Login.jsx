import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    // Basic validation
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }
    // onLogin will be a function passed from App.jsx to handle actual login logic
    const success = onLogin({ username, password });
    if (success) {
      navigate('/'); // Navigate to homepage on successful login
    } else {
      setError('Invalid username or password.'); // Mock error
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </div>
        <button type="submit" className="auth-button">Login</button>
      </form>
      <p className="switch-auth-link">
        Don't have an account? <Link to="/signup">Sign Up</Link>
      </p>
    </div>
  );
};
