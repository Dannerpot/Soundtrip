import React, { useState } from 'react';
import '../App.css';
const SongInputForm = ({ onSubmit }) => {
  const [songs, setSongs] = useState(['', '', '']);
  const [searchResults, setSearchResults] = useState([[], [], []]);  // Holds the dropdown results for each input field

  // Function to call Spotify Search API
  const searchSpotify = async (query, index) => {
    if (!query) {
      setSearchResults((prevResults) => {
        const newResults = [...prevResults];
        newResults[index] = [];  // Clear the dropdown for that input
        return newResults;
      });
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/search?q=${query}`);
      const data = await response.json();
      setSearchResults((prevResults) => {
        const newResults = [...prevResults];
        newResults[index] = data.tracks;  // Store the track results for the input field
        return newResults;
      });
    } catch (error) {
      console.error('Error searching Spotify:', error);
    }
  };

  // Handle song selection
  const handleSongSelect = (songName, index) => {
    setSongs((prevSongs) => {
      const newSongs = [...prevSongs];
      newSongs[index] = songName;
      return newSongs;
    });
    setSearchResults((prevResults) => {
      const newResults = [...prevResults];
      newResults[index] = [];  // Clear dropdown when a song is selected
      return newResults;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(songs);  // Pass the selected songs to the parent component (App.js)
  };

  return (
    <form onSubmit={handleSubmit}>
      {songs.map((song, index) => (
        <div key={index} style={{ position: 'relative' }}>
          <input
            type="text"
            value={song}
            onChange={(e) => {
              const newSongs = [...songs];
              newSongs[index] = e.target.value;
              setSongs(newSongs);
              searchSpotify(e.target.value, index);  // Search as the user types
            }}
            placeholder={`Song ${index + 1}`}
            autoComplete="off"
          />
          {/* Dropdown for song suggestions */}
          {searchResults[index].length > 0 && (
            <ul style={{ position: 'absolute', top: '100%', left: 0, width: '100%', zIndex: 1000 }}>
              {searchResults[index].map((track) => (
                <li
                  key={track.id}
                  onClick={() => handleSongSelect(track.name, index)}
                  style={{ cursor: 'pointer', padding: '5px', backgroundColor: '#fff', border: '1px solid #ccc' }}
                >
                  {track.name} - {track.artists.map(artist => artist.name).join(', ')}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
      <button type="submit" class='glow-on-hover'>Get Recommendations</button>
    </form>
  );
};

export default SongInputForm;
