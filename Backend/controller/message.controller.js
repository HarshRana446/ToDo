import Message from "../models/message.model.js";

export const SendMessageController = async (req, res) => {
  try {
    const userId = req.user._id;
    const conversationId = req.params.id;
    const { message } = req.body;

    if (!conversationId) {
      return res.status(400).json({ message: "Conversation ID is required" });
    }

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const mes = await Message.create({
      conversationId,
      message,
      sender: userId,
    });

    res
      .status(201)
      .json({ message: "Message sent successfully", data: mes, success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send message" });
  }
};

export const GetMessageController = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversationId });
    res.status(200).json({ data: messages, success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

export const MarkAsReadController = async (req, res) => {
  try {
    const userId = req.user._id;
    const conversationId = req.params.id;

    await Message.updateMany(
      { conversationId, sender: { $ne: userId } },
      { seen: true },
    );
    res.status(200).json({ message: "Message marked as read", success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to mark message as read", error });
  }
};

export const EditMessageController = async (req, res) => {
  try {
  
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to edit message" });
  }
};
