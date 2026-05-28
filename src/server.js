import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import productMpRoutes from "./routes/productMpRoutes.js";
import manipuladorDeErros from "./middleware/manipuladorDeErros.js";
import manipulador404 from "./middleware/manipulador404.js";

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://jvcode.tech",
  "https://www.jvcode.tech"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/produtos", productRoutes);
app.use("/produtosMP", productMpRoutes);
app.use("/uploads", express.static("uploads"));

app.use(manipulador404);
app.use(manipuladorDeErros);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
});