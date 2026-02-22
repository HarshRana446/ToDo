import mongoose from "mongoose";

const ParticipantSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const conversationSchema = new mongoose.Schema(
  {
<<<<<<< Updated upstream
    participants: {
      type: ParticipantSchema,
=======
    participants: 
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,a
      },

    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
>>>>>>> Stashed changes
    },
  },
  {
    timestamps: true,
  },
);

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
