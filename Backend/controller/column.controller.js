import Column from "../models/column.model.js";

export const createColumn = async (req, res) => {
  try {
    const column = await Column.create({
      userId: req.user.userId,
      id: req.body.id,
      title: req.body.title,
    });
    res.status(201).json({ message: "Column created successfully", column });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const getColumns = async (req, res) => {
  try {
    const columns = await Column.find({ userId: req.user.userId }).sort({
      createdAt: 1,
    });
    res.status(200).json({ columns });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

