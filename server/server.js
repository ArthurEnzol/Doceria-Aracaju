require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');

// Configuração do Multer para upload de imagens
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'imagem-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não suportado. Apenas JPG, PNG e WEBP são permitidos.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Endpoint de upload de imagens (protegido)
app.post('/api/admin/upload', authMiddleware, upload.single('imagem'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhuma imagem enviada' });
  }
  
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ 
    success: true, 
    url: imageUrl,
    filename: req.file.filename,
    originalname: req.file.originalname
  });
});

// Rate limiting simples (em memória)
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutos
const RATE_LIMIT_MAX = 100; // 100 requisições por IP

function checkRateLimit(ip) {
  const now = Date.now();
  const requests = rateLimit.get(ip) || [];
  const valid = requests.filter(r => now - r < RATE_LIMIT_WINDOW);
  
  if (valid.length >= RATE_LIMIT_MAX) {
    return false;
  }
  
  valid.push(now);
  rateLimit.set(ip, valid);
  return true;
}

// Middleware de rate limiting
app.use((req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Muitas requisições. Tente novamente mais tarde.' });
  }
  next();
});

// Middleware de autenticação JWT
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

// Hash de senha seguro
const SALT_ROUNDS = 10;

// Usuário admin com senha hasheada
let adminUser = {
  username: 'admin',
  passwordHash: null
};

// Inicializar hash do admin
(async () => {
  adminUser.passwordHash = await bcrypt.hash('aju2026', SALT_ROUNDS);
})();

// ============ PERSISTÊNCIA EM ARQUIVOS JSON ============
const DATA_DIR = path.join(__dirname, 'data');
const DOCES_FILE = path.join(DATA_DIR, 'doces.json');
const PEDIDOS_FILE = path.join(DATA_DIR, 'pedidos.json');
const CATEGORIAS_FILE = path.join(DATA_DIR, 'categorias.json');

// Criar pasta data se não existir
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Função para carregar dados do arquivo JSON
function loadFromFile(filePath, defaultData = []) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : defaultData;
    }
  } catch (err) {
    console.error(`Erro ao carregar ${filePath}:`, err);
  }
  return defaultData;
}

// Função para salvar dados no arquivo JSON
function saveToFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Dados salvos em ${filePath}`);
    return true;
  } catch (err) {
    console.error(`Erro ao salvar ${filePath}:`, err);
    return false;
  }
}

// Carregar dados iniciais dos arquivos (se existirem)
let doces = loadFromFile(DOCES_FILE, [
  { _id: '1', nome: 'Cocada Caramelada', descricao: 'Cocada de leite condensado com caramelo artesanal e flocos de coco fresco. Derrete na boca.', preco: 8.00, categoria: 'Cocadas', imagem: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop', badge: 'Mais Vendido', ativo: true, createdAt: new Date() },
  { _id: '2', nome: 'Casadinho de Goiaba', descricao: 'Clássico casadinho de queijo coalho com goiaba cremosa. Doçura e contraste perfeitos.', preco: 6.50, categoria: 'Tradicionais', imagem: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400&h=300&fit=crop', badge: '', ativo: true, createdAt: new Date() },
  { _id: '3', nome: 'Maria Mole de Coco', descricao: 'Maria mole artesanal coberta com coco queimado. Receita de família há 50 anos.', preco: 7.00, categoria: 'Tradicionais', imagem: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop', badge: '', ativo: true, createdAt: new Date() },
  { _id: '4', nome: 'Pé de Moleque Premium', descricao: 'Pé de moleque com amendoim torrado, açúcar mascavo e toque de canela. Crocante!', preco: 5.50, categoria: 'Tradicionais', imagem: 'https://images.unsplash.com/photo-1601056639638-63280d1fbaa5?w=400&h=300&fit=crop', badge: 'Novidade', ativo: true, createdAt: new Date() },
  { _id: '5', nome: 'Cartola Especial', descricao: 'Banana caramelizada com queijo coalho gratinado e canela. Receita pernambucana adaptada.', preco: 15.00, categoria: 'Especiais', imagem: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&h=300&fit=crop', badge: '', ativo: true, createdAt: new Date() },
  { _id: '6', nome: 'Tapioca Doce', descricao: 'Tapioca recheada com coco, leite condensado e queijo coalho. Um clássico nordestino.', preco: 12.00, categoria: 'Especiais', imagem: 'https://images.unsplash.com/photo-1598215439218-f93fbd0a6f8e?w=400&h=300&fit=crop', badge: '', ativo: true, createdAt: new Date() },
  { _id: '7', nome: 'Bolo Souza Leão', descricao: 'O autêntico bolo de mandioca com coco. Massa úmida e sabor inconfundível de Sergipe.', preco: 18.00, categoria: 'Bolos', imagem: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop', badge: 'Ícone de Aracaju', ativo: true, createdAt: new Date() },
  { _id: '8', nome: 'Beijinho Gourmet', descricao: 'Beijinho de coco com leite condensado artesanal e cravo-da-índia. Cobertura aveludada.', preco: 4.50, categoria: 'Brigadeiros', imagem: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400&h=300&fit=crop', badge: '', ativo: true, createdAt: new Date() },
  { _id: '9', nome: 'Brigadeiro de Caju', descricao: 'Brigadeiro cremoso com caju triturado. O sabor do Nordeste em cada mordida.', preco: 5.00, categoria: 'Brigadeiros', imagem: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476d?w=400&h=300&fit=crop', badge: 'Regional', ativo: true, createdAt: new Date() },
  { _id: '10', nome: 'Queijadinha da Vovó', descricao: 'Queijadinha cremosa com coco ralado e queijo coalho desfiado. Tradição que emociona.', preco: 6.00, categoria: 'Tradicionais', imagem: 'https://images.unsplash.com/photo-1515037028865-0a2a82603f7c?w=400&h=300&fit=crop', badge: '', ativo: true, createdAt: new Date() },
]);

let pedidos = loadFromFile(PEDIDOS_FILE, [
  { _id: 'ped1', cliente: 'Maria Silva', telefone: '79999123456', dataEntrega: '2024-01-15', itens: [{ id: 1, nome: 'Cocada Caramelada', preco: 8.00, quantidade: 5, imagem: '🥥' }], totalPix: 40.00, totalCartao: 42.00, formaPagamento: 'pix', status: 'pendente', observacoes: '', createdAt: new Date() },
  { _id: 'ped2', cliente: 'João Santos', telefone: '79999876543', dataEntrega: '2024-01-12', itens: [{ id: 3, nome: 'Bolo Souza Leão', preco: 18.00, quantidade: 1, imagem: '🍰' }], totalPix: 18.00, totalCartao: 18.90, formaPagamento: 'cartao', status: 'preparando', observacoes: '', createdAt: new Date() },
  { _id: 'ped3', cliente: 'Ana Paula', telefone: '79999765432', dataEntrega: '2024-01-10', itens: [{ id: 4, nome: 'Brigadeiro de Caju', preco: 5.00, quantidade: 20, imagem: '🍫' }], totalPix: 100.00, totalCartao: 105.00, formaPagamento: 'pix', status: 'entregue', observacoes: 'Entregar pela manhã', createdAt: new Date() },
]);

let categorias = loadFromFile(CATEGORIAS_FILE, [
  { _id: 'cat1', nome: 'Cocadas', icone: '🥥', cor: '#FF1493', ordem: 1, ativo: true },
  { _id: 'cat2', nome: 'Tradicionais', icone: '🏠', cor: '#D4AF37', ordem: 2, ativo: true },
  { _id: 'cat3', nome: 'Especiais', icone: '✨', cor: '#9C27B0', ordem: 3, ativo: true },
  { _id: 'cat4', nome: 'Bolos', icone: '🎂', cor: '#4CAF50', ordem: 4, ativo: true },
  { _id: 'cat5', nome: 'Brigadeiros', icone: '🍫', cor: '#8D6E63', ordem: 5, ativo: true },
]);

// Salvar dados iniciais nos arquivos (apenas na primeira execução)
if (!fs.existsSync(DOCES_FILE)) saveToFile(DOCES_FILE, doces);
if (!fs.existsSync(PEDIDOS_FILE)) saveToFile(PEDIDOS_FILE, pedidos);
if (!fs.existsSync(CATEGORIAS_FILE)) saveToFile(CATEGORIAS_FILE, categorias);

// Sanitização de input
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<[^>]*>/g, '')
            .trim()
            .substring(0, 1000);
}

// ============ ROTAS DE AUTENTICAÇÃO ============

// Login - gera token JWT
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
  }
  
  if (username !== adminUser.username) {
    await bcrypt.compare('dummy', '$2a$10$dummyhash');
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }
  
  const validPassword = await bcrypt.compare(password, adminUser.passwordHash);
  
  if (!validPassword) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }
  
  const token = jwt.sign(
    { username: adminUser.username, role: 'admin' },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
  
  res.json({ 
    token, 
    user: { username: adminUser.username, role: 'admin' },
    expiresIn: '8h'
  });
});

// Verificar token
app.get('/api/auth/verify', authMiddleware, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// ============ ROTAS PÚBLICAS (SITE) ============

app.get('/api/doces', (req, res) => {
  res.json(doces.filter(d => d.ativo));
});

app.get('/api/doces/:id', (req, res) => {
  const doce = doces.find(d => d._id === req.params.id && d.ativo);
  if (!doce) return res.status(404).json({ error: 'Doce não encontrado' });
  res.json(doce);
});

app.post('/api/pedidos', (req, res) => {
  const { cliente, telefone, dataEntrega, itens, totalPix, totalCartao, formaPagamento, observacoes } = req.body;
  
  if (!cliente || !telefone || !itens || !Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ error: 'Dados do pedido incompletos' });
  }
  
  const novoPedido = {
    _id: 'ped' + Date.now() + Math.random().toString(36).substr(2, 9),
    cliente: sanitizeString(cliente),
    telefone: sanitizeString(telefone).replace(/\D/g, '').substring(0, 11),
    dataEntrega: sanitizeString(dataEntrega),
    itens: itens.map(item => ({
      id: item.id,
      nome: sanitizeString(item.nome),
      preco: parseFloat(item.preco) || 0,
      quantidade: parseInt(item.quantidade) || 1,
      imagem: item.imagem
    })),
    totalPix: parseFloat(totalPix) || 0,
    totalCartao: parseFloat(totalCartao) || 0,
    formaPagamento: formaPagamento === 'cartao' ? 'cartao' : 'pix',
    observacoes: sanitizeString(observacoes),
    status: 'pendente',
    createdAt: new Date()
  };
  
  pedidos.push(novoPedido);
  // Salvar no arquivo JSON
  saveToFile(PEDIDOS_FILE, pedidos);
  res.status(201).json(novoPedido);
});

// ============ ROTAS PROTEGIDAS (ADMIN) ============

app.get('/api/admin/doces', authMiddleware, (req, res) => {
  res.json(doces);
});

app.post('/api/admin/doces', authMiddleware, (req, res) => {
  const { nome, descricao, preco, categoria, imagem, badge } = req.body;
  
  if (!nome || !descricao || !preco) {
    return res.status(400).json({ error: 'Nome, descrição e preço são obrigatórios' });
  }
  
  const novoDoce = {
    _id: Date.now().toString(),
    nome: sanitizeString(nome),
    descricao: sanitizeString(descricao),
    preco: parseFloat(preco) || 0,
    categoria: sanitizeString(categoria) || 'outros',
    imagem: sanitizeString(imagem) || '🧁',
    badge: sanitizeString(badge),
    ativo: true,
    createdAt: new Date()
  };
  
  doces.push(novoDoce);
  // Salvar no arquivo JSON
  saveToFile(DOCES_FILE, doces);
  res.status(201).json(novoDoce);
});

app.put('/api/admin/doces/:id', authMiddleware, (req, res) => {
  const index = doces.findIndex(d => d._id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Doce não encontrado' });
  
  const updates = req.body;
  if (updates.nome) updates.nome = sanitizeString(updates.nome);
  if (updates.descricao) updates.descricao = sanitizeString(updates.descricao);
  if (updates.categoria) updates.categoria = sanitizeString(updates.categoria);
  if (updates.imagem) updates.imagem = sanitizeString(updates.imagem);
  if (updates.badge) updates.badge = sanitizeString(updates.badge);
  if (updates.preco) updates.preco = parseFloat(updates.preco) || 0;
  
  doces[index] = { ...doces[index], ...updates };
  // Salvar no arquivo JSON
  saveToFile(DOCES_FILE, doces);
  res.json(doces[index]);
});

app.delete('/api/admin/doces/:id', authMiddleware, (req, res) => {
  const index = doces.findIndex(d => d._id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Doce não encontrado' });
  doces[index].ativo = false;
  // Salvar no arquivo JSON
  saveToFile(DOCES_FILE, doces);
  res.json({ message: 'Doce removido' });
});

app.delete('/api/admin/doces/:id/permanente', authMiddleware, (req, res) => {
  doces = doces.filter(d => d._id !== req.params.id);
  // Salvar no arquivo JSON
  saveToFile(DOCES_FILE, doces);
  res.json({ message: 'Doce removido permanentemente' });
});

// ============ ROTAS DE CATEGORIAS (ADMIN) ============

// GET - Listar todas as categorias
app.get('/api/admin/categorias', authMiddleware, (req, res) => {
  res.json(categorias.sort((a, b) => a.ordem - b.ordem));
});

// GET - Listar categorias ativas (público)
app.get('/api/categorias', (req, res) => {
  res.json(categorias.filter(c => c.ativo).sort((a, b) => a.ordem - b.ordem));
});

// POST - Criar nova categoria
app.post('/api/admin/categorias', authMiddleware, (req, res) => {
  const { nome, icone, cor, ordem } = req.body;
  
  if (!nome) {
    return res.status(400).json({ error: 'Nome da categoria é obrigatório' });
  }
  
  // Verificar se já existe categoria com esse nome
  if (categorias.some(c => c.nome.toLowerCase() === nome.toLowerCase())) {
    return res.status(400).json({ error: 'Já existe uma categoria com esse nome' });
  }
  
  const novaCategoria = {
    _id: 'cat' + Date.now(),
    nome: sanitizeString(nome),
    icone: sanitizeString(icone) || '📦',
    cor: sanitizeString(cor) || '#FF1493',
    ordem: parseInt(ordem) || categorias.length + 1,
    ativo: true
  };
  
  categorias.push(novaCategoria);
  // Salvar no arquivo JSON
  saveToFile(CATEGORIAS_FILE, categorias);
  res.status(201).json(novaCategoria);
});

// PUT - Atualizar categoria (com atualização automática dos doces)
app.put('/api/admin/categorias/:id', authMiddleware, (req, res) => {
  const index = categorias.findIndex(c => c._id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Categoria não encontrada' });
  
  const categoriaAntiga = categorias[index];
  const updates = req.body;
  
  // Se está mudando o nome, atualizar todos os doces dessa categoria
  if (updates.nome && updates.nome !== categoriaAntiga.nome) {
    const nomeAntigo = categoriaAntiga.nome;
    const nomeNovo = sanitizeString(updates.nome);
    
    // Atualizar todos os doces que usam essa categoria
    doces.forEach(doce => {
      if (doce.categoria === nomeAntigo) {
        doce.categoria = nomeNovo;
      }
    });
    
    updates.nome = nomeNovo;
  }
  
  if (updates.icone) updates.icone = sanitizeString(updates.icone);
  if (updates.cor) updates.cor = sanitizeString(updates.cor);
  if (updates.ordem) updates.ordem = parseInt(updates.ordem);
  
  categorias[index] = { ...categorias[index], ...updates };
  // Salvar no arquivo JSON
  saveToFile(CATEGORIAS_FILE, categorias);
  // Se mudou nome dos doces, salvar doces também
  if (updates.nome && updates.nome !== categoriaAntiga.nome) {
    saveToFile(DOCES_FILE, doces);
  }
  res.json({ 
    categoria: categorias[index], 
    message: updates.nome && updates.nome !== categoriaAntiga.nome 
      ? 'Categoria atualizada e doces vinculados foram atualizados automaticamente' 
      : 'Categoria atualizada'
  });
});

// DELETE - Remover categoria (soft delete)
app.delete('/api/admin/categorias/:id', authMiddleware, (req, res) => {
  const index = categorias.findIndex(c => c._id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Categoria não encontrada' });
  
  categorias[index].ativo = false;
  // Salvar no arquivo JSON
  saveToFile(CATEGORIAS_FILE, categorias);
  res.json({ message: 'Categoria removida' });
});

// DELETE - Remover categoria permanentemente
app.delete('/api/admin/categorias/:id/permanente', authMiddleware, (req, res) => {
  const categoria = categorias.find(c => c._id === req.params.id);
  if (!categoria) return res.status(404).json({ error: 'Categoria não encontrada' });
  
  // Mover doces dessa categoria para 'Sem Categoria'
  doces.forEach(doce => {
    if (doce.categoria === categoria.nome) {
      doce.categoria = 'Sem Categoria';
    }
  });
  
  categorias = categorias.filter(c => c._id !== req.params.id);
  // Salvar no arquivo JSON
  saveToFile(CATEGORIAS_FILE, categorias);
  // Salvar doces que foram atualizados
  saveToFile(DOCES_FILE, doces);
  res.json({ message: 'Categoria removida permanentemente. Doces foram movidos para "Sem Categoria"' });
});

// ============ ROTAS DE PEDIDOS (ADMIN) ============

app.get('/api/admin/pedidos', authMiddleware, (req, res) => {
  res.json(pedidos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

app.post('/api/admin/pedidos', authMiddleware, (req, res) => {
  const { cliente, telefone, dataEntrega, itens, totalPix, totalCartao, formaPagamento, status, observacoes } = req.body;
  
  if (!cliente || !telefone || !itens || itens.length === 0) {
    return res.status(400).json({ error: 'Cliente, telefone e itens são obrigatórios' });
  }
  
  const novoPedido = {
    _id: 'ped' + Date.now(),
    cliente: sanitizeString(cliente),
    telefone: sanitizeString(telefone).replace(/\D/g, '').substring(0, 11),
    dataEntrega: dataEntrega || new Date().toISOString().split('T')[0],
    itens: itens.map(item => ({
      id: item.id || Date.now(),
      nome: sanitizeString(item.nome),
      preco: parseFloat(item.preco) || 0,
      quantidade: parseInt(item.quantidade) || 1,
      imagem: item.imagem || '🧁'
    })),
    totalPix: parseFloat(totalPix) || 0,
    totalCartao: parseFloat(totalCartao) || 0,
    formaPagamento: sanitizeString(formaPagamento) || 'pix',
    status: sanitizeString(status) || 'pendente',
    observacoes: sanitizeString(observacoes) || '',
    createdAt: new Date()
  };
  
  pedidos.push(novoPedido);
  // Salvar no arquivo JSON
  saveToFile(PEDIDOS_FILE, pedidos);
  res.status(201).json(novoPedido);
});

app.get('/api/admin/pedidos/status/:status', authMiddleware, (req, res) => {
  res.json(pedidos.filter(p => p.status === req.params.status));
});

app.put('/api/admin/pedidos/:id/status', authMiddleware, (req, res) => {
  const pedido = pedidos.find(p => p._id === req.params.id);
  if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado' });
  
  const { status } = req.body;
  const validStatuses = ['pendente', 'preparando', 'pronto', 'entregue', 'cancelado'];
  
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Status inválido' });
  }
  
  pedido.status = status;
  // Salvar no arquivo JSON
  saveToFile(PEDIDOS_FILE, pedidos);
  res.json(pedido);
});

app.put('/api/admin/pedidos/:id', authMiddleware, (req, res) => {
  const index = pedidos.findIndex(p => p._id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Pedido não encontrado' });
  
  const updates = req.body;
  if (updates.cliente) updates.cliente = sanitizeString(updates.cliente);
  if (updates.telefone) updates.telefone = sanitizeString(updates.telefone).replace(/\D/g, '').substring(0, 11);
  if (updates.observacoes) updates.observacoes = sanitizeString(updates.observacoes);
  
  pedidos[index] = { ...pedidos[index], ...updates };
  // Salvar no arquivo JSON
  saveToFile(PEDIDOS_FILE, pedidos);
  res.json(pedidos[index]);
});

app.delete('/api/admin/pedidos/:id', authMiddleware, (req, res) => {
  pedidos = pedidos.filter(p => p._id !== req.params.id);
  // Salvar no arquivo JSON
  saveToFile(PEDIDOS_FILE, pedidos);
  res.json({ message: 'Pedido removido' });
});

app.post('/api/admin/pedidos/batch-delete', authMiddleware, (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'IDs não fornecidos' });
  }
  const countBefore = pedidos.length;
  pedidos = pedidos.filter(p => !ids.includes(p._id));
  const countDeleted = countBefore - pedidos.length;
  // Salvar no arquivo JSON
  saveToFile(PEDIDOS_FILE, pedidos);
  res.json({ message: `${countDeleted} pedido(s) removido(s)` });
});

app.get('/api/admin/stats/dashboard', authMiddleware, (req, res) => {
  const total = pedidos.length;
  const pendentes = pedidos.filter(p => p.status === 'pendente').length;
  const preparando = pedidos.filter(p => p.status === 'preparando').length;
  const prontos = pedidos.filter(p => p.status === 'pronto').length;
  const entregues = pedidos.filter(p => p.status === 'entregue').length;
  const cancelados = pedidos.filter(p => p.status === 'cancelado').length;
  
  const receita = pedidos
    .filter(p => p.status !== 'cancelado')
    .reduce((sum, p) => sum + p.totalPix, 0);
  
  const receitaPix = pedidos
    .filter(p => p.status !== 'cancelado' && p.formaPagamento === 'pix')
    .reduce((sum, p) => sum + p.totalPix, 0);
  
  const receitaCartao = pedidos
    .filter(p => p.status !== 'cancelado' && p.formaPagamento === 'cartao')
    .reduce((sum, p) => sum + p.totalCartao, 0);
  
  res.json({ total, pendentes, preparando, prontos, entregues, cancelados, receita, receitaPix, receitaCartao });
});

// ============ SERVIR PAINEL ADMIN ============
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// ============ HEALTH CHECK ============
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date(), version: '1.0.0', secure: true });
});

// ============ ERROR HANDLER ============
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// ============ START ============
app.listen(PORT, () => {
  console.log(`✅ Servidor seguro rodando na porta ${PORT}`);
  console.log(`📊 Painel Admin: http://localhost:${PORT}/admin`);
  console.log(`� Autenticação: JWT (8h expiração)`);
  console.log(`🛡️  Rate limiting: ${RATE_LIMIT_MAX} req/15min por IP`);
  console.log(`📝 Dados: Memória (configure MongoDB para persistência)`);
});
