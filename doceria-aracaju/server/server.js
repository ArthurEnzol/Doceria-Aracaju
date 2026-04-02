require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Banco de dados em memória (temporário até configurar MongoDB)
let doces = [
  { _id: '1', nome: 'Cocada Caramelada', descricao: 'Cremosa cocada de leite condensado caramelizado', preco: 8.00, categoria: 'cocada', imagem: '🥥', badge: 'Mais Vendido', ativo: true, createdAt: new Date() },
  { _id: '2', nome: 'Casadinho de Goiaba', descricao: 'Doce de leite e goiaba em camadas', preco: 6.50, categoria: 'goiaba', imagem: '🍬', badge: '', ativo: true, createdAt: new Date() },
  { _id: '3', nome: 'Bolo Souza Leão', descricao: 'Tradicional bolo de massa com cobertura de gema', preco: 18.00, categoria: 'bolo', imagem: '🍰', badge: 'Tradicional', ativo: true, createdAt: new Date() },
  { _id: '4', nome: 'Brigadeiro de Caju', descricao: 'Brigadeiro gourmet com castanha de caju', preco: 5.00, categoria: 'brigadeiro', imagem: '🍫', badge: '', ativo: true, createdAt: new Date() },
  { _id: '5', nome: 'Sorvete de Jenipapo', descricao: 'Cremoso sorvete de jenipapo artesanal', preco: 12.00, categoria: 'sorvete', imagem: '🍦', badge: 'Exclusivo', ativo: true, createdAt: new Date() },
  { _id: '6', nome: 'Cocada de Abacaxi', descricao: 'Cocada com pedaços de abacaxi caramelizado', preco: 7.50, categoria: 'cocada', imagem: '🍍', badge: '', ativo: true, createdAt: new Date() },
  { _id: '7', nome: 'Goiabada Cascão', descricao: 'Goiabada com casca em calda espessa', preco: 9.00, categoria: 'goiaba', imagem: '🍑', badge: 'Caseiro', ativo: true, createdAt: new Date() },
  { _id: '8', nome: 'Bolo de Côco', descricao: 'Bolo molhadinho de côco fresco', preco: 45.00, categoria: 'bolo', imagem: '🎂', badge: 'Família', ativo: true, createdAt: new Date() },
  { _id: '9', nome: 'Romeu e Julieta', descricao: 'Combinação clássica de goiabada e queijo', preco: 8.50, categoria: 'goiaba', imagem: '🧀', badge: 'Clássico', ativo: true, createdAt: new Date() },
  { _id: '10', nome: 'Pudim de Leite', descricao: 'Pudim cremoso com calda de caramelo', preco: 10.00, categoria: 'bolo', imagem: '🍮', badge: 'Favorito', ativo: true, createdAt: new Date() },
];

let pedidos = [
  { _id: 'ped1', cliente: 'Maria Silva', telefone: '79999123456', dataEntrega: '2024-01-15', itens: [{ id: 1, nome: 'Cocada Caramelada', preco: 8.00, quantidade: 5, imagem: '🥥' }], totalPix: 40.00, totalCartao: 42.00, formaPagamento: 'pix', status: 'pendente', observacoes: '', createdAt: new Date() },
  { _id: 'ped2', cliente: 'João Santos', telefone: '79999876543', dataEntrega: '2024-01-12', itens: [{ id: 3, nome: 'Bolo Souza Leão', preco: 18.00, quantidade: 1, imagem: '🍰' }], totalPix: 18.00, totalCartao: 18.90, formaPagamento: 'cartao', status: 'preparando', observacoes: '', createdAt: new Date() },
  { _id: 'ped3', cliente: 'Ana Paula', telefone: '79999765432', dataEntrega: '2024-01-10', itens: [{ id: 4, nome: 'Brigadeiro de Caju', preco: 5.00, quantidade: 20, imagem: '🍫' }], totalPix: 100.00, totalCartao: 105.00, formaPagamento: 'pix', status: 'entregue', observacoes: 'Entregar pela manhã', createdAt: new Date() },
];

// API Routes - Doces
app.get('/api/doces', (req, res) => {
  res.json(doces.filter(d => d.ativo));
});

app.get('/api/doces/admin', (req, res) => {
  res.json(doces);
});

app.get('/api/doces/:id', (req, res) => {
  const doce = doces.find(d => d._id === req.params.id);
  if (!doce) return res.status(404).json({ error: 'Doce não encontrado' });
  res.json(doce);
});

app.post('/api/doces', (req, res) => {
  const novoDoce = {
    _id: Date.now().toString(),
    ...req.body,
    ativo: true,
    createdAt: new Date()
  };
  doces.push(novoDoce);
  res.status(201).json(novoDoce);
});

app.put('/api/doces/:id', (req, res) => {
  const index = doces.findIndex(d => d._id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Doce não encontrado' });
  doces[index] = { ...doces[index], ...req.body };
  res.json(doces[index]);
});

app.delete('/api/doces/:id', (req, res) => {
  const index = doces.findIndex(d => d._id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Doce não encontrado' });
  doces[index].ativo = false;
  res.json({ message: 'Doce removido' });
});

app.delete('/api/doces/:id/permanente', (req, res) => {
  doces = doces.filter(d => d._id !== req.params.id);
  res.json({ message: 'Doce removido permanentemente' });
});

// API Routes - Pedidos
app.get('/api/pedidos', (req, res) => {
  res.json(pedidos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

app.get('/api/pedidos/status/:status', (req, res) => {
  res.json(pedidos.filter(p => p.status === req.params.status));
});

app.post('/api/pedidos', (req, res) => {
  const novoPedido = {
    _id: 'ped' + Date.now(),
    ...req.body,
    createdAt: new Date()
  };
  pedidos.push(novoPedido);
  res.status(201).json(novoPedido);
});

app.put('/api/pedidos/:id/status', (req, res) => {
  const pedido = pedidos.find(p => p._id === req.params.id);
  if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado' });
  pedido.status = req.body.status;
  res.json(pedido);
});

app.put('/api/pedidos/:id', (req, res) => {
  const index = pedidos.findIndex(p => p._id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Pedido não encontrado' });
  pedidos[index] = { ...pedidos[index], ...req.body };
  res.json(pedidos[index]);
});

app.delete('/api/pedidos/:id', (req, res) => {
  pedidos = pedidos.filter(p => p._id !== req.params.id);
  res.json({ message: 'Pedido removido' });
});

app.get('/api/pedidos/stats/dashboard', (req, res) => {
  const total = pedidos.length;
  const pendentes = pedidos.filter(p => p.status === 'pendente').length;
  const preparando = pedidos.filter(p => p.status === 'preparando').length;
  const entregues = pedidos.filter(p => p.status === 'entregue').length;
  const receita = pedidos
    .filter(p => p.status !== 'cancelado')
    .reduce((sum, p) => sum + p.totalPix, 0);
  
  res.json({ total, pendentes, preparando, entregues, receita });
});

// Servir arquivos estáticos do admin
app.use('/admin', express.static(path.join(__dirname, 'admin')));
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    db: 'Memória (substituir por MongoDB quando configurado)'
  });
});

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
  console.log(`📊 Painel Admin: http://localhost:${PORT}/admin`);
  console.log(`💾 Modo: Memória (dados não persistem após reiniciar)`);
  console.log(`📝 Configure MongoDB quando quiser persistência real`);
});
