// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock fetch globally for all tests
global.fetch = jest.fn((url) => {
  // Return appropriate mock based on URL
  if (url === '/api/auth/user') {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ 
        isAuthenticated: false,
        user: null 
      }),
    });
  }
  
  // Default mock response
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
  });
});

