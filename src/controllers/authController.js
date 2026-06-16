import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import Token from "../models/token.js";
import { sendEmail } from "../utils/sendEmail.js";

/*---------------------AUTH USUARIOS----------------------------*/

// CRIA REGISTRO NO BANCO
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
    const tokenString = crypto.randomBytes(32).toString("hex");

    // 5. Salva token no banco
    await Token.create({
      userId: newUser._id,
      token: tokenString,
    });

    // 6. Cria link de verificação — com o ID do usuário (bug corrigido)
    const link = `${process.env.BASE_URL}/${newUser._id}/verify/${tokenString}`;

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

// FAZ LOGIN
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
    if (!user.verified) {
      let token = await Token.findOne({ userId: user._id });

      // 4. Se não existir token, cria um novo e reenvia o email
      if (!token) {
        const tokenString = crypto.randomBytes(32).toString("hex");

        token = await Token.create({
          userId: user._id,
          token: tokenString,
        });

        // 5. Cria link com ID + token
        const link = `${process.env.BASE_URL}/${user._id}/verify/${token.token}`;

        // 6. Reenvia email
        await sendEmail(
          user.email,
          "Verificação de Email",
          `Clique no link para verificar sua conta: ${link}`
        );
      }

      // 7. Interrompe o login até o email ser verificado
      return res.status(400).json({
        message: "Verifique seu email. Um novo link foi enviado.",
      });
    }

    // 8. Email verificado — gera JWT (bug corrigido: declarado fora do bloco if)
    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 9. Remove senha do objeto retornado
    const { senha: _senha, ...dadosPublicos } = user.toObject();

    res.json({ user: dadosPublicos, token: jwtToken });

  } catch (err) {
    // Bug corrigido: era next(error), variável inexistente
    next(err);
  }
}

// Verifica o token de email
export async function verificarToken(req, res, next) {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) {
      return res.status(400).json({ message: "Link inválido" });
    }

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token) {
      return res.status(400).json({ message: "Link inválido" });
    }

    // Bug corrigido: $set para realmente atualizar o campo
    await User.updateOne({ _id: user._id }, { $set: { verified: true } });

    // Bug corrigido: deleteOne no lugar de .remove() (depreciado no Mongoose 7+)
    await Token.deleteOne({ _id: token._id });

    res.status(200).json({ message: "Email verificado com sucesso" });
  } catch (error) {
    next(error);
  }
}

//CRIA O TOKEN E ENVIA POR EMAIL
export async function redefinirSenha(req, res, next){
  const { email } = req.body;

  try {
    // 1. Verifica se usuário existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Usuário não encontrado" });
    }

    const tokenSenha = crypto.randomBytes(32).toString("hex")
    
    token = await Token.create({
      userId: user._id,
      token: tokenString,
    });

    // . Cria link com ID + token
    const link = `${process.env.BASE_URL}/${user._id}/verify/${token.token}`;

    // . Reenvia email
    await sendEmail(
    user.email,
      "Redefinição de senha",
      `Clique no link para mudar sua senha: ${link}
       Esse link vai expirar em 15 minutos.
      `
    );

    return res.json({message: "E-mail de redefinição enviado!"})
  } catch (error) {
    next(error);
  }
}

export async function resetSenha(req, res, next){
  const { token } = req.params;
  const { novaSenha } = req.body;

  try {
    // 1. Buscar token no banco
    const tokenDoc = await Token.findOne({ token });

    if (!tokenDoc) {
      return res.status(400).json({ message: "Link inválido ou expirado" });
    }

    // 2. Buscar usuário pelo userId do token
    const user = await User.findById(tokenDoc.userId);

    if (!user) {
      return res.status(400).json({ message: "Usuário não encontrado" });
    }

    // 3. Criptografar nova senha
    const hashPassword = await bcrypt.hash(novaSenha, 10);

    // 4. Atualizar senha no Mongo
    await User.findByIdAndUpdate(user._id, {
      senha: hashPassword,
    });

    // 5. (Opcional) Deletar token após uso
    await Token.deleteOne({ _id: tokenDoc._id });

    return res.json({message: "Senha redefinida com sucesso!"})
  } catch (error) {
    next(error)
  }
}

/*-------------------------------CRUD CLIENTE--------------------------------------*/ 

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