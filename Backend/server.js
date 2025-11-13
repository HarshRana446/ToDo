import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import http from "http";
import connectDB from "./DB/db.js";
import authroutes from "./routes/auth.routes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(
  express.json({
    limit: "50mb",
  })
);
app.use("/auth", authroutes);

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
