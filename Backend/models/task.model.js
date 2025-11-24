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
    },
    columnId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Column",
      required: true,
    },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);

export default Task;
