import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import http from "http";
import connectDB from "./DB/db.js";
import authroutes from "./routes/auth.routes.js";
import userroutes from "./routes/user.routes.js";
import taskroutes from "./routes/task.routes.js";
import columnroutes from "./routes/column.routes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/auth", authroutes);
app.use("/user", userroutes);
app.use("/tasks", taskroutes);
app.use("/columns", columnroutes);

const PORT = process.env.PORT;
const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

