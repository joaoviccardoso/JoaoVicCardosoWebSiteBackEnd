import mongoose from "mongoose";

const produtoMpSchema = mongoose.Schema(
    {
        nomeCompleto: {
            type: String,
            required: [true, "Nome completo é obrigatório"],
            trim: true,
        },
        descricaoCurta: {
            type: String,
            required: [true, "Descrição curta é obrigatória"],
            trim: true,
        },
        motivoDoProjeto: {
            type: String,
            required: [true, "Motivo do projeto é obrigatório"],
            trim: true,
        },
        tecnologias: {
            type: [String],
            required: [true, "Tecnologias são obrigatórias"],
        },
        funcionalidades: [
            {
                _id: false,
                titulo: {
                    type: String,
                    required: true,
                    trim: true,
                },
                descricao: {
                    type: String,
                    required: true,
                    trim: true,
                },
            }
        ],
        imagemPrincipal: {
            type: String, // URL ou path do arquivo após upload
            default: null,
        },
        linkProjetoOnline: { type: String },
        linkProjetoGitHub: { type: String },
    },
    {
        timestamps: true, // cria createdAt e updatedAt automaticamente
    }
);

export default mongoose.model("ProdutoMp", produtoMpSchema);