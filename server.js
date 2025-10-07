const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080;


app.use(express.static(path.join(__dirname, 'build')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build/static/index.html'));
});

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the API!' });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});     