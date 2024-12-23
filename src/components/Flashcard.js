import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

function Flashcard() {
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showIndoSide, setShowIndoSide] = useState(false);

  useEffect(() => {
    fetchWords();
  }, []);

  async function fetchWords() {
    const { data, error } = await supabase.from('words').select();
    if (error) {
      console.error(error);
    } else if (data) {
      // 1) Shuffle data di client
      const shuffled = shuffleArray(data);
      setWords(shuffled);
    }
  }

  // Fungsi sederhana shuffle array
  function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
  }

  function handleNext() {
    setShowIndoSide(false);
    setCurrentIndex((prev) => (prev + 1) % words.length);
  }

  function flipCard() {
    setShowIndoSide(!showIndoSide);
  }

  // FUNGSI TTS: bicara bahasa Inggris
  function speakEnglish(text) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US'; // set bahasa ke English (US)
      speechSynthesis.speak(utterance);
    } else {
      alert('Browser Anda tidak mendukung Speech Synthesis');
    }
  }

  if (words.length === 0) {
    return <div className="text-center">Memuat data flashcard...</div>;
  }

  const currentWord = words[currentIndex];

  return (
    <div className="mx-auto max-w-xl text-center">
      <h2 className="text-2xl font-bold mb-4">Flashcard</h2>

      <div className="border border-gray-300 rounded-md p-6 mb-4 bg-white shadow-sm">
        {showIndoSide ? (
          <>
            <h3 className="text-xl font-semibold">Terjemahan: {currentWord.glhf_translation}</h3>
            <p className="mt-2 text-gray-600">Contoh: {currentWord.example_usage}</p>
            <p className="mt-1 text-gray-600">
              Arti Contoh: {currentWord.example_usage_translation || '-'}
            </p>
          </>
        ) : (
          <>
            <h3 className="text-xl font-semibold">English: {currentWord.english}</h3>
            <p className="mt-2 text-gray-600">AI (GLHF): {currentWord.glhf_translation}</p>
          </>
        )}
      </div>

      <div className="flex justify-center space-x-2 mb-4">
        <button
          onClick={flipCard}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Balik Kartu
        </button>
        <button
          onClick={handleNext}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Next
        </button>
      </div>

      {/* Tombol Suara untuk mengucapkan Kata Inggris */}
      <button
        onClick={() => speakEnglish(currentWord.english)}
        className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
      >
        🔊 Dengarkan Pengucapan
      </button>
    </div>
  );
}

export default Flashcard;
