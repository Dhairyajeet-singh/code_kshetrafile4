import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import PDFDocument from 'pdfkit';
import fs from 'fs';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Configuration from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_ENDPOINT = process.env.GEMINI_ENDPOINT || "https://api.gemini.com/v1/complete";


// Global data store for research history
let Data = [];

// Gemini API call helper function
async function geminiGenerate(prompt, generationConfig) {
  const payload = {
    model_name: "gemini-pro",
    prompt,
    generation_config: generationConfig,
  };

  try {
    const response = await axios.post(GEMINI_ENDPOINT, payload, {
      headers: {
        Authorization: Bearer ${GEMINI_API_KEY},
        "Content-Type": "application/json",
      },
    });
    return response.data; // Expected to have a "text" field
  } catch (error) {
    console.error("Error calling Gemini API:", error.message);
    throw error;
  }
}

// Endpoint to generate a company profile
app.get('/profile', async (req, res) => {
  const { company } = req.query;
  if (!company) {
    return res.status(400).json({ error: "Company parameter is required." });
  }
  const generationConfig = {
    temperature: 0.7,
    max_output_tokens: 300,
    top_p: 0.9,
  };
  const prompt = Generate a realistic ${company} profile including name, industry, revenue, employees, headquarters, founder, and website.;
  try {
    const result = await geminiGenerate(prompt, generationConfig);
    Data.push(result.text);
    res.json({ profile: result.text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to generate research content based on a custom prompt
app.post('/research', async (req, res) => {
  const { prompt, company } = req.body;
  if (!prompt || !company) {
    return res.status(400).json({ error: "Prompt and company are required." });
  }
  const generationConfig = {
    temperature: 0.7,
    top_p: 0.9,
  };
  try {
    const result = await geminiGenerate(prompt, generationConfig);
    Data.push(result.text);
    res.json({ research: result.text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to return a random prompt suggestion
app.get('/prompt-suggest', (req, res) => {
  const { company } = req.query;
  if (!company) {
    return res.status(400).json({ error: "Company parameter is required." });
  }
  const prompt_data = {
    1: Provide a detailed financial overview of ${company} for the last 5 years, including revenue, profit, and growth trends.,
    2: Compare the financial health of ${company}.,
    3: What are the key revenue sources for ${company}, and how have they evolved?,
    4: What is the business model of ${company}, and what are its key strengths and weaknesses?,
    5: How does ${company} position itself against competitors in its sector?,
    6: Analyze the brand reputation of ${company} based on news sentiment and social media trends.,
    7: What are the biggest risks and controversies surrounding ${company}?,
    8: How have customer reviews impacted the perception of ${company}'s products?,
    9: Based on industry trends, how will ${company} perform in the next 3-5 years?,
    10: How will new regulations impact ${company} and its competitors?,
    11: What patents and innovations has ${company} introduced in the past 5 years?,
    12: What are the top hiring trends and employee sentiment for ${company}?,
    13: What partnerships and acquisitions have shaped ${company}'s growth?,
  };
  const randInt = Math.floor(Math.random() * 13) + 1;
  res.json({ suggestion: prompt_data[randInt] });
});

// Endpoint to generate a PDF report from research history
app.get('/generate-pdf', (req, res) => {
  if (Data.length === 0) {
    return res.status(400).json({ error: "No research data available." });
  }
  const doc = new PDFDocument();
  const filePath = "search_report.pdf";
  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);

  doc.font("Helvetica-Bold").fontSize(16).text("Search Report", { align: "center" });
  doc.moveDown();

  Data.forEach((entry, i) => {
    doc.font("Helvetica").fontSize(12).text(${i + 1}. Search Query:, { align: "left" });
    doc.fontSize(12).text(entry, { align: "left" });
    doc.moveDown();
    doc.text("-".repeat(50));
    doc.moveDown();
  });

  doc.end();

  writeStream.on("finish", () => {
    res.download(filePath, "search_report.pdf", (err) => {
      if (err) console.error("Error sending PDF:", err.message);
    });
  });
});

// Start the backend server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});