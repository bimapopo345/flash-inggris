// File: C:\Users\bimap\OneDrive\Desktop\Ku\card\gpt\src\components\Translate.js

import React, { useState } from "react";

// Fungsi TTS (bahasa Inggris)
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
  // State input dan hasil
  const [englishInput, setEnglishInput] = useState("");
  const [translation, setTranslation] = useState("");
  const [phonetic, setPhonetic] = useState("");
  const [phoneticIndo, setPhoneticIndo] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // === (Opsional) checkSpelling MIRIP WordList.js ===
  // Jika mau memunculkan modal konfirmasi ejaan, buat checkSpelling() di sini.
  // Lalu, kalau ejaan berbeda, tampilkan modal.
  // Untuk ringkas, di contoh ini kita langsung generate.

  // ----------------------------------------
  // FUNGSI MIRIP generateWithGLHF DI WordList
  // ----------------------------------------
  async function generateTranslation(englishWord) {
    // Prompt minta JSON: translation, phonetic, phonetic_indo
    const prompt = `
You are a helpful translator. 
DO NOT add any explanation. 
ONLY return JSON in the EXACT format below:
{
  "translation": "...",
  "phonetic": "...",
  "phonetic_indo": "..."
}

Where:
- "translation" is Indonesian meaning or translation of the English word/sentence.
- "phonetic" is the standard English phonetic (IPA) like /əˈvɛɪ.lə.bɪl.ə.ti/.
- "phonetic_indo" is how an Indonesian would read it (no slashes).
  
Word: "${englishWord}"
    `;

    try {
      const response = await fetch(
        "https://flash-inggris-production.up.railway.app/api/glhf",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            // Misal default: "hf:meta-llama/Meta-Llama-3.1-405B-Instruct"
            // atau diambil dari Supabase "settings"
            model: "hf:meta-llama/Meta-Llama-3.1-405B-Instruct",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gagal memanggil API, status: ${response.statusText}`);
      }

      const data = await response.json();
      const aiMessage = data.message || "";

      // Parsing JSON
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
            console.warn("Gagal parse JSON AI:", err2);
            return null;
          }
        } else {
          return null;
        }
      }

      return parsed;
    } catch (err) {
      console.error("generateTranslation error:", err);
      return null;
    }
  }

  // ----------------------------------------
  // HANDLE SUBMIT
  // ----------------------------------------
  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");

    if (!englishInput.trim()) {
      setErrorMsg("Harap isi teks bahasa Inggris.");
      return;
    }

    setLoading(true);

    // (Opsional) checkSpelling => jika mau 100% mirip WordList,
    // panggil checkSpelling dulu, lalu confirm modal, dsb.

    // Di sini langsung generate:
    const result = await generateTranslation(englishInput.trim());
    setLoading(false);

    if (!result) {
      setErrorMsg(
        "Terjadi kesalahan: data AI tidak valid atau gagal dipanggil."
      );
      return;
    }

    setTranslation(result.translation || "");
    setPhonetic(result.phonetic || "");
    setPhoneticIndo(result.phonetic_indo || "");
  }

  // ----------------------------------------
  // RENDER
  // ----------------------------------------
  return (
    <div className="mx-auto max-w-xl">
      <h2 className="text-2xl font-bold mb-4">Translate (Mirip WordList)</h2>

      {/* FORM INPUT */}
      <form
        onSubmit={handleSubmit}
        className="mb-6 bg-white p-4 rounded shadow-sm"
      >
        {errorMsg && <p className="text-red-500 mb-3">{errorMsg}</p>}
        <div className="mb-3">
          <label className="block font-medium mb-1">
            Masukkan Kalimat Inggris:
          </label>
          <input
            type="text"
            className="border border-gray-300 rounded px-3 py-2 w-full"
            placeholder="Contoh: I'm currently studying for my exam."
            value={englishInput}
            onChange={(e) => setEnglishInput(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Generate"}
        </button>
      </form>

      {/* HASIL TERJEMAHAN & PHONETIC */}
      {translation && (
        <div className="border border-gray-200 p-4 mb-3 rounded bg-white shadow-sm">
          <p>
            <strong>Translation (ID):</strong> {translation}
          </p>
          <p>
            <strong>Phonetic (IPA):</strong> {phonetic || "-"}
          </p>
          <p>
            <strong>Phonetic Indo:</strong> {phoneticIndo || "-"}
          </p>

          {/* Tombol TTS */}
          <button
            onClick={() => speakEnglish(englishInput)}
            className="mt-3 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            🔊 Suara (English)
          </button>
        </div>
      )}
    </div>
  );
}

export default Translate;
