import "./App.css";
import React from "react";
import Header from "./components/Header";

function App() {
  const handleApiHello = async (message) => {
    try {
      const response = await fetch("/api/hello");
      const data = await response.json();
      console.log(data);
      alert(data.message);
    } catch (error) {
      console.error("Error fetching API:", error);
    }
  };
  return (
    <div className="App">
      <Header title="Location Scheduler" />
      <main className="App-main">
        <div className="App-button">
          <p>Location Scheduler is an application to help you organize and manage your production's Location Department's itineraries for scouts to technical surveys efficiently, all designed by a location manager and his dog.</p>
          <button onClick={() => handleApiHello("Api Hello")}>Click Me!</button>
        </div>
      </main>
      <footer className="App-footer">
        <p>© 2025 Location Scheduler. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
