import React, { useState } from 'react';
import Login from './Login';
import './Header.css';

const Header = ({ title = "Location Scheduler" }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLogin = async (inputUsername, password) => {
    // Simulate API call - replace with your actual authentication logic
    try {
      // For demo purposes, accept any username with password "password"
      // In a real app, you'd make an API call to your backend
      if (password === 'password') {
        setIsAuthenticated(true);
        setUsername(inputUsername);
        setShowLoginModal(false);
        return Promise.resolve();
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setShowLoginModal(false);
  };

  const toggleLoginModal = () => {
    setShowLoginModal(!showLoginModal);
  };

  return (
    <>
      <header className="App-header">
        <div className="header-content">
          <h1 className="header-title">{title}</h1>
          <div className="header-auth">
            {isAuthenticated ? (
              <Login
                isAuthenticated={isAuthenticated}
                username={username}
                onLogout={handleLogout}
              />
            ) : (
              <button className="header-login-toggle" onClick={toggleLoginModal}>
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="login-modal-overlay" onClick={toggleLoginModal}>
          <div className="login-modal" onClick={(e) => e.stopPropagation()}>
            <Login
              onLogin={handleLogin}
              onClose={toggleLoginModal}
              isAuthenticated={isAuthenticated}
              username={username}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Header;