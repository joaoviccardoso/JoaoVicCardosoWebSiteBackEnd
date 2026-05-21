import mongoose from "mongoose";

const STATUS_VALIDOS = [
  "negociacao", "orcamento_enviado", "aguardando_sinal", "contrato_assinado",
  "planejamento", "criando_o_design", "desenvolvimento", "testes",
  "revisao_cliente", "ajustes",
  "aguardando_deploy", "concluido", "entregue",
  "manutencao", "garantia",
  "aguardando_pagamento", "pago", "inadimplente",
  "pausado", "cancelado", "arquivado",
];

const STATUS_COR_MAP = {
  negociacao: "gray", orcamento_enviado: "purple", aguardando_sinal: "purple",
  contrato_assinado: "teal", planejamento: "blue", criando_o_design: "purple",
  desenvolvimento: "blue", testes: "pink", revisao_cliente: "orange",
  ajustes: "orange", aguardando_deploy: "yellow", concluido: "green",
  entregue: "green", manutencao: "teal", garantia: "teal",
  aguardando_pagamento: "yellow", pago: "green", inadimplente: "red",
  pausado: "orange", cancelado: "red", arquivado: "gray",
};

const productSchema = new mongoose.Schema({
  nomeProjeto:   { type: String, required: true },
  status:        { type: String, enum: STATUS_VALIDOS, default: "negociacao" },
  statusCor:     {
    type: String,
    default: function () {
      return STATUS_COR_MAP[this.status] ?? "gray";
    },
  },
  cliente:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  dateEntrega:   { type: Date },
  linkContrato:  { type: String },
  linkDemo:      { type: String },
  obser:         { type: String },
}, { timestamps: true });

// Atualiza a cor sempre que o status mudar
productSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    this.statusCor = STATUS_COR_MAP[this.status] ?? "gray";
  }
  next();
});

export default mongoose.model("Product", productSchema);