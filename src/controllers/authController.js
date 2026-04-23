import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function register(req, res) {
    try{
        const { nomeCompleto, email, senha, telefone } = req.body;

        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(400).json({ message: "Email já cadastrado" });
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        const newUser = await User.create({
            nomeCompleto,
            email,
            senha: senhaHash,
            telefone
        });

        res.status(201).json(newUser);
    } catch (error){
        res.status(500).json({ error: error.message });
    }
}


export async function login(req, res) {
  try {
    const { email, senha } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Usuário não encontrado" });
    }

    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) {
      return res.status(400).json({ message: "Senha inválida" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getAllUsers(req, res) {
  try {
    const users = await User.find();

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}