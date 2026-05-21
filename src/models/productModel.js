import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    nomeProjeto: { type: String, required: true },
    status: {type: String, default: "Em andamento"},
    statusCor: {type: String,
        default: function(){
            switch (this.status) {
                case "desenvolvimento":
                    return "blue";
                case "testes":
                    return "pink";
                case "criando_o_design":
                    return "purple";
                case "concluido":
                    return "green";
                case "pausado":
                    return "orange";
                default:
                    return "gray";
            }
        }},
    cliente: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    dateEntrega: { type: Date },
    linkContrato: { type: String },
    linkDemo: { type: String },
    obser: { type: String },
}, { timestamps: true });

export default mongoose.model("Product", productSchema);