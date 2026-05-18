import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

async function test() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const importantNews = [{"time":"07:30 PM GMT+5:30","currency":"USD","impact":"Medium","event":"Pending Home Sales m/m"}];
    const prompt = `
          You are an expert trading psychology and data correlation AI. 
          The user is a day trader trading XAUUSD (Gold). Here is the important (High/Medium impact) USD news data for the selected date: ${JSON.stringify(importantNews)}
          Based on this news data, analyze the potential impact on XAUUSD. Specifically tell the user whether XAUUSD is likely to go for an up trend or a down trend and briefly explain why.
          Also, provide a single, actionable "Suggested Rule" to mitigate risk during these news events.
          Format your response EXACTLY as a JSON object:
          {
            "insight": "Your prediction (up trend / down trend) and brief explanation...",
            "suggestedRule": "Your suggested rule..."
          }
          Ensure the output is valid JSON, do not wrap it in markdown code blocks.
          `;

    console.log("Generating...");
    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
    });
    
    console.log(result.text);
    console.log(JSON.parse(result.text));
  } catch (error) {
    console.error("ERROR:", error);
  }
}
test();
