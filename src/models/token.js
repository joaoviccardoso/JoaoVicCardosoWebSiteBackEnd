import mongoose from "mongoose";

const Schema = mongoose.Schema;

const tokenSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  token: { type: String, required: true },
  type: {
    type: String,
    enum: ["verifyEmail", "resetPassword"],
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

// um usuário pode ter no máximo 1 token de cada tipo ativo
tokenSchema.index({ userId: 1, type: 1 }, { unique: true });

// TTL baseado em expiresAt em vez de um valor fixo pra todos
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Token", tokenSchema);