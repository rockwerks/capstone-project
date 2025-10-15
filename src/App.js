import "./App.css";
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import ItineraryManager from "./components/ItineraryManager";
import SharedItinerary from "./components/SharedItinerary";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/user', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.isAuthenticated) {
        setIsAuthenticated(true);
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Shared itinerary route (no header/footer) */}
          <Route path="/shared/:token" element={<SharedItinerary />} />
          
          {/* Main app route */}
          <Route path="*" element={
            <>
              <Header title="Location Scheduler" />
              <main className="App-main">
                {isAuthenticated ? (
                  <ItineraryManager 
                    user={user} 
                    isAuthenticated={isAuthenticated} 
                  />
                ) : (
                  <div className="welcome-section">
                    <h1>Welcome to Location Scheduler</h1>
                    <p>Location Scheduler is an application to help you organize and manage your production's Location Department's itineraries for scouts to technical surveys efficiently, all designed by a location manager and his dog.</p>
                    <p className="login-prompt">Please log in with your Google account to get started.</p>
                  </div>
                )}
              </main>
              <footer className="App-footer">
                <p>© 2025 Location Scheduler. All rights reserved.</p>
              </footer>
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
