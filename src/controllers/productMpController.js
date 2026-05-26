import productMpModel from "../models/productMpModel.js";

export async function createProductMp(req, res, next) {
    try {
        console.log("body:", req.body); // ← deixa por enquanto pra confirmar
        console.log("file:", req.file);

        const { nomeCompleto, descricaoCurta, motivoDoProjeto } = req.body;

        const tecnologias = req.body.tecnologias
            ? JSON.parse(req.body.tecnologias)  
            : [];

        const funcionalidades = req.body.funcionalidades
            ? JSON.parse(req.body.funcionalidades)  
            : [];

        const imagemPrincipal = req.file ? req.file.path : null;

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