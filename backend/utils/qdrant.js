import { QdrantClient } from "@qdrant/js-client-rest";

// Qdrant client with cloud configuration
export const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_KEY,
  timeout: 10000,
   checkCompatibility: false,
});




// export async function createCollection() {
//   try {
//     // Check if collection exists first
//     const collections = await qdrant.getCollections();
//     const exists = collections.collections.some(c => c.name === "documents");
    
//     if (exists) {
//       // Delete existing collection
//       await qdrant.deleteCollection("documents");
//       console.log("⚠️ Deleted existing collection with wrong dimensions");
//     }
    
//     // Create new collection with correct dimensions
//     await qdrant.createCollection("documents", {
//       vectors: {
//         size: 3072, // Updated from 1536 to 3072
//         distance: "Cosine"
//       }
//     });
//     console.log("✅ Collection created with 3072 dimensions");
//   } catch (e) {
//     console.error("❌ Error creating collection:", e.message);
//   }
// }

// Upsert a document

// Single document upsert
export async function upsertDocument(id, embedding, text, metadata = {}) {
  try {
    // Ensure ID is numeric
    const pointId = typeof id === 'number' ? id : parseInt(id);
    
    if (isNaN(pointId)) {
      throw new Error(`Invalid ID: ${id}. Must be a number.`);
    }
    
    await qdrant.upsert("documents", {
      points: [{
        id: pointId,
        vector: embedding,
        payload: {
          text: text,
          ...metadata,
          timestamp: new Date().toISOString()
        }
      }],
      wait: true
    });
    
    console.log(`✅ Document ${pointId} upserted successfully`);
    return { success: true, id: pointId };
  } catch (error) {
    console.error(`❌ Error upserting document ${id}:`, error.message);
    throw error;
  }
}

// Search documents with minimum score threshold
export async function searchDocuments(queryVector, limit = 2, minScore = 0.3) {
  try {
    const response = await qdrant.search("documents", {
      vector: queryVector,
      limit: limit,
      with_payload: true,
      score_threshold: minScore, // Add this parameter
    });
    
    return response;
  } catch (error) {
    console.error("❌ Error searching documents:", error.message);
    throw error;
  }
}

// Batch upsert documents
export async function upsertDocuments(points) {
  try {
    await qdrant.upsert("documents", {
      points: points
    });
    console.log(`✅ Batch upserted ${points.length} documents`);
  } catch (error) {
    console.error("❌ Error batch upserting:", error.message);
    throw error;
  }
}