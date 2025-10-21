import { render, screen } from "@testing-library/react";
import Header from "./Header";

// Mock react-router-dom
jest.mock("react-router-dom");

// Mock the Login component
jest.mock("./Login", () => {
  return function MockLogin({ isAuthenticated, user, username, onLogout, onGoogleLogin, onClose }) {
    if (isAuthenticated) {
      return (
        <div>
          <span>{username}</span>
          <button onClick={onLogout}>Logout</button>
        </div>
      );
    }
    return (
      <div>
        <button onClick={onGoogleLogin}>Sign in with Google</button>
        <button onClick={onClose}>Close</button>
      </div>
    );
  };
});

// Suppress console errors during tests
beforeEach(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
  // Mock fetch globally
  global.fetch = jest.fn();
});

afterEach(() => {
  console.error.mockRestore();
  global.fetch.mockRestore();
});

test("when the user is logged out, shows login button", async () => {
  // Mock the auth check to return unauthenticated
  global.fetch.mockResolvedValueOnce({
    json: async () => ({ isAuthenticated: false }),
  });

  render(<Header title="Test Header" />);
  const loginButton = await screen.findByText(/Login/i);
  expect(loginButton).toBeInTheDocument();
});

test("when the user is logged in, shows username and logout option", async () => {
  const mockUser = { name: "Test User", email: "test@example.com" };
  
  // Mock the auth check to return authenticated user
  global.fetch.mockResolvedValueOnce({
    json: async () => ({ isAuthenticated: true, user: mockUser }),
  });

  render(<Header title="Test Header" />);
  
  // Wait for the component to update after the async fetch
  const usernameElement = await screen.findByText(/Test User/i);
  const logoutButton = await screen.findByText(/Logout/i);
  
  expect(usernameElement).toBeInTheDocument();
  expect(logoutButton).toBeInTheDocument();
});
