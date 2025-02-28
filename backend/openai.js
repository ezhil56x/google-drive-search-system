const OpenAI = require("openai");

async function generateEmbedding(text) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const embedding = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
  });

  return embedding.data[0].embedding;
}

module.exports = { generateEmbedding };
