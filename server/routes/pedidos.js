const express = require('express');
const router = express.Router();
const Pedido = require('../models/Pedido');

// GET todos os pedidos
router.get('/', async (req, res) => {
  try {
    const pedidos = await Pedido.find().sort({ createdAt: -1 });
    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET pedidos por status
router.get('/status/:status', async (req, res) => {
  try {
    const pedidos = await Pedido.find({ status: req.params.status }).sort({ createdAt: -1 });
    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST criar novo pedido
router.post('/', async (req, res) => {
  try {
    const novoPedido = new Pedido(req.body);
    const salvo = await novoPedido.save();
    res.status(201).json(salvo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT atualizar status do pedido
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const atualizado = await Pedido.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!atualizado) return res.status(404).json({ error: 'Pedido não encontrado' });
    res.json(atualizado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT atualizar pedido completo
router.put('/:id', async (req, res) => {
  try {
    const atualizado = await Pedido.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!atualizado) return res.status(404).json({ error: 'Pedido não encontrado' });
    res.json(atualizado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE pedido
router.delete('/:id', async (req, res) => {
  try {
    const removido = await Pedido.findByIdAndDelete(req.params.id);
    if (!removido) return res.status(404).json({ error: 'Pedido não encontrado' });
    res.json({ message: 'Pedido removido com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET estatísticas
router.get('/stats/dashboard', async (req, res) => {
  try {
    const total = await Pedido.countDocuments();
    const pendentes = await Pedido.countDocuments({ status: 'pendente' });
    const preparando = await Pedido.countDocuments({ status: 'preparando' });
    const entregues = await Pedido.countDocuments({ status: 'entregue' });
    
    const receita = await Pedido.aggregate([
      { $match: { status: { $ne: 'cancelado' } } },
      { $group: { _id: null, total: { $sum: '$totalPix' } } }
    ]);

    res.json({
      total,
      pendentes,
      preparando,
      entregues,
      receita: receita[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
