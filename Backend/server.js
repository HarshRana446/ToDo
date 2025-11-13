import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import http from "http";

dotenv.config();

const app = express();

app.use(cors());
app.use(
  express.json({
    limit: "50mb",
  })
);

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
