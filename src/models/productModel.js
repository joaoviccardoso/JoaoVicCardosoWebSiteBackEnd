import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    nomeProjeto: { type: String, required: true },
    status: { type: String, default: "negociacao" },
    statusCor: {
        type: String,
        default: function () {
            switch (this.status) {
                // Pré-projeto
                case "negociacao":           return "gray";
                case "orcamento_enviado":    return "purple";
                case "aguardando_sinal":     return "purple";
                case "contrato_assinado":    return "teal";
                // Em execução
                case "planejamento":         return "blue";
                case "criando_o_design":     return "purple";
                case "desenvolvimento":      return "blue";
                case "testes":               return "pink";
                case "revisao_cliente":      return "orange";
                case "ajustes":              return "orange";
                // Entrega
                case "aguardando_deploy":    return "yellow";
                case "concluido":            return "green";
                case "entregue":             return "green";
                // Pós-entrega
                case "manutencao":           return "teal";
                case "garantia":             return "teal";
                // Financeiro
                case "aguardando_pagamento": return "yellow";
                case "pago":                 return "green";
                case "inadimplente":         return "red";
                // Encerrados
                case "pausado":              return "orange";
                case "cancelado":            return "red";
                case "arquivado":            return "gray";
                default:                     return "gray";
            }
        }
    },
    cliente: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    dateEntrega: { type: Date },
    linkContrato: { type: String },
    linkDemo: { type: String },
    obser: { type: String },
}, { timestamps: true });

export default mongoose.model("Product", productSchema);