import mongoose from "mongoose";

const Schema = mongoose.Schema;

const tokenSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
    unique: true,
  },
  token: { type: String, required: true },
  // Bug corrigido: Date.now sem () — passa a função, não o valor fixo no boot
  createdAt: { type: Date, default: Date.now, expires: 3600 },
});

export default mongoose.model("Token", tokenSchema);