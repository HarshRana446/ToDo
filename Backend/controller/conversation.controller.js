import Conversation from "../models/conversation.model.js";

export const createConversation = async (req, res) => {
  try {
    const senderId = req.user?._id 
    console.log("🚀 ~ createConversation ~ senderId:", senderId);
    const { receiverId } = req.params;
    console.log("🚀 ~ createConversation ~ receiverId:", receiverId)

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
        $in: [
          {
            "participants.senderId": {
              senderId,
              receiverId,
            },
          },
          {
            "participants.receiverId": {
              receiverId,
              senderId,
            },
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
    res
      .status(201)
      .json({ message: "Conversation created successfully", conversation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Conversation creation failed" });
  }
};

export const getUserConversations = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }
    const conversations = await Conversation.find({
      $or: [
        { "participants.senderId": userId },
        { "participants.receiverId": userId },
      ],
    })
      .sort({ createdAt: -1 })
      .populate("participants.senderId")
      .populate("participants.receiverId");

    console.log("🚀 ~ getUserConversations ~ conversations:", conversations);

    if (!conversations || conversations.length === 0) {
      return res.status(404).json({ message: "No conversations found" });
    }
    res.status(200).json({ conversations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch conversations" });
  }
};
