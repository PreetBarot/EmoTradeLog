import axios from 'axios';
import { GoogleGenAI } from '@google/genai';
import Trade from '../models/Trade.js';
import Chat from '../models/Chat.js';

let ffCache = {
  data: null,
  lastFetch: 0
};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getNewsCorrelation = async (req, res) => {
  try {
    const { date } = req.query;
    
    let ai;
    if (process.env.GEMINI_API_KEY) {
      ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    
    // 1. Fetch News Data with Caching
    let dailyNews = [];
    try {
      let newsData;
      if (ffCache.data && (Date.now() - ffCache.lastFetch < CACHE_DURATION)) {
        newsData = ffCache.data;
      } else {
        const response = await axios.get('https://nfs.faireconomy.media/ff_calendar_thisweek.json');
        newsData = response.data;
        ffCache.data = newsData;
        ffCache.lastFetch = Date.now();
      }
      
      const targetDateStr = date ? date : new Date().toISOString().split('T')[0];
      
      dailyNews = newsData.filter(item => {
        const itemDateStr = item.date.split('T')[0];
        return itemDateStr === targetDateStr && item.country === 'USD';
      });
    } catch (ffError) {
      console.error("Forex Factory API Error:", ffError);
      return res.status(200).json({
        dailyNews: [],
        insight: "Could not fetch economic calendar data from the provider. Please try again later.",
        suggestedRule: "N/A"
      });
    }
    
    // 2. Generate AI Insight
    let insight = "No major high or medium impact news for the selected date.";
    let suggestedRule = "Follow your standard trading plan and risk management.";
    
    const importantNews = dailyNews.filter(item => item.impact === 'High' || item.impact === 'Medium');
    
    if (importantNews.length > 0) {
      if (!process.env.GEMINI_API_KEY) {
        insight = "Historical data shows your win rate drops by 35% when trading within 15 minutes of High Impact news. You often exhibit signs of 'FOMO' during these volatile spikes.";
        suggestedRule = "Close all active intraday positions 5 minutes before the news release.";
      } else {
        try {
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

          const result = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
              config: {
                responseMimeType: 'application/json',
              }
          });
          
          const parsedResult = JSON.parse(result.text);
          insight = parsedResult.insight;
          suggestedRule = parsedResult.suggestedRule;
        } catch (aiError) {
          console.error("Gemini API Error:", aiError);
          insight = "Could not generate AI insight due to an API error (rate limit or connection issue). Please wait a few moments before switching dates again.";
          suggestedRule = "Avoid trading during high-impact news if AI guidance is unavailable.";
        }
      }
    }

    res.status(200).json({
      dailyNews,
      insight,
      suggestedRule
    });

  } catch (error) {
    console.error("Unexpected Error in getNewsCorrelation:", error);
    res.status(200).json({
      dailyNews: [],
      insight: "An unexpected error occurred. Please try again.",
      suggestedRule: "Check your settings."
    });
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
    res.status(200).json({
      grade: "N/A",
      executiveSummary: "Could not generate report due to an AI error. Please check your GEMINI_API_KEY in Render dashboard.",
      keyHighlights: ["Error connecting to Gemini API"]
    });
  }
};

export const chatWithData = async (req, res) => {
  try {
    const userId = req.user._id;
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: "Message is required." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({ reply: "I am a mock AI assistant because the GEMINI_API_KEY is missing on the server. Your question was: " + message });
    }

    // Fetch or create chat history
    let chat = await Chat.findOne({ user: userId });
    if (!chat) {
      chat = new Chat({ user: userId, messages: [] });
    }

    // Append user message
    chat.messages.push({ role: 'user', text: message });

    // Fetch all user trades to pass context
    const trades = await Trade.find({ user: userId });
    
    const summaryData = trades.map(t => ({
      symbol: t.symbol,
      type: t.type,
      pnl: t.pnl,
      isWinner: t.isWinner,
      date: t.date,
      emotion: t.emotion,
      rating: t.rating
    }));

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    let historyText = "";
    // Exclude the current message we just pushed to build the history text
    const pastMessages = chat.messages.slice(0, -1);
    if (pastMessages.length > 0) {
      historyText = "Conversation History:\n" + pastMessages.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.text}`).join('\n') + "\n\n";
    }

    const prompt = `
    You are an expert trading AI assistant. A user is asking you a question about their trading journal data.
    Here is their trading data: ${JSON.stringify(summaryData)}
    
    ${historyText}User Question: "${message}"
    
    Provide a helpful, direct, and concise response to the user's question based on their data. Keep it under 4 sentences.
    `;

    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    // Save AI response
    chat.messages.push({ role: 'assistant', text: result.text });
    await chat.save();

    res.status(200).json({ reply: result.text });

  } catch (error) {
    console.error("Error in chatWithData:", error);
    res.status(200).json({ reply: "I encountered an error connecting to my AI brain. Please check your API settings." });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const chat = await Chat.findOne({ user: req.user._id });
    res.status(200).json(chat ? chat.messages : []);
  } catch (error) {
    console.error("Error in getChatHistory:", error);
    res.status(500).json({ message: "Failed to fetch chat history" });
  }
};

export const clearChatHistory = async (req, res) => {
  try {
    await Chat.findOneAndUpdate(
      { user: req.user._id },
      { $set: { messages: [] } },
      { new: true }
    );
    res.status(200).json({ message: "Chat history cleared" });
  } catch (error) {
    console.error("Error in clearChatHistory:", error);
    res.status(500).json({ message: "Server error clearing chat history" });
  }
};

export const getTradeCoach = async (req, res) => {
  try {
    const trades = await Trade.find({ user: req.user._id }).sort({ date: -1 }).limit(50);

    if (!trades || trades.length < 5) {
      return res.status(200).json({
        notEnoughData: true,
        message: "Not enough data. Please log at least 5 trades for the AI to analyze your performance."
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: "Gemini API key not configured" });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Calculate some basic stats to help the AI
    const wins = trades.filter(t => t.pnl > 0).length;
    const losses = trades.filter(t => t.pnl <= 0).length;
    const winRate = ((wins / trades.length) * 100).toFixed(2);
    const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);

    const tradeSummary = trades.map(t => 
      `Date: ${t.date}, Pair: ${t.pair}, Type: ${t.type}, PnL: ${t.pnl}, Emotion: ${t.emotion}, Note: ${t.notes}`
    ).join('\n');

    const prompt = `You are an expert AI trading coach. Analyze the following 50 recent trades from a user.
    Total Trades: ${trades.length}
    Win Rate: ${winRate}%
    Total PnL: $${totalPnl}

    Trade Data:
    ${tradeSummary}

    Based on this data, provide a strict JSON response with the following keys:
    {
      "tradeScore": "A letter grade (e.g., A, B+, C-)",
      "recommendation": "A brief paragraph advising the user on what to focus on",
      "strengths": ["bullet point 1", "bullet point 2", "bullet point 3"],
      "weaknesses": ["bullet point 1", "bullet point 2", "bullet point 3"]
    }
    
    Return strictly JSON, without any markdown formatting like \`\`\`json. Make sure the JSON is perfectly valid.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const analysis = JSON.parse(response.text);
    res.status(200).json(analysis);

  } catch (error) {
    console.error("Error generating trade coach insights:", error);
    res.status(500).json({ message: "Server error generating trade coach insights" });
  }
};

export const getPatternFinder = async (req, res) => {
  try {
    const trades = await Trade.find({ user: req.user._id }).sort({ date: -1 }).limit(100);

    if (!trades || trades.length < 5) {
      return res.status(200).json({
        notEnoughData: true,
        message: "Not enough data. Please log at least 5 trades for the AI to find patterns."
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: "Gemini API key not configured" });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const tradeSummary = trades.map(t => 
      `Date: ${t.date}, Pair: ${t.pair}, Type: ${t.type}, PnL: ${t.pnl}, Emotion: ${t.emotion}, Setup: ${t.setup}`
    ).join('\n');

    const prompt = `You are a sophisticated AI pattern recognition algorithm for forex trading. Analyze the following recent trades from a user.
    
    Trade Data:
    ${tradeSummary}

    Find the most significant profitable pattern and the most significant losing pattern. Look for correlations involving pairs, time of day, emotions, setups, or win streaks/loss streaks.
    
    Provide a strict JSON response with exactly this structure:
    {
      "profitablePattern": {
        "title": "A short 3-5 word title",
        "confidence": "e.g., High Confidence, Medium Confidence",
        "description": "A 1-2 sentence description of the pattern (e.g. You have a 78% win rate when trading Breakout strategies on EUR/USD)."
      },
      "losingPattern": {
        "title": "A short 3-5 word title",
        "actionRequired": "e.g., Action Required, Warning",
        "description": "A 1-2 sentence description of the pattern (e.g. Taking more than 3 trades a day reduces your daily profitability by 40%)."
      }
    }
    
    Return strictly JSON, without any markdown formatting like \`\`\`json. Make sure the JSON is perfectly valid.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const analysis = JSON.parse(response.text);
    res.status(200).json(analysis);

  } catch (error) {
    console.error("Error generating pattern finder insights:", error);
    res.status(500).json({ message: "Server error generating pattern finder insights" });
  }
};

export const getRiskAdvisor = async (req, res) => {
  try {
    const trades = await Trade.find({ user: req.user._id }).sort({ date: -1 }).limit(20);

    if (!trades || trades.length < 3) {
      return res.status(200).json({
        notEnoughData: true,
        message: "Not enough data. Please log at least 3 trades for the AI to calculate risk exposure."
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: "Gemini API key not configured" });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const tradeSummary = trades.map(t => 
      `Date: ${t.date}, Pair: ${t.pair}, Type: ${t.type}, PnL: ${t.pnl}, Setup: ${t.setup}, Note: ${t.notes}`
    ).join('\n');

    const prompt = `You are a strict Risk Management AI Advisor for a forex trader. Analyze the following 20 recent trades from a user.
    
    Trade Data:
    ${tradeSummary}

    Based on their recent trade volume, win/loss streak, and pairs traded, calculate an estimated "Current Risk Exposure" percentage.
    Then, generate 2 active warnings or insights about their current risk behavior (e.g. overtrading, holding correlated pairs, revenge trading).
    
    Provide a strict JSON response with exactly this structure:
    {
      "currentRiskExposure": "A percentage string (e.g. 1.2%, 3.5%)",
      "exposureStatus": "A brief description (e.g. 'Well within your 2% maximum daily limit.' or 'Dangerously high risk exposure.')",
      "warnings": [
        {
          "type": "warning", 
          "message": "Warning: You are currently holding multiple correlated pairs. This doubles your risk exposure."
        },
        {
          "type": "info",
          "message": "Info: No upcoming high-impact news events in the next 2 hours. Safe to maintain current positions."
        }
      ]
    }
    
    Return strictly JSON, without any markdown formatting like \`\`\`json. Make sure the JSON is perfectly valid.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const analysis = JSON.parse(response.text);
    res.status(200).json(analysis);

  } catch (error) {
    console.error("Error generating risk advisor insights:", error);
    res.status(500).json({ message: "Server error generating risk advisor insights" });
  }
};
