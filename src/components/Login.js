import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin, onClose, isAuthenticated, onLogout, username }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      // Call the parent's onLogin function
      await onLogin(formData.username, formData.password);
      // Clear form on successful login
      setFormData({ username: '', password: '' });
      setError('');
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  const handleLogout = () => {
    onLogout();
    setFormData({ username: '', password: '' });
    setError('');
  };

  // If user is authenticated, show welcome message with logout
  if (isAuthenticated) {
    return (
      <div className="login-container authenticated">
        <span className="welcome-message">Welcome, {username}!</span>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    );
  }

  // Show login form
  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="login-header">
          <h3>Login</h3>
          {onClose && (
            <button type="button" className="close-btn" onClick={onClose}>
              ×
            </button>
          )}
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <button type="submit" className="login-btn">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;