import logo from "./logo.svg";
import "./App.css";
import React from "react";

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
      <header className="App-header"></header>
      <main>
        <div className="MyButton">
          <button onClick={() => handleApiHello("Api Hello")}>Click Me!</button>
        </div>
      </main>
    </div>
  );
}

export default App;
