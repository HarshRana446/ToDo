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
      order: 1,
    });
    res.status(200).json({ tasks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { status },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateTask = async (req, res) => {
  try {
    const payload = {
      title: req.body.title,
      description: req.body.description,
      dueDate: req.body.dueDate,
      status: req.body.status,
    };

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      payload,
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const deleted = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const reorderTasks = async (req, res) => {
  try {
    const { tasks } = req.body;

    const updates = tasks.map((t) => {
      return Task.findOneAndUpdate(
        { _id: t._id, userId: req.user.userId },
        { order: t.order },
        { new: true }
      );
    });

    await Promise.all(updates);

    return res.status(200).json({ message: "Tasks reordered successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
