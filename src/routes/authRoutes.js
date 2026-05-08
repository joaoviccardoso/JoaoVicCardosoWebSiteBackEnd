import express from "express";
import autenticar from "../middleware/authMiddleware.js";
import {register, login, getAllUsers, putDadosUser, searchUser, getOneUser} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/users", autenticar,getAllUsers);
router.get("/buscar", autenticar, searchUser);
router.put("/atualizarDados/:id",autenticar, putDadosUser)
router.get("/user/:id", autenticar, getOneUser)

export default router;