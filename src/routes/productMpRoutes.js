import express from "express";
import autenticar from "../middleware/authMiddleware.js";
import autorizar from "../middleware/autorizarMiddleware.js";
import { upload } from "../middleware/upload.js";
import { createProductMp, getAllProductsMp, getProdutoMpPorId, updateProductMp } from "../controllers/productMpController.js";

const router = express.Router();

router.get("/todos",autenticar,autorizar("admin"), getAllProductsMp);
router.post("/criar", autenticar, autorizar("admin"), upload.single("imagemPrincipal"), createProductMp)
router.put("/atualizar/:id", autenticar, autorizar("admin"), upload.single("imagemPrincipal"), updateProductMp);
router.get("/produtoMpPorId/:id", autenticar, autorizar("admin"), getProdutoMpPorId);

export default router;