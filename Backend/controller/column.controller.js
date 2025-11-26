import Column from "../models/column.model.js";

export const createColumn = async (req, res) => {
  try {
    const existing = await Column.findOne({
      userId: req.body.userId,
      title: { $regex: new RegExp(`^${title}$`, "i") },
    });
    if (existing) {
      return res.status(409).json({ message: "Column already exists" });
    }
    const column = await Column.create({
      userId: req.user.userId,
      title,
    });
    res.status(201).json({ message: "Column created successfully", column });
  } catch (error) {
    res.status(500).json({ message: "Column creation failed beacause Column already exists", error });
  }
};

export const getColumns = async (req, res) => {
  try {
    const columns = await Column.find({ userId: req.user.userId });
    res.status(200).json({ columns });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
