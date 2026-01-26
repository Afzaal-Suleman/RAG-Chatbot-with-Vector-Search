import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import chatRoute from "./routes/chat.js";
// import { createCollection } from "./utils/qdrant.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/chat", chatRoute);

// await createCollection(); // Ensure collection exists

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
