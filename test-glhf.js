///////////////////////////////////////////////
// File: test-glhf.js
///////////////////////////////////////////////

/**
 * Pastikan sudah:
 *   npm install openai
 * lalu jalankan:
 *   node test-glhf.js
 */

import { Configuration, OpenAIApi } from "openai";

// 1) Buat konfigurasi dengan base URL GLHF
const configuration = new Configuration({
  apiKey: "glhf_ef882617166556f06dc68caa8cd36b75",
  basePath: "https://glhf.chat/api/openai/v1"  // penting!
});

// 2) Inisialisasi OpenAIApi
const openai = new OpenAIApi(configuration);

async function testGLHF() {
  try {
    // 3) Panggil endpoint chat.completions
    const response = await openai.createChatCompletion({
      // prefix model dengan "hf:"
      model: "hf:meta-llama/Meta-Llama-3.1-405B-Instruct",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Halo, apa kabar?" }
      ],
      temperature: 0.7
    });

    // 4) Cek isi jawaban
    console.log("AI response:", response.data.choices[0].message.content);
  } catch (err) {
    // 5) Debug jika ada error
    console.error("GLHF error:", err.response?.data || err);
  }
}

testGLHF();
