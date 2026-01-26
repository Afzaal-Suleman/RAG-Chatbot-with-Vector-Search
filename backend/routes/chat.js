import express from "express";
import { getEmbedding, generateAnswer } from "../utils/gemini.js";
import { searchDocuments, upsertDocument } from "../utils/qdrant.js";

const router = express.Router();

// Chat endpoint
router.post("/", async (req, res) => {
    try {
        const { question } = req.body;
        
        // Validate input
        if (!question || typeof question !== 'string') {
            return res.status(400).json({ 
                success: false,
                error: "Valid question string is required",
                received: typeof question
            });
        }
        
        const trimmedQuestion = question.trim();
        if (trimmedQuestion.length < 2) {
            return res.status(400).json({ 
                success: false,
                error: "Question must be at least 2 characters long",
                length: trimmedQuestion.length
            });
        }
        
        console.log(`Question received: "${trimmedQuestion.substring(0, 100)}..."`);
        
        // Convert question to embedding
        const queryVector = await getEmbedding(trimmedQuestion);
        console.log(queryVector);
        
        // Search top 3 documents with minimum similarity score
        const results = await searchDocuments(queryVector, 2, 0.3);
        console.log(results[0].payload.text);
        
        if (results.length === 0) {
            return res.json({ 
                success: true,
                answer: "I don't have enough information to answer that question. Please try rephrasing or adding more context.",
                confidence: "low",
                sources: []
            });
        }
        
        // Log search results for debugging
        results.forEach((result, i) => {
            console.log(`   ${i + 1}. Score: ${result.score.toFixed(3)} - "${result.payload.text.substring(0, 80)}..."`);
        });
        
        // Prepare context from search results
        const context = results
            .filter(r => r.score > 0.4) // Filter out low-confidence matches
            .map(p => p.payload.text)
            .join("\n\n");
        
        if (!context || context.trim().length < 10) {
            return res.json({ 
                success: true,
                answer: "I couldn't find specific information to answer your question accurately.",
                confidence: "low",
                sources: results.map(r => ({
                    text: r.payload.text.substring(0, 150) + '...',
                    score: r.score
                }))
            });
        }
        
        
        // Generate answer using Gemini
        // const answer = await generateAnswer(context, trimmedQuestion);
        // if(!answer){
        //     answer = results[0].payload.text
        // }
        const answer = results[0].payload.text;
        res.json({ 
            success: true,
            answer: answer,
            confidence: results[0].score > 0.7 ? "high" : results[0].score > 0.5 ? "medium" : "low",
            sources: results.slice(0, 3).map(r => ({
                id: r.id,
                text: r.payload.text,
                score: r.score.toFixed(3),
                timestamp: r.payload.timestamp || 'unknown'
            })),
            stats: {
                documentsSearched: results.length,
                bestMatchScore: results[0]?.score?.toFixed(3) || 0,
                contextLength: context.length
            }
        });
        
    } catch (err) {
        console.error("Error in chat endpoint:", err);
        
        // Determine error type for appropriate response
        let errorMessage = "Something went wrong";
        let statusCode = 500;
        
        if (err.message.includes("embedding") || err.message.includes("generated")) {
            errorMessage = "Failed to process your question";
            statusCode = 500;
        } else if (err.message.includes("Qdrant") || err.message.includes("search")) {
            errorMessage = "Knowledge base service is temporarily unavailable";
            statusCode = 503;
        } else if (err.message.includes("network") || err.message.includes("timeout")) {
            errorMessage = "Request timeout. Please try again.";
            statusCode = 504;
        }
        
        res.status(statusCode).json({ 
            success: false,
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? err.message : undefined,
            timestamp: new Date().toISOString()
        });
    }
});

// Add document endpoint
router.post("/add", async (req, res) => {
    try {
        const { text, category, tags } = req.body;
        
        // Validate input
        if (!text || typeof text !== 'string') {
            return res.status(400).json({ 
                success: false,
                error: "Valid text string is required",
                received: typeof text
            });
        }
        
        const trimmedText = text.trim();
        if (trimmedText.length < 3) {
            return res.status(400).json({ 
                success: false,
                error: "Text must be at least 3 characters long",
                length: trimmedText.length
            });
        }
        
        if (trimmedText.length > 10000) {
            return res.status(400).json({ 
                success: false,
                error: "Text is too long (max 10000 characters)",
                length: trimmedText.length
            });
        }
        
        
        // Generate embedding
        const embedding = await getEmbedding(trimmedText);
        
        // Generate unique numeric ID
        const id = Date.now() + Math.floor(Math.random() * 10000);
        
        // Prepare metadata
        const metadata = {
            category: category || "general",
            tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
            addedBy: req.ip || "unknown",
            source: req.get('Referer') || "direct"
        };
        
        // Upsert document
        await upsertDocument(id, embedding, trimmedText, metadata);
        
        
        res.status(201).json({ 
            success: true,
            message: "Document added successfully to knowledge base",
            data: {
                id: id,
                textPreview: trimmedText.length > 100 
                    ? trimmedText.substring(0, 100) + '...' 
                    : trimmedText,
                textLength: trimmedText.length,
                category: metadata.category,
                tags: metadata.tags,
                embeddingDimensions: embedding.length,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (err) {
        console.error("Error adding document:", err);
        
        // Parse specific errors
        let errorMessage = "Failed to add document";
        let statusCode = 500;
        
        if (err.message.includes("embedding") || err.message.includes("generated")) {
            errorMessage = "Failed to process text content";
            statusCode = 500;
        } else if (err.message.includes("Bad Request") || err.message.includes("format")) {
            errorMessage = "Invalid document format or data";
            statusCode = 400;
        } else if (err.message.includes("dimension") || err.message.includes("vector")) {
            errorMessage = "Document processing error. Please check if the knowledge base is properly configured.";
            statusCode = 500;
        }
        
        res.status(statusCode).json({ 
            success: false,
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? err.message : undefined,
            timestamp: new Date().toISOString()
        });
    }
});

// Health check endpoint
router.get("/health", async (req, res) => {
    try {
        const geminiHealth = await getEmbedding("test")
            .then(() => ({ status: "healthy", dimensions: "verified" }))
            .catch(err => ({ status: "unhealthy", error: err.message }));
        
        // You might want to add Qdrant health check here
        // const qdrantHealth = await searchDocuments([0.1, ...], 1, 0)
        //     .then(() => ({ status: "healthy" }))
        //     .catch(err => ({ status: "unhealthy", error: err.message }));
        
        res.json({
            success: true,
            status: "operational",
            timestamp: new Date().toISOString(),
            services: {
                gemini: geminiHealth,
                // qdrant: qdrantHealth
            },
            version: "1.0.0"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            status: "degraded",
            error: err.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Get info endpoint
router.get("/info", async (req, res) => {
    try {
        // This would require adding a getCollectionInfo function to qdrant.js
        res.json({
            success: true,
            endpoints: {
                "POST /api/chat": "Ask questions to the knowledge base",
                "POST /api/chat/add": "Add new documents to the knowledge base",
                "GET /api/chat/health": "Check service health",
                "GET /api/chat/info": "Get API information"
            },
            features: {
                semanticSearch: true,
                documentAddition: true,
                contextAwareAnswers: true
            },
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

export default router;