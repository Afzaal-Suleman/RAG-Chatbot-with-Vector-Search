// import { qdrant, upsertDocuments } from "../utils/qdrant.js";
// import { getEmbedding } from "../utils/gemini.js";

// const documents = [
//   "Password reset requires email verification.",
//   "Refund policy is 7 days after purchase.",
//   "Support is available 24/7 via email."
// ];

// async function addDocs() {
//   console.log("Starting document addition process...");
  
//   // Step 1: Test connection
// //   const isConnected = await testConnection();
// //   if (!isConnected) {
// //     console.error("Cannot proceed - Qdrant connection failed");
// //     return;
// //   }
  
//   // Step 2: Create collection
// //   await createCollection();
  
//   // Step 3: Generate embeddings
//   console.log("Generating embeddings...");
//   const points = await Promise.all(
//     documents.map(async (text, i) => {
//       try {
//         const embedding = await getEmbedding(text);
//         return {
//           id: i + 1, // Use numeric IDs starting from 1
//           vector: embedding,
//           payload: { 
//             text,
//             index: i,
//             timestamp: new Date().toISOString()
//           }
//         };
//       } catch (error) {
//         console.error(`Error generating embedding for document ${i}:`, error.message);
//         return null;
//       }
//     })
//   );
  
//   // Filter out any failed embeddings
//   const validPoints = points.filter(point => point !== null);
//   console.log(`Generated ${validPoints.length} valid embeddings`);
  
//   if (validPoints.length === 0) {
//     console.error("No valid embeddings generated");
//     return;
//   }
  
//   // Step 4: Upsert documents in batches
//   try {
//     await upsertDocuments(validPoints);
//     console.log("✅ All documents added successfully!");
    
//     // Verify the documents were added
//     const collectionInfo = await qdrant.getCollection("documents");
//     console.log("Collection info:", {
//       name: collectionInfo.name,
//       vectors_count: collectionInfo.vectors_count,
//       status: collectionInfo.status
//     });
    
//   } catch (error) {
//     console.error("Failed to add documents:", error.message);
//   }
// }

// // Alternative: Run as standalone
// // if (import.meta.url === new URL(import.meta.url).href) {
// //   addDocs().catch(console.error);
// // }

// export default addDocs;