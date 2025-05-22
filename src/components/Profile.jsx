import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ListedMovieItem } from './ListedMovieItem'; // Import the new component

// Assuming the second export was the intended one from the previous step.
// If there were two exports, the first one is being removed.
export const Profile = ({ currentUser, onLogout, myList, onDeleteAccount }) => {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate('/'); // Navigate to homepage after logout
  };

  const handleDeleteAccountClick = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      if (onDeleteAccount) {
        onDeleteAccount(); // This function will be defined in App.jsx
      }
    }
  };

  if (!currentUser) {
    // This shouldn't normally be reached if routing is set up correctly (e.g. ProtectedRoute)
    // but as a fallback, redirect to login.
    navigate('/login', { replace: true });
    return null; 
  }

  return (
    <div className="profile-container container">
      <h2>User Profile</h2>
      <div className="profile-details">
        <p><strong>Username:</strong> {currentUser.username}</p>
      </div>
      
      <h3>My Movie List</h3>
      {myList && myList.length > 0 ? (
        <div className="listed-movies-grid">
          {myList.map(movie => (
            <ListedMovieItem key={movie.imdbID} movie={movie} />
          ))}
        </div>
      ) : (
        <p className="empty-list-message">Your movie list is currently empty. Add some movies!</p>
      )}

      <div className="profile-actions">
        <button onClick={handleLogoutClick} className="auth-button logout-button">Logout</button>
        <button onClick={handleDeleteAccountClick} className="auth-button delete-account-button">Delete Account</button>
      </div>
    </div>
  );
};
