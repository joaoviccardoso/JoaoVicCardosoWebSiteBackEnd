import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
console.log(process.env.MONGO_URI);
connectDB();

app.listen(3000, () => {
  console.log("Servidor rodando");
});