import React, { useState, useEffect } from "react";
import Login from "./Login";
import "./Header.css";

const Header = ({ title = "Location Scheduler" }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/user", {
        credentials: "include",
      });
      const data = await response.json();

      if (data.isAuthenticated) {
        setIsAuthenticated(true);
        setUser(data.user);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to Google OAuth (works in both dev and production)
    // In production, this uses the proxy or same origin
    // In development with proxy, it goes to the backend
    const isProduction = window.location.hostname !== "localhost";
    const authUrl = isProduction
      ? `https://locationscheduler.onrender.com:${process.env.PORT}/auth/google`
      : `http://localhost:${process.env.PORT}/auth/google`; // Development: explicit backend URL
    window.location.href = authUrl;
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        credentials: "include",
      });
      setIsAuthenticated(false);
      setUser(null);
      setShowLoginModal(false);
      // Redirect to home after logout
      window.location.href = "/";
    } catch (error) {
      console.error("Error logging out:", error);
    }
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
                user={user}
                username={user?.name || user?.email}
                onLogout={handleLogout}
              />
            ) : (
              <button
                className="header-login-toggle"
                onClick={toggleLoginModal}
              >
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
              onGoogleLogin={handleGoogleLogin}
              onClose={toggleLoginModal}
              isAuthenticated={isAuthenticated}
              user={user}
              username={user?.name}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
