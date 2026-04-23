import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    nomeCompleto: String,
    email: { type: String, unique: true },
    senha: String,
    telefone: String,
    endereco: String,
    cep: String,
    numeroCasa: String
},{ timestamps: true })

export default mongoose.model("User", userSchema);