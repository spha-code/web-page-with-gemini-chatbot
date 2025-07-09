// server.js
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;

// Check if API key is available
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.error("Error: GEMINI_API_KEY not found in .env file.");
    console.error("Please ensure your .env file has GEMINI_API_KEY=\"YOUR_KEY_HERE\"");
    process.exit(1);
}

// Initialize Generative AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
// Ensure you are using the correct model for Gemini 1.5 Flash
// The exact string is 'gemini-1.5-flash-latest' or 'gemini-1.5-flash'
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Or 'gemini-1.5-flash-latest'

// Middleware to parse JSON requests
app.use(express.json());

// --- MODIFICATION HERE: Explicitly serve index.html for the root path ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve other static files from the 'public' directory
// This will handle CSS, JS, etc., if they are referenced relatively in index.html
app.use(express.static(path.join(__dirname, 'public')));


// Chatbot endpoint
app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;
    if (!userMessage) {
        return res.status(400).json({ error: "Message is required" });
    }

    try {
        const result = await model.generateContent(userMessage);
        const response = await result.response;
        const text = response.text();
        res.json({ text: text });
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        // Provide more detailed error info for debugging, but not to the client directly
        res.status(500).json({ error: "Failed to get response from AI. Check server console for details." });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
});