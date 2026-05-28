import path from "path";
import fs from "fs";
import productMpModel from "../models/productMpModel.js";

//cria o produto no banco
export async function createProductMp(req, res, next) {
    try {
        const { nomeCompleto, descricaoCurta, motivoDoProjeto } = req.body;

        const tecnologias = req.body.tecnologias
            ? JSON.parse(req.body.tecnologias)  
            : [];

        const funcionalidades = req.body.funcionalidades
            ? JSON.parse(req.body.funcionalidades)  
            : [];

        const imagemPrincipal = req.file 
            ? `/uploads/${req.file.filename}` 
            : null;

        const product = await productMpModel.create({
            nomeCompleto,
            descricaoCurta,
            motivoDoProjeto,
            tecnologias,
            funcionalidades,
            imagemPrincipal,
        });

        res.status(201).json({ message: "Produto cadastrado!", product });
    } catch (error) {
        console.log("ERRO:", error.message);  // ← adiciona
        console.log("STACK:", error.stack);   // ← e isso
        next(error);
    }
}

// Atualizar produto
export async function updateProductMp(req, res, next) {
    try {
        const { id } = req.params;

        const produtoAtual = await productMpModel.findById(id); // ✅ FALTAVA ISSO

        if (!produtoAtual) {
            return res.status(404).json({ message: "Produto não encontrado" });
        }

        const { nomeCompleto, descricaoCurta, motivoDoProjeto } = req.body;

        console.log("BODY:", req.body);
        console.log("FILE:", req.file);

        const tecnologias = req.body.tecnologias
            ? JSON.parse(req.body.tecnologias)
            : [];

        const funcionalidades = req.body.funcionalidades
            ? JSON.parse(req.body.funcionalidades)
            : [];

        let dadosAtualizados = {
            nomeCompleto,
            descricaoCurta,
            motivoDoProjeto,
            tecnologias,
            funcionalidades,
        };

        if (req.file) {
            // 🔥 deleta imagem antiga
            if (produtoAtual.imagemPrincipal) {
                const caminhoImagem = path.join(
                    process.cwd(),
                    produtoAtual.imagemPrincipal.replace("/uploads/", "uploads/")
                );

                fs.unlink(caminhoImagem, (err) => {
                    if (err) {
                        console.warn("Erro ao deletar imagem antiga:", err.message);
                    }
                });
            }

            dadosAtualizados.imagemPrincipal = `/uploads/${req.file.filename}`;
        }

        const updated = await productMpModel.findByIdAndUpdate(
            id,
            dadosAtualizados,
            { new: true }
        );

        res.status(200).json({ message: "Produto atualizado!", updated });

    } catch (error) {
        console.error(error); // 👈 adiciona isso pra debug
        next(error);
    }
}

// Buscar todos os produtos
export async function getAllProductsMp(req, res, next) {
    try {
        const productsMp = await productMpModel.find();
        res.status(200).json(productsMp);
    } catch (error) {
        next(error)
    }
}

//procurar Produto por ID
export async function getProdutoMpPorId(req, res, next){
     try {
            const { id } = req.params
    
            // Valida se o id é um ObjectId válido do MongoDB
            if (!id.match(/^[0-9a-fA-F]{24}$/)) {
                return res.status(400).json({ message: "ID inválido" })
            }
    
           const produto = await productMpModel.findById(id)

    
            if (!produto) {
                return res.status(404).json({ message: "Produto não encontrado" })
            }
    
            res.status(200).json(produto)
    
        } catch (error) {
            next(error)
        }
}

// Deletar produto
export async function deleteProductMp(req, res, next) {
    try {
        const { id } = req.params;
        await productMpModel.findByIdAndDelete(id);
        res.status(200).json({ message: "Produto deletado!" });
    } catch (error) {
        next(error)
    }
}