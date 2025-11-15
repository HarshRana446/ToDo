import Task from "../models/task.model.js";

export const createTask = async (req, res) => {
  try {
    const payload = {
      title: req.body.title,
      description: req.body.description,
      userId: req.user.userId,
      dueDate: req.body.dueDate,
      status: req.body.status || "pending",
    };
    const task = await Task.create(payload);
    res.status(201).json({ task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.userId }).sort({
      createdAt: -1,
    });
    res.status(200).json({ tasks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
