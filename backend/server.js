const express = require('express');
const bodyParser = require('body-parser');
const { getRecommendations, getAccessToken } = require('./spotify'); // Import Spotify functions
const axios = require('axios');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express(); // Initialize the app first

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
});

app.use(limiter);
app.use(helmet());

app.use(bodyParser.json());
app.get('/', (req, res) => {
  res.send('Music Recommendation API is running');
});

app.use(cors({
  origin: 'https://soundtrip.vercel.app'  // Allow your frontend
}));

// Serve static frontend files
app.use(express.static(path.resolve(__dirname, '..', 'frontend', 'build')));

// API route for recommendations
app.post('/recommend', async (req, res) => {
  const { songs } = req.body;

  if (!songs || songs.length === 0) {
    return res.status(400).json({ error: 'Please provide at least one song.' });
  }

  const recommendations = await getRecommendations(songs);
  res.json({ recommendations });
});

// API route for search
app.get('/search', async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: 'No search query provided.' });
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    return res.status(500).json({ error: 'Failed to get access token.' });
  }

  try {
    const response = await axios.get('https://api.spotify.com/v1/search', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      params: {
        q: query,
        type: 'track',
        limit: 5,
      },
    });

    res.json({ tracks: response.data.tracks.items });
  } catch (error) {
    console.error('Error fetching search results from Spotify:', error);
    res.status(500).json({ error: 'Error fetching search results from Spotify.' });
  }
});

// Fallback route to serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'frontend', 'build', 'index.html'));
});

app.listen(5000, () => {
  console.log('Backend server is running on port 5000');
});
