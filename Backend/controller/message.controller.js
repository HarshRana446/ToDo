import Message from "../models/message.model.js";

export const SendMessageController = async (req, res) => {
  try {
    const conversationId = req.params.id;
    const { message } = req.body;

    console.log(req.user);
    if (!conversationId || !message) {
      return res.status(400).json({
        error: {
          conversationId: "Conversation ID is required",
          message: "Message is required",
        },
      });
    }

    const mes = await Message.create({
      conversationId,
      message,
    });

    res.status(201).json({ message: "Message sent successfully", mes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send message" });
  }
};

export const GetMessageController = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    if (!senderId || !receiverId) {
      return res.status(400).json({
        error: {
          senderId: "Sender ID is required",
          receiverId: "Receiver ID is required",
        },
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};
