import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { MovieBox } from './components/MovieBox';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { Profile } from './components/Profile';
import './index.css'; // Ensure global styles are imported

const App = () => {
  const [currentUser, setCurrentUser] = useState(() => {
    // Initialize currentUser from localStorage
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [myList, setMyList] = useState(() => {
    // Load list from localStorage if available
    const savedList = localStorage.getItem('myMovieList');
    return savedList ? JSON.parse(savedList) : [];
  });

  useEffect(() => {
    // Persist currentUser to localStorage
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  useEffect(() => {
    // Persist myList to localStorage
    localStorage.setItem('myMovieList', JSON.stringify(myList));
  }, [myList]);

  const handleSignup = (userData) => {
    const users = JSON.parse(localStorage.getItem('mockUsers')) || [];
    const userExists = users.some(user => user.username === userData.username);

    if (userExists) {
      console.error('Signup failed: Username already exists');
      return false; // Username already exists
    }

    // IMPORTANT: Mock password storage. In a real app, hash passwords securely.
    const newUser = { username: userData.username, password: userData.password };
    users.push(newUser);
    localStorage.setItem('mockUsers', JSON.stringify(users));
    console.log('Signup successful for:', userData.username);
    return true; // Signup successful
  };

  const handleLogin = (credentials) => {
    const users = JSON.parse(localStorage.getItem('mockUsers')) || [];
    const user = users.find(
      (u) => u.username === credentials.username && u.password === credentials.password
    );

    if (user) {
      setCurrentUser({ username: user.username }); // Store only necessary info
      console.log('Login successful for:', user.username);
      return true;
    }
    console.error('Login failed: Invalid credentials');
    return false; // Invalid credentials
  };

  const handleLogout = () => {
    setCurrentUser(null);
    // No need to console.log here as it's called by other functions too.
    // Navigation will be handled by the component that calls logout or by useEffect.
  };

  const handleDeleteAccount = () => {
    if (!currentUser) return; // Should not happen if button is only on profile

    if (window.confirm('Are you absolutely sure you want to delete your account? This action cannot be undone and will remove all your data.')) {
      console.log(`Attempting to delete account for: ${currentUser.username}`);
      let users = JSON.parse(localStorage.getItem('mockUsers')) || [];
      users = users.filter(user => user.username !== currentUser.username);
      localStorage.setItem('mockUsers', JSON.stringify(users));
      console.log(`User ${currentUser.username} removed from mockUsers.`);
      
      // Also, consider if there's any other user-specific data to remove, e.g., their movie list
      // For now, `myList` is generic, but if it were user-specific, it should be cleared.
      // If `myList` was tied to `currentUser`, you might do something like:
      // localStorage.removeItem(`myMovieList_${currentUser.username}`);
      // However, current `myList` is singular and shared/overwritten by last logged-in user.
      // For this mock, deleting the user from mockUsers and logging out is sufficient.

      handleLogout(); // This will clear currentUser and its localStorage entry
      // The user will be redirected via the Navigate component in the Profile route's logic
      // or by other means depending on how components react to currentUser becoming null.
      // Explicit navigation can also be added here if needed, e.g., navigate('/signup');
      // but usually, the change in currentUser state handles redirection.
      console.log('Account deleted successfully.');
    }
  };

  // Add to List Handler (now in App.jsx)
  const handleAddToMyList = (movieToAdd) => {
    setMyList((prevList) => {
      const isAlreadyAdded = prevList.some(
        (movie) => movie.imdbID === movieToAdd.imdbID
      );
      if (!isAlreadyAdded) {
        return [...prevList, movieToAdd];
      }
      return prevList;
    });
  };
  
  // Remove from List Handler (now in App.jsx, if needed by Profile or a dedicated List page)
  const handleRemoveFromMyList = (imdbIDToRemove) => {
    setMyList((prevList) => 
      prevList.filter((movie) => movie.imdbID !== imdbIDToRemove)
    );
  };


  return (
    <Router>
      <div className="app-container"> {/* Optional: a top-level wrapper if needed */}
        <nav className="main-nav">
          <Link to="/" className="nav-logo">MoviePedia</Link>
          <div className="nav-links">
            {currentUser ? (
              <>
                <Link to="/profile">Profile ({currentUser.username})</Link>
                <button onClick={handleLogout} className="nav-button logout-nav-btn">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/signup">Sign Up</Link>
              </>
            )}
          </div>
        </nav>

        <div className="container main-content"> {/* Original container for content below nav */}
          <Routes>
            <Route 
              path="/" 
              element={
                <MovieBoxWrapper 
                  onAddToList={handleAddToMyList} 
                  myList={myList} 
                />
              } 
            />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/signup" element={<Signup onSignup={handleSignup} />} />
            <Route 
              path="/profile" 
              element={
                currentUser ? (
                  <Profile 
                    currentUser={currentUser} 
                    onLogout={handleLogout} 
                    myList={myList} 
                    onDeleteAccount={handleDeleteAccount} // Pass the new handler
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            {/* Optional: A catch-all route for 404 Not Found */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

// Wrapper component to pass App-level list management to MovieBox
const MovieBoxWrapper = ({ onAddToList, myList }) => {
  // MovieBox now gets its list management from App.jsx
  // It will use these props instead of its own localStorage for `myList`.
  // This requires modifying MovieBox to accept these props and remove its own list state.
  return (
    <>
      <h1>MoviePedia</h1>
      <p>
      Explore a vast cinematic universe with our user-friendly movie search website. Discover, rate, and find your favorite films effortlessly.
      </p>
      <MovieBox 
        appManagedMyList={myList} 
        appManagedOnAddToList={onAddToList}
        // If MovieBox needs to remove, pass handleRemoveFromMyList as well
      />
    </>
  );
};

export default App;
