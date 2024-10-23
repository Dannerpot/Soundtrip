import React, { useState } from 'react';
import SongInputForm from './SongInputForm';

const App = () => {
  const [recommendations, setRecommendations] = useState([]);

  const getRecommendations = async (songs) => {
    const response = await fetch('http://localhost:5000/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ songs }),
    });

    const data = await response.json();
    setRecommendations(data.recommendations);
  };

  return (
    <div>
      <h1>SoundTrip</h1>
      <SongInputForm onSubmit={getRecommendations} />
      <div>
        {recommendations.length > 0 && (
          <div>
            <h2>Recommendations:</h2>
            <ul>
              {recommendations.map((song, index) => (
                <li key={index}>{song}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
