import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const gemini = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});


export async function getEmbedding(text) {
  const response = await gemini.embeddings.create({
    model: "gemini-embedding-001",  
    input: text
  });
  return response.data[0].embedding;
}


export async function generateAnswer(context, question) {
  const completion = await gemini.chat.completions.create({
    model: "gemini-2.5-flash",  // choose a Gemini chat model
    messages: [
      { role: "system", content: "Answer *only* using the context below:" },
      { role: "system", content: context },
      { role: "user", content: question }
    ],
    temperature: 0
  });

  return completion.choices[0].message.content;
}
