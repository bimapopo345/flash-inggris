// === File: C:\Users\bimap\OneDrive\Desktop\Ku\card\gpt\src\components\Translate.js ===

import React, { useState } from "react";

// Fungsi TTS sederhana (memakai browser speechSynthesis)
function speakEnglish(text) {
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
  } else {
    alert("Browser Anda tidak mendukung Speech Synthesis");
  }
}

function Translate() {
  const [inputText, setInputText] = useState("");
  const [translationResult, setTranslationResult] = useState("");
  const [loading, setLoading] = useState(false);

  // Contoh: Memanggil API GLHF atau API penerjemah lain
  async function handleTranslate() {
    if (!inputText.trim()) return;

    setLoading(true);

    try {
      // --- Misalnya meniru `generateWithGLHF` ---
      const prompt = `
You are a bilingual translator. 
ONLY return JSON in EXACT format:
{"translation": "Terjemah disini"}
Translate: "${inputText}"
      `;

      const response = await fetch(
        "https://flash-inggris-production.up.railway.app/api/glhf",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            // Silakan ganti model sesuai data "settings" di Supabase
            model: "hf:meta-llama/Meta-Llama-3.1-405B-Instruct",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      let aiMessage = data?.message || "";

      // Coba parse JSON
      let parsed;
      try {
        parsed = JSON.parse(aiMessage.trim());
      } catch (err) {
        // fallback: cari '{'
        const idx = aiMessage.indexOf("{");
        if (idx !== -1) {
          const sliced = aiMessage.slice(idx).trim();
          try {
            parsed = JSON.parse(sliced);
          } catch (err2) {
            // Jika parsing gagal total, kita beri fallback
            parsed = { translation: aiMessage };
          }
        } else {
          parsed = { translation: aiMessage };
        }
      }

      setTranslationResult(parsed.translation || "(No translation)");
    } catch (err) {
      console.error(err);
      setTranslationResult("Terjadi kesalahan saat menerjemahkan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl text-center">
      <h2 className="text-2xl font-bold mb-4">Translate Feature</h2>

      <div className="mb-4">
        <textarea
          className="border border-gray-300 w-full p-2 rounded"
          rows={4}
          placeholder="Ketikkan kalimat yang ingin diterjemahkan ..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
      </div>

      <button
        onClick={handleTranslate}
        disabled={loading}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Translating..." : "Translate"}
      </button>

      {/* Hasil Terjemahan */}
      {translationResult && (
        <div className="mt-4 p-4 border rounded bg-white shadow-sm">
          <p className="text-gray-700 mb-2">
            <strong>Translation:</strong> {translationResult}
          </p>

          <button
            onClick={() => speakEnglish(translationResult)}
            className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            🔊 Sound
          </button>
        </div>
      )}
    </div>
  );
}

export default Translate;
