import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//cria o registro do usuario no banco
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

//faz login 
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
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    //removendo a senha
    const { senha: _senha, ...dadosPublicos } = user.toObject();
    res.json({ user: dadosPublicos, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

//Pega todos os login
export async function getAllUsers(req, res) {
  try {
    const users = await User.find().select("-senha");

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// pega usuario por id
export async function getOneUser(req, res) {
    try {
        const { id } = req.params
        console.log("Tentando deletar ID:", id); // ← adicione isso
        // Valida se o id é um ObjectId válido do MongoDB
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "ID inválido" })
        }

        const user = await User.findById(id).select("-senha") // nunca retorna a senha

        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado" })
        }

        res.status(200).json(user)

    } catch (error) {
        console.error("Erro em getOneUser:", error)
        res.status(500).json({ message: "Erro interno no servidor" })
    }
}

//busca parcial de cliente
export async function searchUser(req, res) {
    try {
        const { nome } = req.query;
        const users = await User.find({ 
            nomeCompleto: { $regex: nome, $options: "i" } // busca parcial, case insensitive
        }).select("_id nomeCompleto email");

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar usuário" });
    }
}

//Para atualizar ou cadastrar os dados que falta
export async function putDadosUser(req, res) {
  try{
    const { id } = req.params;

    // permite se for o próprio usuário OU se for admin
    const ehOProprioUsuario = req.usuarioId === id
    const ehAdmin = req.usuarioRole === "admin"

    if (!ehOProprioUsuario && !ehAdmin) {
      return res.status(403).json({ mensagem: "Acesso negado." })
    }

    const { nomeCompleto, telefone, cpf, email, endereco, cep, numeroCasa, role } = req.body;

    const camposParaAtualizar = {};
    if (nomeCompleto) camposParaAtualizar.nomeCompleto = nomeCompleto;
    if (telefone)     camposParaAtualizar.telefone = telefone;
    if (cpf)          camposParaAtualizar.cpf = cpf;
    if (email)        camposParaAtualizar.email = email;
    if (endereco)     camposParaAtualizar.endereco = endereco;
    if (cep)          camposParaAtualizar.cep = cep;
    if (numeroCasa)   camposParaAtualizar.numeroCasa = numeroCasa;
    if (role && ehAdmin) camposParaAtualizar.role = role //só admin pode mudar o role

    const userAtualizado = await User.findByIdAndUpdate(
      id,
      { $set: camposParaAtualizar },
      { new: true, runValidators: true } // "new: true" retorna o doc já atualizado
    ).select("-senha");

    if (!userAtualizado) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    res.status(200).json({ message: "Dados atualizados com sucesso", user: userAtualizado });

  } catch (erro){
    res.status(500).json({ error: erro.message });
  }
}

// Deletar cliente
export async function deleteCliente(req, res) {
    try {
        const { id } = req.params;

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "ID inválido" });
        }

        // ou: impedir que o admin delete a si mesmo
        if (id === req.usuarioId) {
            return res.status(403).json({ message: "Você não pode deletar sua própria conta." });
        }

        const deletado = await User.findByIdAndDelete(id);

        if (!deletado) {
            return res.status(404).json({ message: "Usuário não encontrado" });
        }

        res.status(200).json({ message: "Usuario deletado!" });
    } catch (error) {
        console.error("Erro real ao deletar:", error); // ← veja o terminal
        res.status(500).json({ message: "Erro ao deletar", error: error.message });
    }
}