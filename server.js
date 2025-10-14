require('dotenv').config();
const express = require('express');
const router = express.Router();
const path = require('path');
const { MongoClient, ServerApiVersion } = require('mongodb');
const userSchema = require('./src/models/userSchema');
const itinerarySchema = require('./src/models/itinerarySchema');


const uri = process.env.MONGODB_URI;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const app = express();
const port = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, 'build')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build/static/index.html'));
});

app.get('/api/hello', async (req, res) => {
  const results = await client.db("locationscheduler").collection("itineraries").find({}).limit(5).toArray();
  res.json({ message: 'Hello from the API', data: results });
});

app.delete('/api/hello', (req, res) => {
  res.json({ message: 'DELETE request received' });
});

app.post('/api/hello', (req, res) => {
  res.json({ message: 'POST request received' });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});     

