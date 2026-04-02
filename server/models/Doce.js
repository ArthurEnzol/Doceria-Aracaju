const mongoose = require('mongoose');

const doceSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  descricao: { type: String, required: true },
  preco: { type: Number, required: true },
  categoria: { 
    type: String, 
    required: true,
    enum: ['cocada', 'goiaba', 'bolo', 'brigadeiro', 'sorvete']
  },
  imagem: { type: String, required: true },
  badge: { type: String, default: '' },
  ativo: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Doce', doceSchema);
