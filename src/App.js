import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './components/Home';
import Flashcard from './components/Flashcard';
import WordList from './components/WordList';
import Quiz from './components/Quiz';
import Settings from './components/Settings';
import PhoneticVowels from './components/PhoneticVowels';
import PhonemeChart from './components/PhonemeChart';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/flashcard" element={<Flashcard />} />
          <Route path="/wordlist" element={<WordList />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/phoneticvowels" element={<PhoneticVowels />} />
          <Route path="/phonemechart" element={<PhonemeChart />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
