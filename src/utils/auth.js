// Authentication utility functions for the frontend

/**
 * Check if user is authenticated
 * @returns {Promise<{isAuthenticated: boolean, user: object|null}>}
 */
export const checkAuthStatus = async () => {
  try {
    const response = await fetch('/api/auth/user', {
      credentials: 'include'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking auth status:', error);
    return { isAuthenticated: false, user: null };
  }
};

/**
 * Logout the current user
 * @returns {Promise<boolean>} Success status
 */
export const logout = async () => {
  try {
    const response = await fetch('/api/auth/logout', {
      credentials: 'include'
    });
    const data = await response.json();
    return response.ok;
  } catch (error) {
    console.error('Error logging out:', error);
    return false;
  }
};

/**
 * Redirect to Google OAuth login
 */
export const loginWithGoogle = () => {
  window.location.href = '/auth/google';
};

/**
 * Traditional login (if you implement it on backend)
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export const loginWithCredentials = async (username, password) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      return { success: true, user: data.user };
    } else {
      return { success: false, error: data.error || 'Login failed' };
    }
  } catch (error) {
    console.error('Error logging in:', error);
    return { success: false, error: 'Network error' };
  }
};

/**
 * Get user profile picture URL
 * @param {object} user - User object
 * @param {number} size - Size of the image (default: 96)
 * @returns {string|null} Profile picture URL
 */
export const getProfilePicture = (user, size = 96) => {
  if (!user) return null;
  
  if (user.profilePicture) {
    // Google profile pictures can be resized by adding size parameter
    if (user.profilePicture.includes('googleusercontent.com')) {
      return `${user.profilePicture}?sz=${size}`;
    }
    return user.profilePicture;
  }
  
  // Return a default avatar or initials-based avatar
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&size=${size}`;
};

/**
 * Format user display name
 * @param {object} user - User object
 * @returns {string} Formatted name
 */
export const formatUserName = (user) => {
  if (!user) return 'Guest';
  
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  
  if (user.name) {
    return user.name;
  }
  
  if (user.email) {
    return user.email.split('@')[0];
  }
  
  return 'User';
};

/**
 * Check if user has a specific role (for future role-based access control)
 * @param {object} user - User object
 * @param {string} role - Role to check
 * @returns {boolean}
 */
export const hasRole = (user, role) => {
  if (!user || !user.roles) return false;
  return user.roles.includes(role);
};

/**
 * Protected route helper - check if user is authenticated
 * @param {object} user - User object
 * @param {boolean} isAuthenticated - Authentication status
 * @param {string} redirectPath - Path to redirect if not authenticated
 * @returns {boolean} Whether user can access the route
 */
export const canAccessRoute = (isAuthenticated, user, redirectPath = '/') => {
  if (!isAuthenticated) {
    window.location.href = redirectPath;
    return false;
  }
  return true;
};

export default {
  checkAuthStatus,
  logout,
  loginWithGoogle,
  loginWithCredentials,
  getProfilePicture,
  formatUserName,
  hasRole,
  canAccessRoute
};
