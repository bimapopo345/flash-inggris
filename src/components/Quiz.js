import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

function Quiz() {
  const [words, setWords] = useState([]);
  const [quizSize, setQuizSize] = useState(10);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  // Menyimpan detail setiap jawaban user:
  //   [{ questionEnglish, correctAnswer, userAnswer, isCorrect }, ...]
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    fetchWords();
  }, []);

  function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
  }

  async function fetchWords() {
    const { data, error } = await supabase.from('words').select();
    if (error) {
      console.error(error);
      return;
    }
    if (data) {
      let randomWords = shuffle(data);
      // Jika quizSize == 0 => unlimited => pakai semua data
      // Jika quizSize > 0 => slice
      if (quizSize > 0) {
        randomWords = randomWords.slice(0, quizSize);
      }
      setWords(randomWords);
    }
  }

  // Memulai quiz baru
  async function handleStartQuiz() {
    await fetchWords();
    setCurrentIndex(0);
    setScore(0);
    setAttempts([]);
    setAnswer('');
    setFinished(false);
  }

  // Pilih berapa soal (0=unlimited, 10, 50, 100)
  function handleQuizSize(size) {
    setQuizSize(size);
    setCurrentIndex(0);
    setScore(0);
    setFinished(false);
    setAttempts([]);
  }

  // User menekan "Submit" jawaban pada satu soal
  function handleSubmitAnswer() {
    const currentWord = words[currentIndex];

    const isCorrect =
      answer.trim().toLowerCase() === currentWord.glhf_translation.trim().toLowerCase();
    if (isCorrect) {
      setScore(score + 1);
    }

    // Simpan detail attempt user
    const newAttempt = {
      questionEnglish: currentWord.english,
      correctAnswer: currentWord.glhf_translation,
      userAnswer: answer,
      isCorrect: isCorrect
    };
    setAttempts((prev) => [...prev, newAttempt]);

    setAnswer('');

    // ke soal berikutnya
    if (currentIndex + 1 < words.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // quiz habis
      setFinished(true);
    }
  }

  // Tombol "Finish Early" => paksa quiz selesai
  function handleFinishEarly() {
    // Simpan attempt terakhir (jika user belum submit jawaban di soal sekarang, 
    //   di contoh ini kita asumsikan userAnswer tetap dihitung, 
    //   atau boleh diabaikan sesuai kebutuhan)
    if (answer.trim()) {
      const currentWord = words[currentIndex];
      const isCorrect =
        answer.trim().toLowerCase() === currentWord.glhf_translation.trim().toLowerCase();

      if (isCorrect) setScore(score + 1);

      const newAttempt = {
        questionEnglish: currentWord.english,
        correctAnswer: currentWord.glhf_translation,
        userAnswer: answer,
        isCorrect
      };
      setAttempts((prev) => [...prev, newAttempt]);
    }
    setFinished(true);
  }

  // Selesai quiz => tampil result
  if (finished) {
    return (
      <div className="mx-auto max-w-md text-center">
        <h3 className="text-2xl font-bold mb-2">Quiz Selesai!</h3>
        <p className="mb-4">Skor kamu: {score} / {attempts.length}</p>

        {/* Tampilkan mana saja yang salah */}
        <h4 className="text-xl font-semibold mb-2">Review Jawaban:</h4>
        {attempts.map((att, idx) => {
          const isWrong = !att.isCorrect;
          return (
            <div key={idx} className="mb-2 border-b pb-2">
              <p>
                <strong>Soal {idx + 1}</strong>: {att.questionEnglish}
              </p>
              <p>
                Jawaban Kamu: <em>{att.userAnswer}</em> {isWrong && <span className="text-red-500"> (Salah)</span>}
              </p>
              {isWrong && (
                <p>
                  <small className="text-gray-600">
                    Jawaban benar: {att.correctAnswer}
                  </small>
                </p>
              )}
            </div>
          );
        })}

        <button
          onClick={handleStartQuiz}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 mt-4"
        >
          Ulang Quiz
        </button>
      </div>
    );
  }

  if (words.length === 0) {
    return <div className="mx-auto max-w-md text-center">Memuat soal...</div>;
  }

  // Sedang quiz
  const currentWord = words[currentIndex];

  return (
    <div className="mx-auto max-w-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Quiz</h2>

      {/* Pilih jumlah soal */}
      <div className="flex justify-center space-x-2 mb-4">
        {/* 0 => unlimited */}
        <button
          onClick={() => handleQuizSize(0)}
          className="bg-gray-200 py-1 px-3 rounded hover:bg-gray-300"
        >
          0 (All)
        </button>
        <button
          onClick={() => handleQuizSize(10)}
          className="bg-gray-200 py-1 px-3 rounded hover:bg-gray-300"
        >
          10
        </button>
        <button
          onClick={() => handleQuizSize(50)}
          className="bg-gray-200 py-1 px-3 rounded hover:bg-gray-300"
        >
          50
        </button>
        <button
          onClick={() => handleQuizSize(100)}
          className="bg-gray-200 py-1 px-3 rounded hover:bg-gray-300"
        >
          100
        </button>
        <button
          onClick={handleStartQuiz}
          className="bg-blue-500 text-white py-1 px-4 rounded hover:bg-blue-600"
        >
          Start
        </button>
      </div>

      <hr className="mb-4" />

      <p className="mb-2">
        Soal {currentIndex + 1} dari {words.length}
      </p>
      <p className="text-lg font-semibold mb-4">
        English: {currentWord.english}
      </p>

      <input
        type="text"
        placeholder="Masukkan terjemahan (GLHF) ..."
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        className="border border-gray-300 rounded px-3 py-2 w-full mb-4"
      />
      <button
        onClick={handleSubmitAnswer}
        className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 w-full"
      >
        Submit
      </button>

      <p className="text-center mt-2">Skor saat ini: {score}</p>

      {/* Tombol "Finish Early" */}
      <button
        onClick={handleFinishEarly}
        className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 w-full mt-4"
      >
        Finish Early
      </button>
    </div>
  );
}

export default Quiz;
