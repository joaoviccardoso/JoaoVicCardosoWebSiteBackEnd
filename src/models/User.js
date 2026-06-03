import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    nomeCompleto: String,
    email: { type: String, unique: true },
    role: { type: String, default: "user" },
    senha: String,
    telefone: String,
    cpf: Number,
    endereco: String,
    cep: String,
    numeroCasa: String,
    verified: {type: Boolean, default: false}
},{ timestamps: true })

export default mongoose.model("User", userSchema);