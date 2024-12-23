import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

function Home() {
  const [totalWords, setTotalWords] = useState(0);

  useEffect(() => {
    fetchWordCount();
  }, []);

  async function fetchWordCount() {
    // Memanggil Supabase untuk mendapatkan total jumlah row (count)
    const { count, error } = await supabase
      .from('words')
      .select('*', { count: 'exact', head: true });

    if (!error) {
      // 'count' di sini adalah total row
      setTotalWords(count);
    } else {
      console.error("Error getting word count:", error);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Selamat Datang di Flashcard App!</h1>
      <p className="mb-2">Aplikasi ini memiliki fitur:</p>
      <ul className="list-disc list-inside space-y-1 mb-4">
        <li>Flashcard (English - Indonesian, example usage)</li>
        <li>Quiz (pilih 10-50-100 soal)</li>
        <li>Word List dengan pencarian & input kata baru</li>
        <li>Terjemahan AI via GLHF</li>
        <li>Settings untuk API Key & Model GLHF</li>
        <li>Tidak perlu login, langsung pakai!</li>
      </ul>

      {/* Tampilkan total kata yang ada di Supabase */}
      <p className="text-gray-600">
        Saat ini ada <strong>{totalWords}</strong> word(s) di database.
      </p>
    </div>
  );
}

export default Home;
