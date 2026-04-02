const express = require('express');
const router = express.Router();
const Doce = require('../models/Doce');

// GET todos os doces (ativos)
router.get('/', async (req, res) => {
  try {
    const doces = await Doce.find({ ativo: true }).sort({ createdAt: -1 });
    res.json(doces);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET todos os doces (admin - inclui inativos)
router.get('/admin', async (req, res) => {
  try {
    const doces = await Doce.find().sort({ createdAt: -1 });
    res.json(doces);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET um doce por ID
router.get('/:id', async (req, res) => {
  try {
    const doce = await Doce.findById(req.params.id);
    if (!doce) return res.status(404).json({ error: 'Doce não encontrado' });
    res.json(doce);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST criar novo doce
router.post('/', async (req, res) => {
  try {
    const novoDoce = new Doce(req.body);
    const salvo = await novoDoce.save();
    res.status(201).json(salvo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT atualizar doce
router.put('/:id', async (req, res) => {
  try {
    const atualizado = await Doce.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!atualizado) return res.status(404).json({ error: 'Doce não encontrado' });
    res.json(atualizado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE (soft delete - marca como inativo)
router.delete('/:id', async (req, res) => {
  try {
    const atualizado = await Doce.findByIdAndUpdate(
      req.params.id,
      { ativo: false },
      { new: true }
    );
    if (!atualizado) return res.status(404).json({ error: 'Doce não encontrado' });
    res.json({ message: 'Doce removido com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE permanente (admin)
router.delete('/:id/permanente', async (req, res) => {
  try {
    const removido = await Doce.findByIdAndDelete(req.params.id);
    if (!removido) return res.status(404).json({ error: 'Doce não encontrado' });
    res.json({ message: 'Doce removido permanentemente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
