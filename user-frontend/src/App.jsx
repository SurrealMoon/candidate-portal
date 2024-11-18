import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InterviewRecordingPage from './components/InterviewRecordingPage'

function App() {
  const handleRecordingSubmit = (recordedChunks) => {
    console.log("Recorded video chunks:", recordedChunks);
    // Kayıt işlemi ile ilgili başka işlemler burada yapılabilir.
  };
  return (
    <Router>
      <Routes>
        <Route
          path="/video-recording/:id"
          element={<InterviewRecordingPage onSubmit={handleRecordingSubmit} />}
        />
      </Routes>
    </Router>
  )
}

export default App
