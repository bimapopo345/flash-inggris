// src/components/WordList.js
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase'; 
import SpellingConfirmModal from './SpellingConfirmModal'; // modal yang kita buat

// FUNGSI TTS
function speakEnglish(text) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  } else {
    alert("Browser tidak mendukung Speech Synthesis.");
  }
}

function WordList() {
  const [words, setWords] = useState([]);
  const [search, setSearch] = useState('');
  const [newEnglish, setNewEnglish] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Setting GLHF (API key, model) dari Supabase
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");

  // === State untuk cek ejaan & modal
  const [showSpellingModal, setShowSpellingModal] = useState(false);
  const [correctedSpelling, setCorrectedSpelling] = useState('');

  // Menyimpan “langkah berikutnya” setelah user tutup modal
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    fetchWords();
    fetchSettings();
  }, []);

  // ---------------------------------
  // 1) AMBIL SETTING API DAN MODEL
  // ---------------------------------
  async function fetchSettings() {
    try {
      const { data, error } = await supabase.from('settings').select().single();
      if (!error && data) {
        const retrievedModel = data.glhf_model || "hf:meta-llama/Meta-Llama-3.1-405B-Instruct";
        setApiKey(data.glhf_api_key || "glhf_ef882617166556f06dc68caa8cd36b75");
        
        // Sanitasi model agar pasti diawali "hf:"
        const sanitizedModel = retrievedModel.startsWith("hf:") ? retrievedModel : `hf:${retrievedModel}`;
        setModel(sanitizedModel);
        
        console.log("Sanitized Model:", sanitizedModel);
      } else {
        // fallback default
        setApiKey("glhf_ef882617166556f06dc68caa8cd36b75");
        setModel("hf:meta-llama/Meta-Llama-3.1-405B-Instruct");
      }
    } catch (err) {
      console.error("fetchSettings error:", err);
      // fallback default
      setApiKey("glhf_ef882617166556f06dc68caa8cd36b75");
      setModel("hf:meta-llama/Meta-Llama-3.1-405B-Instruct");
    }
  }

  // ---------------------------------
  // 2) AMBIL LIST WORDS DARI SUPABASE
  // ---------------------------------
  async function fetchWords() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('words')
        .select('*')
        .order('english', { ascending: true });
      setLoading(false);

      if (error) {
        console.error("Error fetchWords:", error);
        setErrorMsg("Gagal memuat data kata.");
        return;
      }
      setWords(data || []);
    } catch (err) {
      setLoading(false);
      console.error("Exception fetchWords:", err);
      setErrorMsg("Terjadi kesalahan memuat data.");
    }
  }

  // ---------------------------------
  // 3) CEK EJAAN
  // ---------------------------------
  async function checkSpelling(englishWord) {
    // Prompt: HARUS hanya JSON
    const prompt = `
You are an English spelling corrector. 
Please ONLY return JSON in the EXACT format:
{"correct_spelling": "..."}

If the word is correct, return:
{"correct_spelling": "${englishWord}"}

Word: "${englishWord}"
    `;

    console.log("Using model (checkSpelling):", model);

    try {
      const response = await fetch('https://flash-inggris-production.up.railway.app/api/glhf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          model
        })
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response text:", errorText);
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Received data from /api/glhf (checkSpelling):", data);
      const aiMessage = data.message;

      // Bersihkan output => tangkap JSON
      let j;
      try {
        j = JSON.parse(aiMessage.trim());
      } catch (err) {
        // fallback cari '{' paling awal
        const idx = aiMessage.indexOf('{');
        if (idx !== -1) {
          const content = aiMessage.slice(idx).trim();
          try {
            j = JSON.parse(content);
          } catch (err2) {
            console.warn("Failed to parse AI (spelling) message:", err2);
            return englishWord; // fallback: kembalikan input
          }
        } else {
          return englishWord;
        }
      }

      if (j?.correct_spelling) {
        return j.correct_spelling;
      } else {
        return englishWord;
      }
    } catch (err) {
      console.error("checkSpelling error:", err.message);
      return englishWord; // fallback
    }
  }

  // ---------------------------------
  // 4) GENERATE TERJEMAHAN + PHONETIC
  // ---------------------------------
  async function generateWithGLHF(englishWord) {
    // Tekankan agar AI hanya balas JSON, 
    // phonetic_indo = cara baca ala Indonesia
    const prompt = `
You are a helpful translator. 
DO NOT add any explanation. 
ONLY return JSON in the EXACT format below:
{
  "translation": "...",
  "example_usage": "...",
  "example_usage_translation": "...",
  "phonetic": "...",
  "phonetic_indo": "..."
}

Where:
- "translation" is Indonesian meaning of the word.
- "example_usage" is one English sentence using the word.
- "example_usage_translation" is the Indonesian translation of that sentence.
- "phonetic" is IPA-like or standard phonetic (/.../).
- "phonetic_indo": how an Indonesian would read it (no slashes).
  
Word: "${englishWord}"
    `;

    console.log("Using model (generateWithGLHF):", model);

    try {
      const response = await fetch('https://flash-inggris-production.up.railway.app/api/glhf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          model
        })
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response text:", errorText);
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Received data from /api/glhf (generateWithGLHF):", data);
      const aiMessage = data.message;
      console.log("AI Message:", aiMessage);

      // Bersihkan output => tangkap JSON
      let dataJson;
      try {
        // Jika kebetulan pakai triple backticks, bersihkan
        let cleaned = aiMessage.trim();
        if (cleaned.startsWith("```") && cleaned.endsWith("```")) {
          cleaned = cleaned.slice(3, -3).trim();
        }
        dataJson = JSON.parse(cleaned);
      } catch {
        // fallback cari '{'
        const idx = aiMessage.indexOf('{');
        if (idx !== -1) {
          let content = aiMessage.slice(idx).trim();
          // buang ``` di akhir kalau ada
          if (content.endsWith("```")) {
            content = content.slice(0, -3).trim();
          }
          try {
            dataJson = JSON.parse(content);
          } catch (err) {
            console.warn("Failed to parse AI (generate) message:", err);
            return null;
          }
        } else {
          return null;
        }
      }
      return dataJson;
    } catch (err) {
      console.error("generateWithGLHF error:", err.message);
      return null;
    }
  }

  // ---------------------------------
  // 5) HANDLE SUBMIT => ADD WORD
  // ---------------------------------
  async function handleAddWord(e) {
    e.preventDefault();
    setErrorMsg('');

    if (!newEnglish.trim()) {
      setErrorMsg("Harap isi kata Inggris.");
      return;
    }

    setLoading(true);
    const corrected = await checkSpelling(newEnglish.trim());

    if (corrected.toLowerCase() !== newEnglish.trim().toLowerCase()) {
      setCorrectedSpelling(corrected);
      setShowSpellingModal(true);

      // Bikin pendingAction terima arg => proceedAddWord(arg)
      setPendingAction(() => (finalSpelling) => {
        proceedAddWord(finalSpelling);
      });

      setLoading(false);
    } else {
      // langsung pakai newEnglish
      proceedAddWord(newEnglish.trim());
    }
  }

  // ---------------------------------
  // 6) LANJUT SETELAH MODAL => PROCEED
  // ---------------------------------
  async function proceedAddWord(overrideEnglish) {
    setLoading(true);

    // Pakai overrideEnglish jika ada, kalau tidak pakai newEnglish
    const wordToUse = overrideEnglish || newEnglish.trim();

    // Generate data
    const glhfResult = await generateWithGLHF(wordToUse);
    if (!glhfResult) {
      setLoading(false);
      setErrorMsg("Gagal memanggil GLHF atau JSON parse. Cek console error.");
      return;
    }

    const {
      translation,
      example_usage,
      example_usage_translation,
      phonetic,
      phonetic_indo
    } = glhfResult;

    // Insert ke Supabase
    const { error } = await supabase.from('words').insert([
      {
        english: wordToUse,  // Pastikan pakai wordToUse
        glhf_translation: translation || '',
        example_usage: example_usage || '',
        example_usage_translation: example_usage_translation || '',
        phonetic: phonetic || '',
        phonetic_indo: phonetic_indo || ''
      }
    ]);

    setLoading(false);
    if (error) {
      console.error("Insert word error:", error);
      setErrorMsg("Gagal menyimpan kata ke database Supabase.");
      return;
    }

    // sukses
    setNewEnglish('');
    fetchWords();
  }

  // ---------------------------------
  // 7) HANDLER MODAL
  // ---------------------------------
  // User klik “Gunakan Ejaan AI”
  function handleConfirmSpelling() {
    closeSpellingModal();
    if (pendingAction) {
      // pass correctedSpelling => proceedAddWord(correctedSpelling)
      pendingAction(correctedSpelling);
      setPendingAction(null);
    }
  }

  // User klik “Tetap Ejaan Saya”
  function handleCancelSpelling() {
    closeSpellingModal();
    if (pendingAction) {
      // Jika user menolak ejaan AI, panggil pendingAction tanpa arg => pakai ejaan lama
      pendingAction();
      setPendingAction(null);
    }
  }

  function closeSpellingModal() {
    setShowSpellingModal(false);
    setCorrectedSpelling('');
  }

  // Filter kata
  const filteredWords = words.filter((w) =>
    w.english.toLowerCase().includes(search.toLowerCase())
  );

  // ---------------------------------
  // RENDER
  // ---------------------------------
  return (
    <div className="mx-auto max-w-xl">
      <h2 className="text-2xl font-bold mb-4">Word List (Modal Konfirmasi Ejaan)</h2>

      <form onSubmit={handleAddWord} className="mb-6 bg-white p-4 rounded shadow-sm">
        {errorMsg && <p className="text-red-500 mb-2">{errorMsg}</p>}
        <div className="mb-3">
          <label className="block font-medium mb-1">English Word:</label>
          <input
            type="text"
            className="border border-gray-300 rounded px-3 py-2 w-full"
            placeholder="Contoh: availability"
            value={newEnglish}
            onChange={(e) => setNewEnglish(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Tambah Kata"}
        </button>
      </form>

      {/* Search */}
      <input
        type="text"
        className="border border-gray-300 rounded px-3 py-2 w-full mb-4"
        placeholder="Cari kata Inggris..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Daftar kata */}
      {filteredWords.map((word) => (
        <div key={word.id} className="border border-gray-200 p-4 mb-3 rounded bg-white shadow-sm">
          <p><strong>English:</strong> {word.english}</p>
          <p><strong>Translation (ID):</strong> {word.glhf_translation}</p>
          <p><strong>Example (EN):</strong> {word.example_usage}</p>
          <p><strong>Arti Example (ID):</strong> {word.example_usage_translation || '-'}</p>
          <p><strong>Phonetic (IPA):</strong> {word.phonetic || '-'}</p>
          <p><strong>Phonetic Indo:</strong> {word.phonetic_indo || '-'}</p>

          <button
            onClick={() => speakEnglish(word.english)}
            className="mt-2 px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            🔊 Suara
          </button>
        </div>
      ))}

      {/* MODAL KONFIRMASI EJAAN */}
      <SpellingConfirmModal
        isOpen={showSpellingModal}
        correctedSpelling={correctedSpelling}
        original={newEnglish}
        onConfirm={handleConfirmSpelling}
        onCancel={handleCancelSpelling}
      />
    </div>
  );
}

export default WordList;
