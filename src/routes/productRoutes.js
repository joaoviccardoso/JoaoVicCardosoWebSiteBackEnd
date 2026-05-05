import express from "express";
import {createProduct, getAllProducts,getProductsByCliente,updateProduct,deleteProduct} from "../controllers/productController.js";

const router = express.Router();

router.post("/criar", createProduct);
router.get("/todos", getAllProducts);
router.get("/cliente/:clienteId", getProductsByCliente);
router.put("/atualizar/:id", updateProduct);
router.delete("/deletar/:id", deleteProduct);

export default router;