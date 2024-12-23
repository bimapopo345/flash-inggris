import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

const DEFAULT_GLHF_MODEL = "hf:meta-llama/Meta-Llama-3.1-405B-Instruct";
const DEFAULT_GLHF_APIKEY = "glhf_ef882617166556f06dc68caa8cd36b75";

function Settings() {
  const [glhfApiKey, setGlhfApiKey] = useState("");
  const [glhfModel, setGlhfModel] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const { data, error } = await supabase.from('settings').select().single();
    if (!error && data) {
      setGlhfApiKey(data.glhf_api_key || DEFAULT_GLHF_APIKEY);
      setGlhfModel(data.glhf_model || DEFAULT_GLHF_MODEL);
    } else {
      setGlhfApiKey(DEFAULT_GLHF_APIKEY);
      setGlhfModel(DEFAULT_GLHF_MODEL);
    }
  }

  function sanitizeModel(model) {
    // Jika model belum diawali dengan "hf:", tambahkan prefix tersebut
    return model.startsWith("hf:") ? model : `hf:${model}`;
  }

  async function handleSave() {
    const sanitizedModel = sanitizeModel(glhfModel);

    // Upsert = insert if not exist, else update
    const { error } = await supabase
      .from('settings')
      .upsert([
        {
          id: 1,
          glhf_api_key: glhfApiKey,
          glhf_model: sanitizedModel
        }
      ]);
    if (error) {
      console.error("Error saving settings:", error);
      alert("Gagal menyimpan settings. Periksa konsol untuk detail.");
      return;
    }
    alert("Settings berhasil disimpan!");
  }

  async function handleReset() {
    setGlhfApiKey(DEFAULT_GLHF_APIKEY);
    setGlhfModel(DEFAULT_GLHF_MODEL);
    const { error } = await supabase
      .from('settings')
      .upsert([
        {
          id: 1,
          glhf_api_key: DEFAULT_GLHF_APIKEY,
          glhf_model: DEFAULT_GLHF_MODEL
        }
      ]);
    if (error) {
      console.error("Error resetting settings:", error);
      alert("Gagal mereset settings. Periksa konsol untuk detail.");
      return;
    }
    alert("Settings di-reset ke default!");
  }

  return (
    <div className="mx-auto max-w-xl">
      <h2 className="text-2xl font-bold mb-4">Settings GLHF / Models</h2>

      <div className="mb-4">
        <label className="block font-semibold mb-1">GLHF API Key</label>
        <input
          type="text"
          className="border border-gray-300 rounded px-3 py-2 w-full"
          value={glhfApiKey}
          onChange={(e) => setGlhfApiKey(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Model Name</label>
        <input
          type="text"
          className="border border-gray-300 rounded px-3 py-2 w-full"
          value={glhfModel}
          onChange={(e) => setGlhfModel(e.target.value)}
          placeholder="Contoh: meta-llama/Meta-Llama-3.1-405B-Instruct"
        />
        <small className="text-gray-500">
          Pastikan model diawali dengan <code>hf:</code> (contoh: <code>hf:meta-llama/Meta-Llama-3.1-405B-Instruct</code>)
        </small>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={handleSave}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Save
        </button>
        <button
          onClick={handleReset}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export default Settings;
