const axios = require('axios');
const qs = require('querystring');

// Spotify App Credentials
const CLIENT_ID = '340d9fde9c2747acb7a1a960d805dbcd';  // Your Client ID
const CLIENT_SECRET = 'dc321c4e01ee4609a358e16636828a1a'; // Your Client Secret
const AUTH_URL = 'https://accounts.spotify.com/api/token';

// Function to get the Spotify API access token using Client Credentials Flow
const getAccessToken = async () => {
  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  try {
    const response = await axios.post(AUTH_URL, qs.stringify({
      grant_type: 'client_credentials'
    }), {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return response.data.access_token;
  } catch (error) {
    console.error("Error getting access token:", error);
    return null;
  }
};

// Function to get song recommendations based on an array of song names
const getRecommendations = async (songs) => {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return [];
  }

  const songIds = await getSongIds(songs, accessToken); // Get Spotify track IDs from song names

  try {
    const response = await axios.get('https://api.spotify.com/v1/recommendations', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      params: {
        seed_tracks: songIds.join(','),  // Pass track IDs as seeds for recommendations
        limit: 5,  // Limit the number of recommendations
      },
    });

    // Return the recommended song names (or full track data if needed)
    return response.data.tracks.map(track => track.name);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return [];
  }
};

// Helper function to get Spotify track IDs from song names using Spotify's Search API
const getSongIds = async (songs, accessToken) => {
  const songIds = [];

  for (const song of songs) {
    if (song) {
      try {
        const response = await axios.get('https://api.spotify.com/v1/search', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          params: {
            q: song,  // Search query (song name)
            type: 'track',
            limit: 1,  // We only need one result (the best match)
          },
        });

        const trackId = response.data.tracks.items[0]?.id; // Get track ID from search results
        if (trackId) {
          songIds.push(trackId); // Add track ID to the array
        }
      } catch (error) {
        console.error('Error searching for song:', song, error);
      }
    }
  }

  return songIds;
};

module.exports = { getRecommendations, getAccessToken };
