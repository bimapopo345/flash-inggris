// src/phonemechart.js

import React, { useEffect, useState } from "react";
import { supabase } from '../supabase';

/**
 * Fungsi TTS (bicara) - memanggil speechSynthesis
 */
function speakEnglish(text) {
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  } else {
    alert("Browser tidak mendukung Speech Synthesis.");
  }
}

const PhonemeChart = () => {
  const [phonemes, setPhonemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch phonemes dari Supabase saat komponen dimount
  useEffect(() => {
    const fetchPhonemes = async () => {
      try {
        const { data, error } = await supabase
          .from('phonetics')
          .select('*')
          .order('phoneme', { ascending: true }); // Urutkan berdasarkan phoneme

        if (error) throw error;

        setPhonemes(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPhonemes();
  }, []);

  // Pisahkan menjadi konsonan dan vokal
  const consonants = phonemes.filter(p => p.phoneme >= 1 && p.phoneme <= 24);
  const vowels = phonemes.filter(p => p.phoneme >= 25 && p.phoneme <= 44);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="mx-auto max-w-5xl p-4">
      <h1 className="text-2xl font-bold mb-6">Phoneme Chart</h1>

      {/* Section Consonants */}
      <h2 className="text-xl font-semibold mb-3">Consonants</h2>
      <div className="overflow-auto">
        <table className="min-w-full bg-white mb-8">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">IPA Symbol</th>
              <th className="px-3 py-2 text-left">Graphemes</th>
              <th className="px-3 py-2 text-left">Examples</th>
              <th className="px-3 py-2 text-left">Voiced?</th>
              <th className="px-3 py-2 text-left">Indo Approx</th>
              <th className="px-3 py-2 text-left">Sound</th>
            </tr>
          </thead>
          <tbody>
            {consonants.map((item) => (
              <tr key={item.phoneme} className="border-b">
                <td className="px-3 py-2">{item.phoneme}</td>
                <td className="px-3 py-2">{item.ipasymbol}</td>
                <td className="px-3 py-2">{item.graphemes}</td>
                <td className="px-3 py-2">{item.examples}</td>
                <td className="px-3 py-2">{item.voiced}</td>
                <td className="px-3 py-2">{item.indoapprox || "-"}</td>
                <td className="px-3 py-2">
                  <button
                    onClick={() => speakEnglish(item.examples)}
                    className="bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600"
                  >
                    🔊
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Section Vowels */}
      <h2 className="text-xl font-semibold mb-3">Vowels</h2>
      <div className="overflow-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">IPA Symbol</th>
              <th className="px-3 py-2 text-left">Graphemes</th>
              <th className="px-3 py-2 text-left">Examples</th>
              <th className="px-3 py-2 text-left">Indo Approx</th>
              <th className="px-3 py-2 text-left">Sound</th>
            </tr>
          </thead>
          <tbody>
            {vowels.map((item) => (
              <tr key={item.phoneme} className="border-b">
                <td className="px-3 py-2">{item.phoneme}</td>
                <td className="px-3 py-2">{item.ipasymbol}</td>
                <td className="px-3 py-2">{item.graphemes}</td>
                <td className="px-3 py-2">{item.examples}</td>
                <td className="px-3 py-2">{item.indoapprox || "-"}</td>
                <td className="px-3 py-2">
                  <button
                    onClick={() => speakEnglish(item.examples)}
                    className="bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600"
                  >
                    🔊
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-gray-700 text-sm">
        <p>
          <strong>What is the International Phonetic Alphabet?</strong> The IPA
          consists of symbols that show you how to pronounce words in any
          language. Created by the International Phonetic Association, it helps
          learners, teachers, and linguists identify and pronounce sounds
          accurately.
        </p>
      </div>
    </div>
  );
};

export default PhonemeChart;
