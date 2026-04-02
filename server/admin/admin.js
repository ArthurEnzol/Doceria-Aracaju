// Configuração da API
const API_URL = window.location.origin + '/api';

// Dados mockados para demonstração (substituir por chamadas reais à API)
let doces = JSON.parse(localStorage.getItem('doces')) || [
  { _id: '1', nome: 'Cocada Caramelada', descricao: 'Cremosa cocada de leite condensado caramelizado', preco: 8.00, categoria: 'cocada', imagem: '🥥', badge: 'Mais Vendido', ativo: true },
  { _id: '2', nome: 'Casadinho de Goiaba', descricao: 'Doce de leite e goiaba em camadas', preco: 6.50, categoria: 'goiaba', imagem: '🍬', badge: '', ativo: true },
  { _id: '3', nome: 'Bolo de Côco', descricao: 'Bolo molhadinho de côco fresco', preco: 45.00, categoria: 'bolo', imagem: '🎂', badge: 'Família', ativo: true },
];

let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [
  { _id: 'ped1', cliente: 'Maria Silva', telefone: '79999123456', itens: [{ nome: 'Cocada Caramelada', quantidade: 5 }], totalPix: 40.00, formaPagamento: 'pix', status: 'pendente', createdAt: new Date().toISOString() },
  { _id: 'ped2', cliente: 'João Santos', telefone: '79999876543', itens: [{ nome: 'Bolo de Côco', quantidade: 1 }], totalPix: 45.00, formaPagamento: 'cartao', status: 'preparando', createdAt: new Date().toISOString() },
];

let editingId = null;
let currentFilter = 'todos';
let filaAtualIndex = 0;
let isFullscreen = false;

// Login
function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  if (username === 'admin' && password === 'aju2026') {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('app').classList.add('show');
    loadDashboard();
  } else {
    document.getElementById('loginError').textContent = 'Usuário ou senha incorretos';
  }
}

function logout() {
  document.getElementById('app').classList.remove('show');
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';
}

// Navegação
function showSection(section) {
  document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  
  document.getElementById(section).classList.add('active');
  event.target.closest('.nav-item').classList.add('active');
  
  if (section === 'dashboard') loadDashboard();
  if (section === 'pedidos') loadPedidos();
  if (section === 'fila') loadFila();
  if (section === 'cardapio') loadCardapio();
}

// Dashboard
function loadDashboard() {
  const total = pedidos.length;
  const receita = pedidos.reduce((acc, p) => acc + p.totalPix, 0);
  const pendentes = pedidos.filter(p => p.status === 'pendente').length;
  const entregues = pedidos.filter(p => p.status === 'entregue').length;
  
  document.getElementById('statTotal').textContent = total;
  document.getElementById('statReceita').textContent = 'R$ ' + receita.toFixed(2);
  document.getElementById('statPendentes').textContent = pendentes;
  document.getElementById('statEntregues').textContent = entregues;
  
  // Pedidos recentes
  const recentes = pedidos.slice(0, 5);
  const tbody = document.getElementById('recentOrders');
  tbody.innerHTML = recentes.map(p => `
    <tr>
      <td><strong>${p.cliente}</strong></td>
      <td>${p.itens.length} itens</td>
      <td>R$ ${p.totalPix.toFixed(2)}</td>
      <td><span class="badge badge-${p.status}">${p.status}</span></td>
      <td>${new Date(p.createdAt).toLocaleDateString()}</td>
    </tr>
  `).join('');
}

let selectedOrders = new Set();

// Pedidos
function loadPedidos() {
  const tbody = document.getElementById('ordersTable');
  const filtrados = currentFilter === 'todos' 
    ? pedidos 
    : pedidos.filter(p => p.status === currentFilter);
  
  tbody.innerHTML = filtrados.map(p => `
    <tr>
      <td><input type="checkbox" class="order-checkbox" value="${p._id}" ${selectedOrders.has(p._id) ? 'checked' : ''} onchange="toggleOrderSelection('${p._id}')"></td>
      <td><strong>${p.cliente}</strong><br><small>${p.telefone}</small></td>
      <td>${p.itens.map(i => `${i.nome} (${i.quantidade}x)`).join(', ')}</td>
      <td>R$ ${p.totalPix.toFixed(2)}</td>
      <td>${p.formaPagamento}</td>
      <td><span class="badge badge-${p.status}">${p.status}</span></td>
      <td>
        <select onchange="updateStatus('${p._id}', this.value)" style="padding: 6px; border-radius: 8px; border: 1px solid var(--border);">
          <option value="pendente" ${p.status === 'pendente' ? 'selected' : ''}>Pendente</option>
          <option value="preparando" ${p.status === 'preparando' ? 'selected' : ''}>Preparando</option>
          <option value="pronto" ${p.status === 'pronto' ? 'selected' : ''}>Pronto</option>
          <option value="entregue" ${p.status === 'entregue' ? 'selected' : ''}>Entregue</option>
          <option value="cancelado" ${p.status === 'cancelado' ? 'selected' : ''}>Cancelado</option>
        </select>
      </td>
    </tr>
  `).join('');
  
  updateSelectedCount();
}

function filterOrders(status) {
  currentFilter = status;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  loadPedidos();
}

function updateStatus(id, status) {
  const pedido = pedidos.find(p => p._id === id);
  if (pedido) {
    pedido.status = status;
    localStorage.setItem('pedidos', JSON.stringify(pedidos));
    loadDashboard();
  }
}

// ========== SELEÇÃO E EXCLUSÃO DE PEDIDOS ==========
function toggleOrderSelection(id) {
  if (selectedOrders.has(id)) {
    selectedOrders.delete(id);
  } else {
    selectedOrders.add(id);
  }
  updateSelectedCount();
}

function toggleSelectAllOrders() {
  const filtrados = currentFilter === 'todos' 
    ? pedidos 
    : pedidos.filter(p => p.status === currentFilter);
  
  const allSelected = filtrados.every(p => selectedOrders.has(p._id));
  
  if (allSelected) {
    // Desmarcar todos
    filtrados.forEach(p => selectedOrders.delete(p._id));
  } else {
    // Marcar todos
    filtrados.forEach(p => selectedOrders.add(p._id));
  }
  
  loadPedidos();
}

function updateSelectedCount() {
  const count = selectedOrders.size;
  document.getElementById('selectedCount').textContent = `(${count} selecionados)`;
  document.getElementById('btnExcluirSelecionados').style.display = count > 0 ? 'inline-block' : 'none';
  
  // Atualizar checkbox "Selecionar todos"
  const filtrados = currentFilter === 'todos' 
    ? pedidos 
    : pedidos.filter(p => p.status === currentFilter);
  const allSelected = filtrados.length > 0 && filtrados.every(p => selectedOrders.has(p._id));
  document.getElementById('selectAllOrders').checked = allSelected;
  document.getElementById('selectAllHeader').checked = allSelected;
}

function excluirPedidosSelecionados() {
  const count = selectedOrders.size;
  if (count === 0) {
    alert('Nenhum pedido selecionado');
    return;
  }
  
  if (!confirm(`Tem certeza que deseja excluir ${count} pedido(s)?`)) {
    return;
  }
  
  // Remover pedidos selecionados
  pedidos = pedidos.filter(p => !selectedOrders.has(p._id));
  selectedOrders.clear();
  
  localStorage.setItem('pedidos', JSON.stringify(pedidos));
  loadPedidos();
  loadDashboard();
  
  alert(`${count} pedido(s) excluído(s) com sucesso!`);
}

// ========== GERAÇÃO DE PDF ==========
function gerarPDFPedidos() {
  const filtrados = currentFilter === 'todos' 
    ? pedidos 
    : pedidos.filter(p => p.status === currentFilter);
  
  if (filtrados.length === 0) {
    alert('Nenhum pedido para gerar PDF');
    return;
  }
  
  // Criar conteúdo HTML para impressão
  const dataAtual = new Date().toLocaleDateString('pt-BR');
  const statusFiltro = currentFilter === 'todos' ? 'Todos' : currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1);
  
  const totalGeral = filtrados.reduce((acc, p) => acc + p.totalPix, 0);
  
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Extrato de Pedidos - Doce Aracaju</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
        h1 { color: #FF1493; text-align: center; margin-bottom: 10px; }
        .subtitle { text-align: center; color: #666; margin-bottom: 30px; }
        .info { margin-bottom: 30px; padding: 15px; background: #f5f5f5; border-radius: 8px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #FF1493; color: white; padding: 12px; text-align: left; }
        td { padding: 12px; border-bottom: 1px solid #ddd; }
        tr:nth-child(even) { background: #f9f9f9; }
        .badge { padding: 4px 10px; border-radius: 12px; font-size: 0.85rem; font-weight: 600; }
        .badge-pendente { background: #fff3cd; color: #856404; }
        .badge-preparando { background: #cce5ff; color: #004085; }
        .badge-pronto { background: #d4edda; color: #155724; }
        .badge-entregue { background: #d1ecf1; color: #0c5460; }
        .badge-cancelado { background: #f8d7da; color: #721c24; }
        .total { margin-top: 30px; text-align: right; font-size: 1.3rem; font-weight: bold; color: #FF1493; }
        .footer { margin-top: 50px; text-align: center; color: #999; font-size: 0.9rem; }
        @media print {
          body { padding: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>🍰 Doce Aracaju</h1>
      <p class="subtitle">Extrato de Pedidos</p>
      
      <div class="info">
        <strong>Data:</strong> ${dataAtual}<br>
        <strong>Filtro:</strong> ${statusFiltro}<br>
        <strong>Total de Pedidos:</strong> ${filtrados.length}
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Telefone</th>
            <th>Itens</th>
            <th>Total</th>
            <th>Pagamento</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  filtrados.forEach(p => {
    html += `
      <tr>
        <td><strong>${p.cliente}</strong></td>
        <td>${p.telefone}</td>
        <td>${p.itens.map(i => `${i.nome} (${i.quantidade}x)`).join(', ')}</td>
        <td>R$ ${p.totalPix.toFixed(2)}</td>
        <td>${p.formaPagamento.toUpperCase()}</td>
        <td><span class="badge badge-${p.status}">${p.status.toUpperCase()}</span></td>
      </tr>
    `;
  });
  
  html += `
        </tbody>
      </table>
      
      <div class="total">
        Total Geral: R$ ${totalGeral.toFixed(2)}
      </div>
      
      <div class="footer">
        Doce Aracaju - Doces Típicos Artesanais<br>
        Tel: (79) 99146-6257
      </div>
      
      <div class="no-print" style="margin-top: 30px; text-align: center;">
        <button onclick="window.print()" style="padding: 15px 40px; font-size: 1.1rem; background: #FF1493; color: white; border: none; border-radius: 12px; cursor: pointer;">
          🖨️ Imprimir / Salvar como PDF
        </button>
      </div>
    </body>
    </html>
  `;
  
  // Abrir em nova janela
  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
}

// Cardápio
function loadCardapio() {
  const grid = document.getElementById('cardapioGrid');
  grid.innerHTML = doces.map(d => `
    <div class="card">
      <div class="card-img">${d.imagem}</div>
      <div class="card-body">
        <h4>${d.nome} ${d.badge ? `<span style="font-size: 0.75rem; background: var(--gold-light); color: var(--gold); padding: 4px 8px; border-radius: 12px;">${d.badge}</span>` : ''}</h4>
        <p>${d.descricao}</p>
        <div class="card-price">R$ ${d.preco.toFixed(2)}</div>
        <div class="card-actions">
          <button class="btn-sm btn-edit" onclick="editDoce('${d._id}')">Editar</button>
          <button class="btn-sm btn-delete" onclick="deleteDoce('${d._id}')">Remover</button>
        </div>
      </div>
    </div>
  `).join('');
}

// Modal
function openModal() {
  editingId = null;
  document.getElementById('modalTitle').textContent = 'Novo Doce';
  document.getElementById('doceNome').value = '';
  document.getElementById('doceDescricao').value = '';
  document.getElementById('docePreco').value = '';
  document.getElementById('doceCategoria').value = 'cocada';
  document.getElementById('doceImagem').value = '';
  document.getElementById('doceBadge').value = '';
  document.getElementById('modal').classList.add('show');
}

function closeModal() {
  document.getElementById('modal').classList.remove('show');
}

function editDoce(id) {
  const doce = doces.find(d => d._id === id);
  if (!doce) return;
  
  editingId = id;
  document.getElementById('modalTitle').textContent = 'Editar Doce';
  document.getElementById('doceNome').value = doce.nome;
  document.getElementById('doceDescricao').value = doce.descricao;
  document.getElementById('docePreco').value = doce.preco;
  document.getElementById('doceCategoria').value = doce.categoria;
  document.getElementById('doceImagem').value = doce.imagem;
  document.getElementById('doceBadge').value = doce.badge;
  document.getElementById('modal').classList.add('show');
}

function saveDoce() {
  const nome = document.getElementById('doceNome').value;
  const descricao = document.getElementById('doceDescricao').value;
  const preco = parseFloat(document.getElementById('docePreco').value);
  const categoria = document.getElementById('doceCategoria').value;
  const imagem = document.getElementById('doceImagem').value || '🧁';
  const badge = document.getElementById('doceBadge').value;
  
  if (!nome || !descricao || !preco) {
    alert('Preencha todos os campos obrigatórios');
    return;
  }
  
  if (editingId) {
    const index = doces.findIndex(d => d._id === editingId);
    doces[index] = { ...doces[index], nome, descricao, preco, categoria, imagem, badge };
  } else {
    const novo = { _id: Date.now().toString(), nome, descricao, preco, categoria, imagem, badge, ativo: true };
    doces.push(novo);
  }
  
  localStorage.setItem('doces', JSON.stringify(doces));
  closeModal();
  loadCardapio();
}

function deleteDoce(id) {
  if (!confirm('Tem certeza que deseja remover este doce?')) return;
  doces = doces.filter(d => d._id !== id);
  localStorage.setItem('doces', JSON.stringify(doces));
  loadCardapio();
}

// ========== FILA DE ATENDIMENTO ==========
function loadFila() {
  // Filtrar pedidos pendentes e preparando, ordenados por data (mais antigos primeiro)
  const filaPedidos = pedidos
    .filter(p => p.status === 'pendente' || p.status === 'preparando')
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  
  const filaList = document.getElementById('filaList');
  const filaVazia = document.getElementById('filaVazia');
  const filaInfo = document.getElementById('filaInfo');
  
  if (filaPedidos.length === 0) {
    filaList.innerHTML = '';
    filaVazia.classList.add('show');
    filaInfo.textContent = 'Nenhum pedido na fila';
    return;
  }
  
  filaVazia.classList.remove('show');
  filaInfo.textContent = `${filaPedidos.length} pedido(s) aguardando`;
  
  // Reset index se for maior que o tamanho da fila
  if (filaAtualIndex >= filaPedidos.length) {
    filaAtualIndex = 0;
  }
  
  filaList.innerHTML = filaPedidos.map((p, index) => {
    const isAtual = index === filaAtualIndex;
    const numeroPedido = String(index + 1).padStart(2, '0');
    
    return `
      <div class="fila-card ${isAtual ? 'atual' : ''}">
        <div class="fila-numero">${numeroPedido}</div>
        <div class="fila-info">
          <h4>${p.cliente}</h4>
          <p>📞 ${p.telefone} | 💰 R$ ${p.totalPix.toFixed(2)} | ${p.formaPagamento.toUpperCase()}</p>
          <div class="fila-itens">
            ${p.itens.map(i => `<span class="fila-item">${i.nome} (${i.quantidade}x)</span>`).join('')}
          </div>
        </div>
        <div class="fila-status">${isAtual ? '🔥 ATUAL' : p.status.toUpperCase()}</div>
      </div>
    `;
  }).join('');
}

function proximoPedido() {
  const filaPedidos = pedidos
    .filter(p => p.status === 'pendente' || p.status === 'preparando')
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  
  if (filaPedidos.length === 0) {
    alert('Nenhum pedido na fila!');
    return;
  }
  
  // Marcar pedido atual como pronto
  if (filaAtualIndex < filaPedidos.length) {
    const pedidoAtual = filaPedidos[filaAtualIndex];
    const pedidoOriginal = pedidos.find(p => p._id === pedidoAtual._id);
    if (pedidoOriginal) {
      pedidoOriginal.status = 'pronto';
    }
  }
  
  // Avançar para o próximo
  filaAtualIndex++;
  
  // Se chegou ao fim, volta para o início
  if (filaAtualIndex >= filaPedidos.length) {
    filaAtualIndex = 0;
    // Verifica se ainda há pedidos (pode ter marcado todos como pronto)
    const pedidosRestantes = pedidos.filter(p => p.status === 'pendente' || p.status === 'preparando');
    if (pedidosRestantes.length === 0) {
      filaAtualIndex = 0;
    }
  }
  
  localStorage.setItem('pedidos', JSON.stringify(pedidos));
  loadFila();
  
  // Som de notificação (opcional)
  const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVanu87plHQUuh9Dz2YU2Bhxqv+zplkcODVGm5O+4ZSAEMYrO89GFNwYdcfDr4ZdJDQtPp+XysWUeBjiS1/LNfi0GI33R8tOENAcdcPDs4phJDQxPqOXyxWUhBjqT1/PQfS4GI3/R8tSFNwYdcfDr4plHDAtQp+TwxmUgBDeNz/PShjYGHG/w7OKbRw0MTKjl8sZmIAU2jc7z1YU1Bhxw8OzhmUgNC1Go5fLFZSAFNo/M89CEMwYccPDs4plHDAtQqOXyxmUgBTeOz/PShjUHG3Dw7OKZRwwLUqjl8sZmIAU2js/z0oU1Bxtw8OzhmUcNC1Oo5fLFZSAFNo7P89GFNwYccPDs4plHDQtTqOXyxmUgBTeOz/PShjUHG3Dw7OKZRwwLU6jl8sVmIAU2j8/z1YU1Bxtw8OzhmUgNC1So5fLFZiAFN4/P89GFNwYccPDs4plIDAtUqOXyxWYgBTuPz/PRhdgYccPDs4plIDAtVKjl8sVmIAU7j8/z0YXYGHHDw7OKZSAwLVSo5fLFZiAFO4/P89GF2Bhxw8Ozi');
  audio.volume = 0.3;
  audio.play().catch(() => {});
}

function toggleFullscreenFila() {
  const filaSection = document.getElementById('fila');
  const btnFullscreen = document.querySelector('.btn-exit-fullscreen');
  
  if (!isFullscreen) {
    // Entrar em tela cheia
    filaSection.classList.add('fila-fullscreen');
    isFullscreen = true;
    
    // Atualizar texto do botão
    if (btnFullscreen) {
      btnFullscreen.innerHTML = '❌ Sair da Tela Cheia';
    }
    
    // Recarregar fila
    loadFila();
  } else {
    // Sair da tela cheia
    filaSection.classList.remove('fila-fullscreen');
    isFullscreen = false;
    
    // Atualizar texto do botão
    if (btnFullscreen) {
      btnFullscreen.innerHTML = '📺 Tela Cheia';
    }
  }
}

// Tecla ESC para sair do fullscreen
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isFullscreen) {
    toggleFullscreenFila();
  }
});

// Integração com API real (descomentar quando backend estiver pronto)
/*
async function fetchDoces() {
  const res = await fetch(`${API_URL}/doces/admin`);
  doces = await res.json();
  loadCardapio();
}

async function fetchPedidos() {
  const res = await fetch(`${API_URL}/pedidos`);
  pedidos = await res.json();
  loadDashboard();
}

async function saveDoceAPI() {
  const method = editingId ? 'PUT' : 'POST';
  const url = editingId ? `${API_URL}/doces/${editingId}` : `${API_URL}/doces`;
  
  const body = { nome, descricao, preco, categoria, imagem, badge };
  
  await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  
  await fetchDoces();
}
*/

// Tecla Enter no login
document.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && document.getElementById('loginScreen').style.display !== 'none') {
    login();
  }
});
