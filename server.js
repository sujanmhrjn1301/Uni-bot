const express = require("express");
const OpenAI = require("openai");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
require("dotenv").config();
const path = require("path");

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Use environment variable for API key
});

// Read file content
const schoolInfo = fs.readFileSync("school-info.txt", "utf8");

// Initialize conversation history with system message
let conversationHistory = [
  {
    role: "system",
    content: `You are a helpful assistant that provides information about the Presidential Graduate School (PGS). Always answer in brief. Here is some information: ${schoolInfo}.If a response is too long, please summarize it or direct the user to a link for more details.`,
  },
];

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  // Add user message to conversation history
  conversationHistory.push({ role: "user", content: userMessage });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: conversationHistory,
      max_tokens: 100,
      temperature: 0.5,
    });

    const botMessage = completion.choices[0].message.content;

    // Add bot message to conversation history
    conversationHistory.push({ role: "assistant", content: botMessage });

    res.json({ message: botMessage });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "An error occurred" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
