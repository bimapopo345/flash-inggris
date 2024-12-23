// pages/api/glhf.js

import { Configuration, OpenAIApi } from "openai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, model } = req.body;

  if (!prompt || !model) {
    return res.status(400).json({ error: 'Missing prompt or model' });
  }

  try {
    const configuration = new Configuration({
      apiKey: process.env.GLHF_API_KEY, // Pastikan Anda menyimpan API key di .env.local
      basePath: "https://glhf.chat/api/openai/v1",
    });

    const openai = new OpenAIApi(configuration);

    const response = await openai.createChatCompletion({
      model: model, // sudah diawali dengan "hf:"
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    const aiMessage = response.data.choices[0].message.content;

    res.status(200).json({ message: aiMessage });
  } catch (error) {
    console.error("GLHF error:", error.response?.data || error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
