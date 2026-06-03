import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js";

//cria o registro do usuario no banco
export async function register(req, res, next) {
  try {
    const { nomeCompleto, email, senha, telefone } = req.body;

    // 1. Verifica se já existe
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: "Email já cadastrado" });
    }

    // 2. Criptografa senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // 3. Cria usuário (não verificado)
    const newUser = await User.create({
      nomeCompleto,
      email,
      senha: senhaHash,
      telefone,
      verified: false,
    });

    // 4. Gera token
    const token = crypto.randomBytes(32).toString("hex");

    // 5. Salva token no banco
    await Token.create({
      userId: newUser._id,
      token,
    });

    // 6. Cria link de verificação
    const link = `${process.env.BASE_URL}/verify/${token}`;

    // 7. Envia email
    await sendEmail(
      newUser.email,
      "Verificação de Email",
      `Clique no link para verificar sua conta: ${link}`
    );

    // 8. Resposta
    res.status(201).json({
      message: "Usuário criado! Verifique seu email.",
    });

  } catch (error) {
    next(error);
  }
}

export async function verificarToken(req, res, next){
  try {
    const user = await User.findOne({_id: req.params.id})
    if (!user) {
      return res.status(400).json({ message: "Invalid Link" });
    }

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token
    })
    if (!token) {
      return res.status(400).json({ message: "Invalid Link" });
    }

    await User.updateOne({_id: user._id, verified: true})
    await token.remove()

    res.status(200).send({message: "Email verificado com sucesso"})
  } catch (error) {
    next(error)
  }
}

//faz login 
export async function login(req, res, next) {
  try {
    const { email, senha } = req.body;

    // 1. Verifica se usuário existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Usuário não encontrado" });
    }

    // 2. Verifica senha
    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) {
      return res.status(400).json({ message: "Senha ou Email errado." });
    }

    // 3. Verifica se email foi validado
    if(!user.verified){
      let token = await Token.findOne({ userId: user._id });
      
      // 4. Se não existir token, cria um novo
      if (!token) {
        const tokenString = crypto.randomBytes(32).toString("hex");

        token = await Token.create({
          userId: user._id,
          token: tokenString,
        });

        // 5. Cria link correto (com ID + token)
        const link = `${process.env.BASE_URL}/${user._id}/verify/${token.token}`;

        // 6. Envia email novamente
        await sendEmail(
          user.email,
          "Verificação de Email",
          `Clique no link para verificar sua conta: ${link}`
        );
      }

      return res.status(400).json({
        message: "Verifique seu email. Um novo link foi enviado.",
      });

      // 7. Se estiver verificado, gera JWT
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
    }

      //removendo a senha
      const { senha: _senha, ...dadosPublicos } = user.toObject();
      res.json({ user: dadosPublicos, token });
  } catch (err) {
    next(error)
  }
}

//Pega todos os login
export async function getAllUsers(req, res, next) {
  try {
    const users = await User.find().select("-senha");

    res.json(users);
  } catch (err) {
    next(error)
  }
}

// pega usuario por id
export async function getOneUser(req, res, next) {
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
        next(error)
    }
}

//busca parcial de cliente
export async function searchUser(req, res, next) {
    try {
        const { nome } = req.query;
        const users = await User.find({ 
            nomeCompleto: { $regex: nome, $options: "i" } // busca parcial, case insensitive
        }).select("_id nomeCompleto email");

        res.status(200).json(users);
    } catch (error) {
        next(error)
    }
}

//Para atualizar ou cadastrar os dados que falta
export async function putDadosUser(req, res, next) {
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
    next(error)
  }
}

// Deletar cliente
export async function deleteCliente(req, res, next) {
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
        next(error)
    }
}