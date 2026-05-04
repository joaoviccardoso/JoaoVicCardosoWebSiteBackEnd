import express from "express";
import {register, login, getAllUsers, putDadosUser} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/users", getAllUsers);

router.put("/atualizarDados/:id", putDadosUser)

export default router;