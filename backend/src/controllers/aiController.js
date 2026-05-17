import axios from 'axios';
import { GoogleGenAI } from '@google/genai';
import Trade from '../models/Trade.js';

export const getNewsCorrelation = async (req, res) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Fetch this week's news from ForexFactory JSON API
    const response = await axios.get('https://nfs.faireconomy.media/ff_calendar_thisweek.json');
    const newsData = response.data;
    
    // Filter for today's high-impact USD news
    const todayStr = new Date().toISOString().split('T')[0];
    const todayNews = newsData.filter(item => {
      const itemDateStr = item.date.split('T')[0];
      return itemDateStr === todayStr && item.impact === 'High' && item.country === 'USD';
    });
    
    // If no high-impact USD news today, find the next upcoming one
    let upcomingNews = todayNews;
    if (upcomingNews.length === 0) {
       upcomingNews = newsData.filter(item => item.impact === 'High' && item.country === 'USD').slice(0, 1);
    }
    
    // If no Gemini Key, return mock data along with real news
    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        upcomingNews,
        insight: "Historical data shows your win rate drops by 35% when trading within 15 minutes of USD High Impact news. You often exhibit signs of 'FOMO' during these volatile spikes.",
        suggestedRule: "Close all active intraday USD positions 5 minutes before the news release."
      });
    }

    // Pass the news to Gemini for insight
    const prompt = `
    You are an expert trading psychology and data correlation AI. 
    The user is a day trader. Here is the upcoming high-impact USD news data: ${JSON.stringify(upcomingNews)}
    Provide a brief correlation insight (maximum 3 sentences) predicting how the user's emotions (like FOMO or anxiety) and win rate might be affected by this specific news release based on typical retail trader behavior.
    Also, provide a single, actionable "Suggested Rule" to mitigate risk during this news.
    Format your response EXACTLY as a JSON object:
    {
      "insight": "Your brief insight...",
      "suggestedRule": "Your suggested rule..."
    }
    Ensure the output is valid JSON, do not wrap it in markdown code blocks.
    `;

    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    let textResult = result.text;
    // Strip markdown formatting if any
    textResult = textResult.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const parsedResult = JSON.parse(textResult);

    res.status(200).json({
      upcomingNews,
      insight: parsedResult.insight,
      suggestedRule: parsedResult.suggestedRule
    });

  } catch (error) {
    console.error("Error in getNewsCorrelation:", error);
    res.status(500).json({ message: "Failed to generate news correlation insight." });
  }
};

export const getWeeklyReport = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get trades from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const trades = await Trade.find({
      user: userId,
      date: { $gte: sevenDaysAgo }
    });

    if (trades.length === 0) {
       return res.status(200).json({
          grade: "N/A",
          executiveSummary: "You did not take any trades this week. Taking a break is sometimes the best position.",
          keyHighlights: ["No trades logged.", "Capital preserved."]
       });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({
        grade: "B+",
        executiveSummary: `You logged ${trades.length} trades this week. This is a mock AI summary because the GEMINI_API_KEY is not configured.`,
        keyHighlights: ["Good discipline", "Keep following your plan"]
      });
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Prepare trade data summary to send to AI (avoiding sending too much raw data)
    const summaryData = trades.map(t => ({
      symbol: t.symbol,
      type: t.type,
      pnl: t.pnl,
      isWinner: t.isWinner,
      emotion: t.emotion,
      rating: t.rating,
      checklistCount: t.checklist ? t.checklist.length : 0
    }));

    const prompt = `
    You are an expert trading coach AI. Review this retail trader's trades from the past 7 days:
    ${JSON.stringify(summaryData)}
    
    Analyze their performance, emotional stability (based on emotion and rating), and discipline (checklist count).
    Generate a Weekly AI Report. 
    Format your response EXACTLY as a JSON object:
    {
      "grade": "A single letter grade (A+, A, B, C, D, F) based on their performance and discipline.",
      "executiveSummary": "A 2-3 sentence summary of their week focusing on psychology and execution.",
      "keyHighlights": ["Highlight 1", "Highlight 2", "Highlight 3"]
    }
    Ensure the output is valid JSON, do not wrap it in markdown code blocks.
    `;

    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    let textResult = result.text;
    textResult = textResult.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const parsedResult = JSON.parse(textResult);
    
    res.status(200).json(parsedResult);

  } catch (error) {
    console.error("Error in getWeeklyReport:", error);
    res.status(500).json({ message: "Failed to generate weekly report." });
  }
};
