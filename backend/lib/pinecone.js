const { Pinecone } = require("@pinecone-database/pinecone");

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

async function upsertToPinecone(id, embedding, metadata) {
  try {
    const index = pc.Index(process.env.PINECONE_INDEX_NAME);
    await index.upsert([{ id, values: embedding, metadata }]);
  } catch (error) {
    console.error("Error upserting to Pinecone:", error);
    throw error;
  }
}

async function searchInPinecone(queryEmbedding, topK = 3) {
  try {
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
  } catch (error) {
    console.error("Error searching in Pinecone:", error);
    throw error;
  }
}

module.exports = { upsertToPinecone, searchInPinecone };
