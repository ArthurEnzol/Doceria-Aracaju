const mongoose = require('mongoose');

const pedidoSchema = new mongoose.Schema({
  cliente: { type: String, required: true },
  telefone: { type: String, required: true },
  dataEntrega: { type: String, required: true },
  itens: [{
    id: Number,
    nome: String,
    preco: Number,
    quantidade: Number,
    imagem: String
  }],
  totalPix: { type: Number, required: true },
  totalCartao: { type: Number, required: true },
  formaPagamento: { type: String, enum: ['pix', 'cartao', 'dinheiro'], required: true },
  status: { 
    type: String, 
    enum: ['pendente', 'preparando', 'pronto', 'entregue', 'cancelado'],
    default: 'pendente'
  },
  observacoes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Pedido', pedidoSchema);
