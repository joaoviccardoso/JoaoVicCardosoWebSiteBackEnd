import express from "express";
import autenticar from "../middleware/authMiddleware.js";
import autorizar from "../middleware/autorizarMiddleware.js";
import { upload } from "../middleware/upload.js";
import { createProductMp, getAllProductsMp } from "../controllers/productMpController.js";

const router = express.Router();

router.get("/todos",autenticar,autorizar("admin"), getAllProductsMp);
router.post("/criar", autenticar, autorizar("admin"), upload.single("imagemPrincipal"), createProductMp)

export default router;