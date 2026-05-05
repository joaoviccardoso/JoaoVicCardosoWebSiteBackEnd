import Product from "../models/productModel.js";

// Criar produto
export async function createProduct(req, res) {
    try {
        const { nomeProjeto, status, cliente, dateEntrega, linkContrato, linkDemo, obser } = req.body;

        const product = await Product.create({
            nomeProjeto,
            status,
            cliente,      // ID do usuário/cliente
            dateEntrega,
            linkContrato,
            linkDemo,
            obser
        });

        res.status(201).json({ message: "Produto cadastrado!", product });
    } catch (error) {
        res.status(500).json({ message: "Erro ao cadastrar produto", error: error.message });
    }
}

// Buscar todos os produtos (com dados do cliente)
export async function getAllProducts(req, res) {
    try {
        const products = await Product.find().populate("cliente", "nomeCompleto email telefone");
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar produtos", error: error.message });
    }
}

// Buscar produtos de um cliente específico
export async function getProductsByCliente(req, res) {
    try {
        const { clienteId } = req.params;
        const products = await Product.find({ cliente: clienteId });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar produtos", error: error.message });
    }
}

// Atualizar produto
export async function updateProduct(req, res) {
    try {
        const { id } = req.params;
        const updated = await Product.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json({ message: "Produto atualizado!", updated });
    } catch (error) {
        res.status(500).json({ message: "Erro ao atualizar", error: error.message });
    }
}

// Deletar produto
export async function deleteProduct(req, res) {
    try {
        const { id } = req.params;
        await Product.findByIdAndDelete(id);
        res.status(200).json({ message: "Produto deletado!" });
    } catch (error) {
        res.status(500).json({ message: "Erro ao deletar", error: error.message });
    }
}