import express from "express";
import autenticar from "../middleware/authMiddleware.js";
import autorizar from "../middleware/autorizarMiddleware.js";
import { upload } from "../middleware/upload.js";
import { createProductMp, deleteProductMp, getAllProductsMp, getProdutoMpPorId, updateProductMp } from "../controllers/productMpController.js";

const router = express.Router();

router.get("/todos", getAllProductsMp);
router.get("/produtoMpPorId/:id", getProdutoMpPorId);

router.post("/criar", autenticar, autorizar("admin"), upload.single("imagemPrincipal"), createProductMp)
router.put("/atualizar/:id", autenticar, autorizar("admin"), upload.single("imagemPrincipal"), updateProductMp);
router.delete("/deletar/:id", autenticar, autorizar("admin"), deleteProductMp);


export default router;