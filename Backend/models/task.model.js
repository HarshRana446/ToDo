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
    },
    description: {
      type: String,
      required: true,
      default: "",
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
      type: mongoose.Schema.Types.ObjectId,
      ref: "Column",
      unique: true,
      required: true,
      default: ["pending", "in-progress", "done"],
    },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);

export default Task;
