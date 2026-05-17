import CommunityMessage from '../models/CommunityMessage.js';

export const getMessages = async (req, res) => {
  try {
    const messages = await CommunityMessage.find()
      .populate('user', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(100);

    // Return messages in chronological order (oldest first) so chat reads top-to-bottom
    res.status(200).json(messages.reverse());
  } catch (error) {
    console.error("Error fetching community messages:", error);
    res.status(500).json({ message: "Server error fetching messages" });
  }
};

export const postMessage = async (req, res) => {
  try {
    const { text, imageUrl } = req.body;
    
    if ((!text || text.trim().length === 0) && !imageUrl) {
      return res.status(400).json({ message: "Message cannot be completely empty" });
    }

    const newMessage = await CommunityMessage.create({
      user: req.user._id,
      text: text ? text.trim() : "",
      imageUrl: imageUrl || null,
    });

    // Populate user info before returning so the frontend can render it instantly
    await newMessage.populate('user', 'firstName lastName');

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error posting community message:", error);
    res.status(500).json({ message: "Server error posting message" });
  }
};
