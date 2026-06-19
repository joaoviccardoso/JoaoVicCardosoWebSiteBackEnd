import express from "express";
import autenticar from "../middleware/authMiddleware.js";
import rateLimit from "express-rate-limit"; //
import {register, login, getAllUsers, putDadosUser, searchUser, getOneUser, deleteCliente, verificarToken, redefinirSenha, resetSenha} from "../controllers/authController.js";
import autorizar from "../middleware/autorizarMiddleware.js";

const router = express.Router();

// ---------- Rate Limiters ----------
 
// Login: 5 tentativas a cada 15 minutos por IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: "Muitas tentativas de login. Tente novamente em 15 minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});
 
// Cadastro: 5 por hora por IP
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { message: "Limite de cadastros atingido. Tente novamente em 1 hora." },
  standardHeaders: true,
  legacyHeaders: false,
});
 
// Solicitar redefinição de senha (dispara e-mail) — evita flood de e-mails/enumeração
const requestPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { message: "Muitas solicitações de redefinição de senha. Tente novamente em 15 minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});
 
// Confirmar redefinição (usar o token) — evita brute-force do token
const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Muitas tentativas de redefinição. Tente novamente em 15 minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});
 
// Verificação de e-mail (usar o token) — evita brute-force do token
const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Muitas tentativas de verificação. Tente novamente em 15 minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});
 
router.post("/register", registerLimiter ,register);
router.post("/login", loginLimiter ,login);
router.get("/:id/verify/:token", verificarToken)
router.post("/requestPassword", requestPasswordLimiter, redefinirSenha)
router.post("/resetPassword/:token", resetPasswordLimiter,resetSenha)

router.put("/atualizarDados/:id",autenticar, putDadosUser)
router.get("/users", autenticar, autorizar("admin"), getAllUsers);
router.get("/buscar", autenticar, autorizar("admin"), searchUser);
router.get("/user/:id", autenticar,autorizar("admin"), getOneUser)
router.delete("/delete/:id",autenticar, autorizar("admin"), deleteCliente)

export default router;