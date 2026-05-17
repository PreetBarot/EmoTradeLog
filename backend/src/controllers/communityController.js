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

export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await CommunityMessage.findById(id);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Ensure the logged-in user owns this message
    if (message.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own messages" });
    }

    await message.deleteOne();
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting community message:", error);
    res.status(500).json({ message: "Server error deleting message" });
  }
};
