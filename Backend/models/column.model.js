import mongoose from "mongoose";

const columnSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    id: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Column = mongoose.model("Column", columnSchema);

export default Column;
