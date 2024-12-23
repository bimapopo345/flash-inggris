import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center">
      <h2 className="text-xl font-bold">Flashcard App</h2>
      <div className="space-x-4">
        <Link to="/" className="hover:text-blue-200">Home</Link>
        <Link to="/flashcard" className="hover:text-blue-200">Flashcard</Link>
        <Link to="/wordlist" className="hover:text-blue-200">Word List</Link>
        <Link to="/quiz" className="hover:text-blue-200">Quiz</Link>
        <Link to="/settings" className="hover:text-blue-200">Settings</Link>
        <Link to="/phonemechart" className="hover:text-blue-200">Phoneme Chart</Link>
      </div>
    </nav>
  );
}

export default Navbar;
