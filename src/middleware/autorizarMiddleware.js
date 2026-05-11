// middleware/autorizarMiddleware.js
function autorizar(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.usuarioRole)) {
      return res.status(403).json({ mensagem: "Acesso negado." });
    }
    next();
  };
}

export default autorizar;