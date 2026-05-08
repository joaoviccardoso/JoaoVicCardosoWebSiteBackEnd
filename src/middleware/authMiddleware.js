import jwt from "jsonwebtoken";

function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ mensagem: "Token não fornecido." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuarioId = payload.id;
    req.usuarioRole = payload.role;
    next();
  } catch {
    return res.status(401).json({ mensagem: "Token inválido ou expirado." });
  }
}

export default autenticar;