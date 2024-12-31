// File: C:\Users\bimap\OneDrive\Desktop\Ku\card\gpt\src\components\Translate.js

import React, { useState } from "react";

// FUNGSI TTS
function speakEnglish(text) {
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US"; // set bahasa ke English
    speechSynthesis.speak(utterance);
  } else {
    alert("Browser Anda tidak mendukung Speech Synthesis");
  }
}

function Translate() {
  const [englishInput, setEnglishInput] = useState("");
  const [translation, setTranslation] = useState("");
  const [phonetic, setPhonetic] = useState("");
  const [phoneticIndo, setPhoneticIndo] = useState("");
  const [loading, setLoading] = useState(false);

  // Contoh memanggil API GLHF
  async function handleTranslate(e) {
    e.preventDefault();
    if (!englishInput.trim()) return;
    setLoading(true);

    const prompt = `
You are a helpful translator. 
ONLY return JSON in EXACT format:
{
  "translation": "...",
  "phonetic": "...",
  "phonetic_indo": "..."
}

Word: "${englishInput}"
    `;

    try {
      const response = await fetch(
        "https://flash-inggris-production.up.railway.app/api/glhf",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            // Model default atau sesuai setelan "settings" di Supabase
            model: "hf:meta-llama/Meta-Llama-3.1-405B-Instruct",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const data = await response.json();
      const aiMessage = data?.message || "";

      // Tangkap JSON: { "translation": "...", "phonetic": "...", "phonetic_indo": "..." }
      let parsed;
      try {
        parsed = JSON.parse(aiMessage.trim());
      } catch (err) {
        // fallback cari '{'
        const idx = aiMessage.indexOf("{");
        if (idx !== -1) {
          const sliced = aiMessage.slice(idx).trim();
          try {
            parsed = JSON.parse(sliced);
          } catch (err2) {
            parsed = null;
          }
        }
      }

      if (parsed) {
        setTranslation(parsed.translation || "");
        setPhonetic(parsed.phonetic || "");
        setPhoneticIndo(parsed.phonetic_indo || "");
      } else {
        // Jika parsing gagal, fallback
        setTranslation("Terjadi kesalahan saat parsing JSON AI.");
      }
    } catch (error) {
      console.error(error);
      setTranslation("Gagal memanggil API. Cek console.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl text-center">
      <h2 className="text-2xl font-bold mb-6">Translate</h2>

      <form onSubmit={handleTranslate} className="mb-6">
        <input
          type="text"
          className="border border-gray-300 rounded px-3 py-2 w-full mb-3"
          placeholder="Masukkan kata/kalimat bahasa Inggris..."
          value={englishInput}
          onChange={(e) => setEnglishInput(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Translate"}
        </button>
      </form>

      {/* Hasil */}
      {translation && (
        <div className="border border-gray-300 rounded p-4 bg-white shadow-sm">
          <p className="mb-2">
            <strong>Hasil Terjemahan:</strong> {translation}
          </p>
          <p className="mb-2">
            <strong>Phonetic (IPA):</strong> {phonetic || "-"}
          </p>
          <p className="mb-4">
            <strong>Phonetic Indo:</strong> {phoneticIndo || "-"}
          </p>

          {/* Tombol suara (untuk English) */}
          <button
            onClick={() => speakEnglish(englishInput)}
            className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            🔊 Dengarkan (English)
          </button>
        </div>
      )}
    </div>
  );
}

export default Translate;
