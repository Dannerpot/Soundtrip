const express = require('express');
const bodyParser = require('body-parser');
const { getRecommendations, getAccessToken } = require('./spotify'); // Import Spotify functions
const axios = require('axios');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
});

app.use(limiter);


app.use(helmet());

const app = express();
app.use(bodyParser.json());
app.get('/', (req, res) => {
  res.send('Music Recommendation API is running');
});
app.use(cors({
  origin: 'soundtrip.vercel.app'  // Allow your frontend
}));
app.use(express.static(path.resolve(__dirname, '..', 'frontend', 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'frontend', 'build', 'index.html'));
});
// This endpoint fetches Spotify recommendations based on the songs provided
app.post('/recommend', async (req, res) => {
  const { songs } = req.body;

  // Ensure there is at least one song input
  if (!songs || songs.length === 0) {
    return res.status(400).json({ error: 'Please provide at least one song.' });
  }

  // Get recommendations based on the songs provided
  const recommendations = await getRecommendations(songs);

  // Return the recommendations to the frontend
  res.json({ recommendations });
});

// This endpoint handles the song search queries
app.get('/search', async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: 'No search query provided.' });
  }

  // Fetch the access token for Spotify API requests
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return res.status(500).json({ error: 'Failed to get access token.' });
  }

  try {
    // Use Spotify's Search API to search for songs that match the query
    const response = await axios.get('https://api.spotify.com/v1/search', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      params: {
        q: query,        // User input query
        type: 'track',   // We're searching for tracks (songs)
        limit: 5,        // Limit the number of results returned
      },
    });

    // Send back the search results (the list of tracks)
    res.json({ tracks: response.data.tracks.items });
  } catch (error) {
    console.error('Error fetching search results from Spotify:', error);
    res.status(500).json({ error: 'Error fetching search results from Spotify.' });
  }
});

// Start the server
app.listen(5000, () => {
  console.log('Backend server is running on port 5000');
});
