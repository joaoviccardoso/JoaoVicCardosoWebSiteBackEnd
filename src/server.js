import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import manipuladorDeErros from "./middleware/manipuladorDeErros.js";
import manipulador404 from "./middleware/manipulador404.js";
const PORT = process.env.PORT || 3000;
dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://jvcode.tech",
  "https://www.jvcode.tech"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(null, false); // melhor que lançar erro
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/produtos", productRoutes);

app.use(manipulador404)
app.use(manipuladorDeErros);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
});