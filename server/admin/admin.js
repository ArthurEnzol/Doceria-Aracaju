// Configuração da API
const API_URL = 'http://localhost:5000/api';

// Token JWT (armazenado em memória - mais seguro que localStorage)
let authToken = localStorage.getItem('authToken') || null;
let tokenExpiry = localStorage.getItem('tokenExpiry') || null;

// Dados em memória (sincronizados com backend)
let doces = [];
let pedidos = [];

// ========== PERSISTÊNCIA LOCAL (LocalStorage) ==========
const STORAGE_KEYS = {
  DOCES: 'doceria_doces',
  PEDIDOS: 'doceria_pedidos',
  CATEGORIAS: 'doceria_categorias'
};

// Salvar doces no LocalStorage
function saveDocesToStorage() {
  try {
    localStorage.setItem(STORAGE_KEYS.DOCES, JSON.stringify(doces));
    console.log('Doces salvos no LocalStorage:', doces.length);
  } catch (err) {
    console.error('Erro ao salvar doces:', err);
  }
}

// Carregar doces do LocalStorage
function loadDocesFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.DOCES);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log('Doces carregados do LocalStorage:', parsed.length);
        return parsed;
      }
    }
  } catch (err) {
    console.error('Erro ao carregar doces do storage:', err);
  }
  return null;
}

// Salvar pedidos no LocalStorage
function savePedidosToStorage() {
  try {
    localStorage.setItem(STORAGE_KEYS.PEDIDOS, JSON.stringify(pedidos));
  } catch (err) {
    console.error('Erro ao salvar pedidos:', err);
  }
}

// Carregar pedidos do LocalStorage
function loadPedidosFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PEDIDOS);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Erro ao carregar pedidos do storage:', err);
  }
  return null;
}

let editingId = null;
let currentFilter = 'todos';
let filaAtualIndex = 0;
let isFullscreen = false;
let selectedOrders = new Set();

// ========== FUNÇÕES DE API SEGURAS ==========

// Helper para requisições autenticadas
async function apiRequest(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  // Adicionar token se existir
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    if (response.status === 401) {
      // Token expirado ou inválido
      logout();
      throw new Error('Sessão expirada. Faça login novamente.');
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro na requisição');
    }
    
    return await response.json();
  } catch (err) {
    console.error('API Error:', err);
    throw err;
  }
}

// Verificar se token ainda é válido
function isTokenValid() {
  if (!authToken || !tokenExpiry) return false;
  return new Date().getTime() < parseInt(tokenExpiry);
}

// Login seguro via API
async function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  try {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    
    // Salvar token (em memória e localStorage para persistência entre reloads)
    authToken = data.token;
    const expiryTime = new Date().getTime() + (8 * 60 * 60 * 1000); // 8 horas
    tokenExpiry = expiryTime;
    
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('tokenExpiry', expiryTime);
    
    // Mostrar app e carregar dados
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('app').classList.add('show');
    
    await loadAllData();
    
  } catch (err) {
    document.getElementById('loginError').textContent = err.message || 'Usuário ou senha incorretos';
  }
}

function logout() {
  authToken = null;
  tokenExpiry = null;
  localStorage.removeItem('authToken');
  localStorage.removeItem('tokenExpiry');
  
  document.getElementById('app').classList.remove('show');
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';
}

// Carregar todos os dados do backend
async function loadAllData() {
  try {
    await Promise.all([
      loadDocesFromAPI(),
      loadPedidosFromAPI(),
      loadCategorias()
    ]);
    loadDashboard();
  } catch (err) {
    console.error('Erro ao carregar dados:', err);
  }
}

async function loadDocesFromAPI() {
  try {
    // Tentar carregar da API primeiro
    const apiDoces = await apiRequest('/admin/doces');
    if (Array.isArray(apiDoces) && apiDoces.length > 0) {
      doces = apiDoces;
      // Sincronizar com LocalStorage como backup
      saveDocesToStorage();
    } else {
      // Se API retornar vazio, tentar carregar do LocalStorage
      const storedDoces = loadDocesFromStorage();
      if (storedDoces) {
        doces = storedDoces;
      }
    }
    loadCardapio();
  } catch (err) {
    console.error('Erro ao carregar doces da API:', err);
    // Em caso de erro na API, carregar do LocalStorage
    const storedDoces = loadDocesFromStorage();
    if (storedDoces) {
      doces = storedDoces;
      loadCardapio();
    }
  }
}

async function loadPedidosFromAPI() {
  try {
    // Tentar carregar da API primeiro
    const apiPedidos = await apiRequest('/admin/pedidos');
    if (Array.isArray(apiPedidos) && apiPedidos.length > 0) {
      pedidos = apiPedidos;
      // Sincronizar com LocalStorage como backup
      savePedidosToStorage();
    } else {
      // Se API retornar vazio, tentar carregar do LocalStorage
      const storedPedidos = loadPedidosFromStorage();
      if (storedPedidos) {
        pedidos = storedPedidos;
      }
    }
    loadPedidos();
  } catch (err) {
    console.error('Erro ao carregar pedidos da API:', err);
    // Em caso de erro na API, carregar do LocalStorage
    const storedPedidos = loadPedidosFromStorage();
    if (storedPedidos) {
      pedidos = storedPedidos;
      loadPedidos();
    }
  }
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
  if (section === 'gerenciar-pedidos') loadGerenciarPedidos();
  if (section === 'cardapio') loadCardapio();
  if (section === 'categorias') loadCategorias();
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

async function updateStatus(id, status) {
  try {
    await apiRequest(`/admin/pedidos/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    // Recarregar pedidos do backend
    await loadPedidosFromAPI();
    loadDashboard();
  } catch (err) {
    alert('Erro ao atualizar status: ' + err.message);
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
    filtrados.forEach(p => selectedOrders.delete(p._id));
  } else {
    filtrados.forEach(p => selectedOrders.add(p._id));
  }
  
  loadPedidos();
}

function updateSelectedCount() {
  const count = selectedOrders.size;
  document.getElementById('selectedCount').textContent = `(${count} selecionados)`;
  document.getElementById('btnExcluirSelecionados').style.display = count > 0 ? 'inline-block' : 'none';
  
  const filtrados = currentFilter === 'todos' 
    ? pedidos 
    : pedidos.filter(p => p.status === currentFilter);
  const allSelected = filtrados.length > 0 && filtrados.every(p => selectedOrders.has(p._id));
  document.getElementById('selectAllOrders').checked = allSelected;
  document.getElementById('selectAllHeader').checked = allSelected;
}

async function excluirPedidosSelecionados() {
  const count = selectedOrders.size;
  if (count === 0) {
    alert('Nenhum pedido selecionado');
    return;
  }
  
  if (!confirm(`Tem certeza que deseja excluir ${count} pedido(s)?`)) {
    return;
  }
  
  try {
    await apiRequest('/admin/pedidos/batch-delete', {
      method: 'POST',
      body: JSON.stringify({ ids: Array.from(selectedOrders) })
    });
    
    selectedOrders.clear();
    await loadPedidosFromAPI();
    loadDashboard();
    
    alert(`${count} pedido(s) excluído(s) com sucesso!`);
  } catch (err) {
    alert('Erro ao excluir pedidos: ' + err.message);
  }
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
      <div class="card-img" style="height: 140px; overflow: hidden; position: relative; background: linear-gradient(135deg, var(--pink-light), var(--gold-light));">
        <img src="${d.imagem}" alt="${d.nome}" style="width: 100%; height: 100%; object-fit: cover; object-position: center;" />
      </div>
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
  document.getElementById('doceImagem').value = '';
  document.getElementById('doceBadge').value = '';
  populateCategoriaSelect();
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
  document.getElementById('doceImagem').value = doce.imagem;
  document.getElementById('doceBadge').value = doce.badge;
  populateCategoriaSelect();
  document.getElementById('doceCategoria').value = doce.categoria;
  document.getElementById('modal').classList.add('show');
}

async function saveDoce() {
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
  
  try {
    if (editingId) {
      await apiRequest(`/admin/doces/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify({ nome, descricao, preco, categoria, imagem, badge })
      });
    } else {
      await apiRequest('/admin/doces', {
        method: 'POST',
        body: JSON.stringify({ nome, descricao, preco, categoria, imagem, badge })
      });
    }
    
    await loadDocesFromAPI();
    // Persistir no LocalStorage após alteração
    saveDocesToStorage();
    closeModal();
  } catch (err) {
    alert('Erro ao salvar: ' + err.message);
  }
}

async function deleteDoce(id) {
  if (!confirm('Tem certeza que deseja remover este doce?')) return;
  
  try {
    await apiRequest(`/admin/doces/${id}`, {
      method: 'DELETE'
    });
    await loadDocesFromAPI();
    // Persistir no LocalStorage após exclusão
    saveDocesToStorage();
  } catch (err) {
    alert('Erro ao remover: ' + err.message);
  }
}

// ========== GERENCIAR CATEGORIAS ==========
let categorias = [];
let categoriaEditingId = null;

async function loadCategorias() {
  try {
    categorias = await apiRequest('/admin/categorias');
    renderCategoriasTable();
    populateCategoriaSelect();
  } catch (err) {
    console.error('Erro ao carregar categorias:', err);
  }
}

function populateCategoriaSelect() {
  const select = document.getElementById('doceCategoria');
  if (!select) return;
  
  select.innerHTML = categorias.map(c => 
    `<option value="${c.nome}">${c.icone || '📦'} ${c.nome}</option>`
  ).join('');
}

function renderCategoriasTable() {
  const tbody = document.getElementById('categoriasTable');
  if (!tbody) return;
  
  tbody.innerHTML = categorias.map(c => {
    const itensCount = doces.filter(d => d.categoria === c.nome).length;
    return `
      <tr>
        <td style="font-size: 1.5rem;">${c.icone || '📦'}</td>
        <td><strong>${c.nome}</strong></td>
        <td>
          <span style="display: inline-block; width: 24px; height: 24px; border-radius: 50%; background: ${c.cor || '#FF1493'};"></span>
        </td>
        <td>${c.ordem || 0}</td>
        <td>${itensCount} item(s)</td>
        <td>
          <button class="btn-sm btn-edit" onclick="editarCategoria('${c._id}')">Editar</button>
          <button class="btn-sm btn-delete" onclick="removerCategoria('${c._id}')">Remover</button>
        </td>
      </tr>
    `;
  }).join('');
}

function limparFormCategoria() {
  categoriaEditingId = null;
  document.getElementById('categoriaFormTitle').textContent = 'Nova Categoria';
  document.getElementById('catNome').value = '';
  document.getElementById('catIcone').value = '';
  document.getElementById('catCor').value = '#FF1493';
  document.getElementById('catOrdem').value = '';
}

async function salvarCategoria() {
  const nome = document.getElementById('catNome').value.trim();
  const icone = document.getElementById('catIcone').value.trim();
  const cor = document.getElementById('catCor').value;
  const ordem = parseInt(document.getElementById('catOrdem').value) || categorias.length + 1;
  
  if (!nome) {
    alert('Nome da categoria é obrigatório');
    return;
  }
  
  const categoriaData = { nome, icone, cor, ordem };
  
  try {
    if (categoriaEditingId) {
      // Editar categoria existente
      const result = await apiRequest(`/admin/categorias/${categoriaEditingId}`, {
        method: 'PUT',
        body: JSON.stringify(categoriaData)
      });
      
      // Se o nome mudou, os doces já foram atualizados no backend
      // Precisamos recarregar os doces para refletir as mudanças
      if (result.message && result.message.includes('atualizados automaticamente')) {
        await loadDocesFromAPI();
      }
      
      alert('Categoria atualizada com sucesso!');
    } else {
      // Criar nova categoria
      await apiRequest('/admin/categorias', {
        method: 'POST',
        body: JSON.stringify(categoriaData)
      });
      alert('Categoria criada com sucesso!');
    }
    
    limparFormCategoria();
    await loadCategorias();
  } catch (err) {
    alert('Erro ao salvar categoria: ' + err.message);
  }
}

function editarCategoria(id) {
  const categoria = categorias.find(c => c._id === id);
  if (!categoria) return;
  
  categoriaEditingId = id;
  document.getElementById('categoriaFormTitle').textContent = 'Editar Categoria';
  document.getElementById('catNome').value = categoria.nome;
  document.getElementById('catIcone').value = categoria.icone || '';
  document.getElementById('catCor').value = categoria.cor || '#FF1493';
  document.getElementById('catOrdem').value = categoria.ordem || '';
}

async function removerCategoria(id) {
  if (!confirm('Tem certeza que deseja remover esta categoria?\n\nOs itens desta categoria serão movidos para "Sem Categoria".')) return;
  
  try {
    await apiRequest(`/admin/categorias/${id}/permanente`, {
      method: 'DELETE'
    });
    
    // Recarregar doces pois as categorias deles podem ter mudado
    await loadDocesFromAPI();
    await loadCategorias();
    
    alert('Categoria removida com sucesso!');
  } catch (err) {
    alert('Erro ao remover categoria: ' + err.message);
  }
}

// ========== GERENCIAR PEDIDOS ==========
let pedidoEditingId = null;
let pedidoItens = [];

function loadGerenciarPedidos() {
  const tbody = document.getElementById('gerenciarOrdersTable');
  tbody.innerHTML = pedidos.map(p => `
    <tr>
      <td><strong>${p.cliente}</strong></td>
      <td>${p.telefone}</td>
      <td>${p.itens.map(i => `${i.nome} (${i.quantidade}x)`).join(', ')}</td>
      <td>R$ ${p.totalPix.toFixed(2)}</td>
      <td>${p.formaPagamento}</td>
      <td><span class="badge badge-${p.status}">${p.status}</span></td>
      <td>
        <button class="btn-sm btn-edit" onclick="editarPedido('${p._id}')">Editar</button>
        <button class="btn-sm btn-delete" onclick="removerPedido('${p._id}')">Remover</button>
      </td>
    </tr>
  `).join('');
}

function adicionarItemPedido() {
  const container = document.getElementById('pedItensContainer');
  const div = document.createElement('div');
  div.style.cssText = 'display: flex; gap: 8px; align-items: center;';
  div.innerHTML = `
    <select class="item-nome" style="flex: 2; padding: 8px; border: 1px solid var(--border); border-radius: 8px;">
      ${doces.map(d => `<option value="${d._id}" data-preco="${d.preco}">${d.nome} - R$ ${d.preco.toFixed(2)}</option>`).join('')}
    </select>
    <input type="number" class="item-qtd" value="1" min="1" style="flex: 1; padding: 8px; border: 1px solid var(--border); border-radius: 8px; width: 60px;">
    <button onclick="this.parentElement.remove()" style="padding: 8px 12px; background: #ffebee; color: #c62828; border: none; border-radius: 8px; cursor: pointer;">×</button>
  `;
  container.appendChild(div);
}

function limparFormPedido() {
  pedidoEditingId = null;
  pedidoItens = [];
  document.getElementById('pedidoFormTitle').textContent = 'Novo Pedido';
  document.getElementById('pedCliente').value = '';
  document.getElementById('pedTelefone').value = '';
  document.getElementById('pedDataEntrega').value = '';
  document.getElementById('pedFormaPagamento').value = 'pix';
  document.getElementById('pedStatus').value = 'pendente';
  document.getElementById('pedItensContainer').innerHTML = '';
}

async function salvarPedido() {
  const cliente = document.getElementById('pedCliente').value;
  const telefone = document.getElementById('pedTelefone').value;
  const dataEntrega = document.getElementById('pedDataEntrega').value;
  const formaPagamento = document.getElementById('pedFormaPagamento').value;
  const status = document.getElementById('pedStatus').value;
  
  if (!cliente || !telefone) {
    alert('Preencha o nome do cliente e telefone');
    return;
  }
  
  // Coletar itens
  const itens = [];
  const container = document.getElementById('pedItensContainer');
  const rows = container.querySelectorAll('div');
  
  rows.forEach(row => {
    const select = row.querySelector('.item-nome');
    const qtd = row.querySelector('.item-qtd');
    if (select && qtd) {
      const option = select.selectedOptions[0];
      const doceId = select.value;
      const doce = doces.find(d => d._id === doceId);
      if (doce) {
        itens.push({
          id: parseInt(doce._id) || Date.now(),
          nome: doce.nome,
          preco: doce.preco,
          quantidade: parseInt(qtd.value),
          imagem: doce.imagem
        });
      }
    }
  });
  
  if (itens.length === 0) {
    alert('Adicione pelo menos um item ao pedido');
    return;
  }
  
  const totalPix = itens.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
  const totalCartao = totalPix * 1.05; // 5% de taxa no cartão
  
  const pedidoData = {
    cliente,
    telefone,
    dataEntrega,
    itens,
    totalPix,
    totalCartao,
    formaPagamento,
    status,
    observacoes: ''
  };
  
  try {
    if (pedidoEditingId) {
      // Editar pedido existente
      await apiRequest(`/admin/pedidos/${pedidoEditingId}`, {
        method: 'PUT',
        body: JSON.stringify(pedidoData)
      });
      alert('Pedido atualizado com sucesso!');
    } else {
      // Criar novo pedido
      await apiRequest('/admin/pedidos', {
        method: 'POST',
        body: JSON.stringify(pedidoData)
      });
      alert('Pedido criado com sucesso!');
    }
    
    limparFormPedido();
    await loadPedidosFromAPI();
    loadGerenciarPedidos();
    loadDashboard();
  } catch (err) {
    alert('Erro ao salvar pedido: ' + err.message);
  }
}

function editarPedido(id) {
  const pedido = pedidos.find(p => p._id === id);
  if (!pedido) return;
  
  pedidoEditingId = id;
  document.getElementById('pedidoFormTitle').textContent = 'Editar Pedido';
  document.getElementById('pedCliente').value = pedido.cliente;
  document.getElementById('pedTelefone').value = pedido.telefone;
  document.getElementById('pedDataEntrega').value = pedido.dataEntrega || '';
  document.getElementById('pedFormaPagamento').value = pedido.formaPagamento;
  document.getElementById('pedStatus').value = pedido.status;
  
  // Carregar itens
  const container = document.getElementById('pedItensContainer');
  container.innerHTML = '';
  pedido.itens.forEach(item => {
    const div = document.createElement('div');
    div.style.cssText = 'display: flex; gap: 8px; align-items: center;';
    div.innerHTML = `
      <select class="item-nome" style="flex: 2; padding: 8px; border: 1px solid var(--border); border-radius: 8px;">
        ${doces.map(d => `<option value="${d._id}" data-preco="${d.preco}" ${d.nome === item.nome ? 'selected' : ''}>${d.nome} - R$ ${d.preco.toFixed(2)}</option>`).join('')}
      </select>
      <input type="number" class="item-qtd" value="${item.quantidade}" min="1" style="flex: 1; padding: 8px; border: 1px solid var(--border); border-radius: 8px; width: 60px;">
      <button onclick="this.parentElement.remove()" style="padding: 8px 12px; background: #ffebee; color: #c62828; border: none; border-radius: 8px; cursor: pointer;">×</button>
    `;
    container.appendChild(div);
  });
  
  // Scroll para o formulário
  document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

async function removerPedido(id) {
  if (!confirm('Tem certeza que deseja remover este pedido?')) return;
  
  try {
    await apiRequest(`/admin/pedidos/${id}`, {
      method: 'DELETE'
    });
    await loadPedidosFromAPI();
    loadGerenciarPedidos();
    loadDashboard();
    alert('Pedido removido com sucesso!');
  } catch (err) {
    alert('Erro ao remover pedido: ' + err.message);
  }
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

async function proximoPedido() {
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
    try {
      await apiRequest(`/admin/pedidos/${pedidoAtual._id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'pronto' })
      });
    } catch (err) {
      console.error('Erro ao marcar como pronto:', err);
    }
  }
  
  // Avançar para o próximo
  filaAtualIndex++;
  
  if (filaAtualIndex >= filaPedidos.length) {
    filaAtualIndex = 0;
    const pedidosRestantes = pedidos.filter(p => p.status === 'pendente' || p.status === 'preparando');
    if (pedidosRestantes.length === 0) {
      filaAtualIndex = 0;
    }
  }
  
  await loadPedidosFromAPI();
  loadFila();
  
  // Som de notificação
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

// Verificar autenticação ao carregar página
document.addEventListener('DOMContentLoaded', async () => {
  // Verificar se há token válido
  if (authToken && isTokenValid()) {
    try {
      // Validar token com backend
      await apiRequest('/auth/verify');
      document.getElementById('loginScreen').style.display = 'none';
      document.getElementById('app').classList.add('show');
      await loadAllData();
    } catch (err) {
      // Token inválido, limpar e mostrar login
      logout();
    }
  }
});

// Tecla Enter no login
document.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && document.getElementById('loginScreen').style.display !== 'none') {
    login();
  }
});
