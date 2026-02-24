import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

export const createConversation = async (req, res) => {
  try {
    const senderId = req.user?._id;
    console.log("🚀 ~ createConversation ~ senderId:", senderId);
    const { receiverId } = req.params;
    console.log("🚀 ~ createConversation ~ receiverId:", receiverId);

    if (!senderId || !receiverId) {
      return res.status(400).json({
        error: {
          senderId: "Sender ID is required",
          receiverId: "Receiver ID is required",
        },
      });
    }

    let conversation = await Conversation.findOneAndUpdate(
      {
        $or: [
          {
            "participants.senderId": senderId,
            "participants.receiverId": receiverId,
          },
          {
            "participants.senderId": receiverId,
            "participants.receiverId": senderId,
          },
        ],
      },
      {
        $setOnInsert: {
          participants: { senderId, receiverId },
          createdAt: Date.now(),
        },
      },
      {
        upsert: true,
        new: true,
      },
    );
    if (!conversation) {
      conversation = await Conversation.create({
        participants: { senderId, receiverId },
      });
    }
    res.status(201).json({
      message: "Conversation created successfully",
      data: conversation,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Conversation creation failed" });
  }
};

export const getUserConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      $or: [
        { "participants.senderId": userId },
        { "participants.receiverId": userId },
      ],
    })
      .sort({ createdAt: -1 })
      .populate("participants.senderId")
      .populate("participants.receiverId");

    if (!conversations || conversations.length === 0) {
      return res
        .status(200)
        .json({ message: "Start new conversation", success: true, data: [] });
    }

    const conversationsWithLastMessage = await Promise.all(
      conversations.map(async (conversation) => {
        const lastMessage = await Message.findOne({
          conversationId: conversation._id,
        })
          .sort({ createdAt: -1 })
          .select("message createdAt");

        return {
          ...conversation.toObject(),
          lastMessage: lastMessage ? lastMessage.message : "No messages",
          lastMessageTime: lastMessage ? lastMessage.createdAt : conversation.createdAt,
        };
      })
    );

    res.status(200).json({ data: conversationsWithLastMessage, success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch conversations" });
  }
};
