import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    nomeProjeto: { type: String, required: true },
    status: { 
        type: String, 
        enum: ["Em andamento", "Concluído", "Pausado", "Cancelado"],
        default: "Em andamento"
    },
    cliente: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    dateEntrega: { type: Date },
    linkContrato: { type: String },
    linkDemo: { type: String },
    obser: { type: String },
}, { timestamps: true });

export default mongoose.model("Product", productSchema);