import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      required: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    columnId: {
      type: String,
      required: true,
      default: "pending",
    },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);

export default Task;
