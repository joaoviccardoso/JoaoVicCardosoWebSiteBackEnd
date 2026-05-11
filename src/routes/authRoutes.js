import express from "express";
import autenticar from "../middleware/authMiddleware.js";
import rateLimit from "express-rate-limit"; //
import {register, login, getAllUsers, putDadosUser, searchUser, getOneUser} from "../controllers/authController.js";

const router = express.Router();

// Limiter para login: 10 tentativas a cada 15 minutos por IP
const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // janela de 1 minutos
  max: 5,                   // máximo de 5 requisições nessa janela
  message: {
    message: "Muitas tentativas de login. Tente novamente em 15 minutos."
  },
  standardHeaders: true,  // envia headers RateLimit-* na resposta
  legacyHeaders: false,
});

// Limiter para cadastro: mais permissivo, 5 por hora
const registerLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: {
    message: "Limite de cadastros atingido. Tente novamente em 1 minuto."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", registerLimiter ,register);
router.post("/login", loginLimiter ,login);

router.get("/users", autenticar,getAllUsers);
router.get("/buscar", autenticar, searchUser);
router.put("/atualizarDados/:id",autenticar, putDadosUser)
router.get("/user/:id", autenticar, getOneUser)

export default router;