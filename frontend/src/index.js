import React, { useState } from 'react';
import SongInputForm from './components/SongInputForm';
import './App.css'
const App = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  const getRecommendations = async (songs) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ songs }),
      });

      const data = await response.json();
      setRecommendations(data.recommendations);  // Set recommendations from backend response
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div Class="mainscreen">
      <div class="subscreen"> 
      <h1 className='title'>SoundTrip</h1>
      <p className='header'>Enter up to 3 songs to get music recommendations:</p>
      <SongInputForm onSubmit={getRecommendations} />

      {loading ? (
        <p>Loading recommendations...</p>
      ) : (
        recommendations.length > 0 && (
          <div className='results'>
            <h2>Recommendations:</h2>
            <ul className='list'>
              {recommendations.map((song, index) => (
                <li key={index}>{song}</li>
              ))}
            </ul>
          </div>
        )
      )}
      </div>
    </div>
  );
};

export default App;
