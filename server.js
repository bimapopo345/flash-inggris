require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/glhf', async (req, res) => {
  const { prompt, model } = req.body;
  if (!prompt || !model) {
    return res.status(400).json({ error: 'Missing prompt or model' });
  }

  try {
    const configuration = new Configuration({
      apiKey: process.env.GLHF_API_KEY || "glhf_ef882617166556f06dc68caa8cd36b75",
      basePath: "https://glhf.chat/api/openai/v1",
    });

    const openai = new OpenAIApi(configuration);

    const response = await openai.createChatCompletion({
      model: model,
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
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
