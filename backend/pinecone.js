const { Pinecone } = require("@pinecone-database/pinecone");

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

async function upsertToPinecone(id, embedding, metadata) {
  const index = pc.Index(process.env.PINECONE_INDEX_NAME);
  await index.upsert([{ id, values: embedding, metadata }]);
}

async function searchInPinecone(queryEmbedding, topK = 3) {
  const index = pc.Index(process.env.PINECONE_INDEX_NAME);
  const results = await index.query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
  });

  return results.matches.map((match) => ({
    title: match.metadata.title,
    owner: match.metadata.owner,
    modifiedTime: match.metadata.modifiedTime,
    fileId: match.metadata.fileId,
    score: match.score,
  }));
}

module.exports = { upsertToPinecone, searchInPinecone };
