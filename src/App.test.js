import { render, screen } from "@testing-library/react";
import App from "./App";

// Mock react-router-dom
jest.mock("react-router-dom");

// Suppress console errors during tests
beforeEach(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  console.error.mockRestore();
});

test("renders welcome message when user not logged in yet", () => {
  render(<App />);
  const welcomeElement = screen.getByText(/Welcome to Location Scheduler/i);
  expect(welcomeElement).toBeInTheDocument();
});

test("renders itinerary manager when user is logged in", async () => {
  // Arrange

  // Mock fetch to return authenticated user
  global.fetch = jest.fn((url) => {
    if (url === "/api/auth/user") {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            isAuthenticated: true,
            user: {
              id: "123",
              name: "Test User",
              email: "test@example.com",
            },
          }),
      });
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    });
  });

  // Act

  render(<App />);

  // Assert

  // Wait for the authenticated view to render
  const itineraryHeader = await screen.findByText(/My Itineraries/i);
  expect(itineraryHeader).toBeInTheDocument();

  // Verify the welcome message for unauthenticated users is NOT shown
  expect(
    screen.queryByText(/Please log in with your Google account/i)
  ).not.toBeInTheDocument();

  // Verify user is shown in header
  expect(screen.getByText(/Welcome, Test User/i)).toBeInTheDocument();

  // Restore fetch mock
  global.fetch.mockRestore();
});
