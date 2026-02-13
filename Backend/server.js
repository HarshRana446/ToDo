import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import http from "http";
import connectDB from "./db/db.js";
import authroutes from "./routes/auth.routes.js";
import userroutes from "./routes/user.routes.js";
import taskroutes from "./routes/task.routes.js";
import columnroutes from "./routes/column.routes.js";
import { Server } from "socket.io";

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

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("New client connected: " + socket.id);

  socket.on("join", (data) => {
    socket.join(data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected: " + socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
