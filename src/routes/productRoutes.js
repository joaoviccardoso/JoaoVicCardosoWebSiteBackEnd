import express from "express";
import {createProduct, getAllProducts,getProductsByCliente,updateProduct,deleteProduct, getProdutiPorId} from "../controllers/productController.js";
import autenticar from "../middleware/authMiddleware.js";
import autorizar from "../middleware/autorizarMiddleware.js";

const router = express.Router();


router.get("/todos",autenticar, getAllProducts);
router.get("/cliente/:clienteId", autenticar, getProductsByCliente);

router.post("/criar",autenticar, autorizar("admin"), createProduct);
router.put("/atualizar/:id", autenticar, autorizar("admin"), updateProduct);
router.delete("/deletar/:id", autenticar, autorizar("admin"), deleteProduct);
router.get("/produtoPorId/:id", autenticar, autorizar("admin"), getProdutiPorId);

export default router;