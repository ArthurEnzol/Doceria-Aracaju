import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, LogOut, Package, DollarSign, Users, TrendingUp, CheckCircle, Clock, AlertCircle, LayoutGrid, ClipboardList, ListOrdered, BookOpen, Tags, Upload, X, Plus, Edit2, Trash2, Image } from 'lucide-react';
import type { Pedido } from '../types';

type AdminTab = 'dashboard' | 'pedidos' | 'fila' | 'cardapio' | 'gerenciar' | 'categorias';

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'aju2026';

const mockPedidos: Pedido[] = [
  {
    id: 'PED-001',
    cliente: 'Maria Silva',
    dataEntrega: '2024-01-15',
    itens: [
      { id: 1, nome: 'Cocada Caramelada', preco: 8.00, quantidade: 5, imagem: '' },
      { id: 7, nome: 'Bolo Souza Leao', preco: 18.00, quantidade: 1, imagem: '' }
    ],
    totalPix: 58.00,
    totalCartao: 60.90,
    status: 'pendente',
    dataPedido: '2024-01-10'
  },
  {
    id: 'PED-002',
    cliente: 'Joao Santos',
    dataEntrega: '2024-01-12',
    itens: [
      { id: 2, nome: 'Casadinho de Goiaba', preco: 6.50, quantidade: 10, imagem: '' }
    ],
    totalPix: 65.00,
    totalCartao: 68.25,
    status: 'preparando',
    dataPedido: '2024-01-09'
  },
  {
    id: 'PED-003',
    cliente: 'Ana Paula',
    dataEntrega: '2024-01-08',
    itens: [
      { id: 9, nome: 'Brigadeiro de Caju', preco: 5.00, quantidade: 20, imagem: '' }
    ],
    totalPix: 100.00,
    totalCartao: 105.00,
    status: 'entregue',
    dataPedido: '2024-01-05'
  }
];

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  
  // Estado do Cardápio
  const [doces, setDoces] = useState([
    { id: '1', nome: 'Cocada Caramelada', descricao: 'Cocada de leite condensado com caramelo artesanal', preco: 8.00, categoria: 'Cocadas', imagem: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop', badge: 'Mais Vendido', ativo: true },
    { id: '2', nome: 'Casadinho de Goiaba', descricao: 'Classico casadinho de queijo coalho com goiaba cremosa', preco: 6.50, categoria: 'Tradicionais', imagem: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400&h=300&fit=crop', badge: '', ativo: true },
    { id: '3', nome: 'Maria Mole de Coco', descricao: 'Maria mole artesanal coberta com coco queimado', preco: 7.00, categoria: 'Tradicionais', imagem: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop', badge: '', ativo: true },
    { id: '4', nome: 'Pe de Moleque Premium', descricao: 'Pe de moleque com amendoim torrado e acucar mascavo', preco: 5.50, categoria: 'Tradicionais', imagem: 'https://images.unsplash.com/photo-1601056639638-63280d1fbaa5?w=400&h=300&fit=crop', badge: 'Novidade', ativo: true },
  ]);
  
  const [showForm, setShowForm] = useState(false);
  const [editingDoce, setEditingDoce] = useState<any>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    categoria: 'Tradicionais',
    imagem: '',
    badge: ''
  });
  
  // Estado de Upload
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Credenciais invalidas');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    setActiveTab('dashboard');
    onClose();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente':
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'preparando':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'pronto':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'entregue':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pendente: 'Pendente',
      preparando: 'Preparando',
      pronto: 'Pronto',
      entregue: 'Entregue'
    };
    return labels[status] || status;
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  // Handlers de Upload
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setUploadedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setFormData(prev => ({ ...prev, imagem: url }));
      }
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setFormData(prev => ({ ...prev, imagem: url }));
    }
  }, []);

  const handleUploadToServer = async () => {
    if (!uploadedFile) return;
    
    const formDataUpload = new FormData();
    formDataUpload.append('imagem', uploadedFile);
    
    try {
      const response = await fetch('http://localhost:5000/api/admin/upload', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('adminToken')
        },
        body: formDataUpload
      });
      
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, imagem: 'http://localhost:5000' + data.url }));
        setPreviewUrl('http://localhost:5000' + data.url);
        return data.url;
      }
    } catch (error) {
      console.error('Erro no upload:', error);
    }
    return null;
  };

  // Handlers do Cardápio
  const handleAddDoce = () => {
    setEditingDoce(null);
    setFormData({ nome: '', descricao: '', preco: '', categoria: 'Tradicionais', imagem: '', badge: '' });
    setPreviewUrl('');
    setUploadedFile(null);
    setShowForm(true);
  };

  const handleEditDoce = (doce: any) => {
    setEditingDoce(doce);
    setFormData({
      nome: doce.nome,
      descricao: doce.descricao,
      preco: doce.preco.toString(),
      categoria: doce.categoria,
      imagem: doce.imagem,
      badge: doce.badge
    });
    setPreviewUrl(doce.imagem);
    setUploadedFile(null);
    setShowForm(true);
  };

  const handleDeleteDoce = (id: string) => {
    setDoces(prev => prev.filter(d => d.id !== id));
  };

  const handleSubmitDoce = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let imagemUrl = formData.imagem;
    
    // Se tem arquivo para upload, faz o upload primeiro
    if (uploadedFile) {
      const uploadedUrl = await handleUploadToServer();
      if (uploadedUrl) {
        imagemUrl = 'http://localhost:5000' + uploadedUrl;
      }
    }
    
    const doceData = {
      id: editingDoce ? editingDoce.id : Date.now().toString(),
      nome: formData.nome,
      descricao: formData.descricao,
      preco: parseFloat(formData.preco) || 0,
      categoria: formData.categoria,
      imagem: imagemUrl,
      badge: formData.badge,
      ativo: true
    };
    
    if (editingDoce) {
      setDoces(prev => prev.map(d => d.id === editingDoce.id ? doceData : d));
    } else {
      setDoces(prev => [...prev, doceData]);
    }
    
    setShowForm(false);
    setEditingDoce(null);
    setUploadedFile(null);
    setPreviewUrl('');
  };

  const menuItems = [
    { id: 'dashboard' as AdminTab, label: 'Dashboard', icon: LayoutGrid },
    { id: 'pedidos' as AdminTab, label: 'Pedidos', icon: Package },
    { id: 'fila' as AdminTab, label: 'Fila de Atendimento', icon: ListOrdered },
    { id: 'cardapio' as AdminTab, label: 'Cardapio', icon: BookOpen },
    { id: 'gerenciar' as AdminTab, label: 'Gerenciar Pedidos', icon: ClipboardList },
    { id: 'categorias' as AdminTab, label: 'Categorias', icon: Tags },
  ];

  const totalPedidos = mockPedidos.length;
  const totalReceita = mockPedidos.reduce((sum, p) => sum + p.totalPix, 0);
  const pedidosPendentes = mockPedidos.filter(p => p.status === 'pendente').length;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#FF1493]/10 flex items-center justify-center">
                    <Package className="w-6 h-6 text-[#FF1493]" />
                  </div>
                  <span className="text-xs text-[#2D1B2E]/40 bg-white/50 px-2 py-1 rounded-full">Total</span>
                </div>
                <p className="text-3xl font-bold text-[#2D1B2E]">{totalPedidos}</p>
                <p className="text-sm text-[#2D1B2E]/60">Pedidos recebidos</p>
              </div>
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <span className="text-xs text-[#2D1B2E]/40 bg-white/50 px-2 py-1 rounded-full">Receita</span>
                </div>
                <p className="text-3xl font-bold text-[#2D1B2E]">{formatCurrency(totalReceita)}</p>
                <p className="text-sm text-[#2D1B2E]/60">Total em pedidos</p>
              </div>
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                    <Users className="w-6 h-6 text-amber-600" />
                  </div>
                  <span className="text-xs text-[#2D1B2E]/40 bg-white/50 px-2 py-1 rounded-full">Pendentes</span>
                </div>
                <p className="text-3xl font-bold text-[#2D1B2E]">{pedidosPendentes}</p>
                <p className="text-sm text-[#2D1B2E]/60">Aguardando preparo</p>
              </div>
            </div>
            <div className="glass-card overflow-hidden">
              <div className="p-6 border-b border-[#FF1493]/10">
                <h3 className="font-display text-xl font-bold text-[#2D1B2E]">Pedidos Recentes</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/40">
                    <tr>
                      <th className="text-left text-xs font-semibold text-[#2D1B2E]/60 uppercase tracking-wider px-6 py-3">Pedido</th>
                      <th className="text-left text-xs font-semibold text-[#2D1B2E]/60 uppercase tracking-wider px-6 py-3">Cliente</th>
                      <th className="text-left text-xs font-semibold text-[#2D1B2E]/60 uppercase tracking-wider px-6 py-3">Entrega</th>
                      <th className="text-left text-xs font-semibold text-[#2D1B2E]/60 uppercase tracking-wider px-6 py-3">Total</th>
                      <th className="text-left text-xs font-semibold text-[#2D1B2E]/60 uppercase tracking-wider px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#FF1493]/5">
                    {mockPedidos.map((pedido) => (
                      <tr key={pedido.id} className="hover:bg-white/30 transition-colors">
                        <td className="px-6 py-4 font-mono text-sm text-[#2D1B2E]">{pedido.id}</td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-[#2D1B2E]">{pedido.cliente}</p>
                          <p className="text-xs text-[#2D1B2E]/50">{pedido.itens.length} itens</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#2D1B2E]/70">{new Date(pedido.dataEntrega).toLocaleDateString('pt-BR')}</td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-[#FF1493]">{formatCurrency(pedido.totalPix)}</p>
                          <p className="text-xs text-[#2D1B2E]/50">Cartao: {formatCurrency(pedido.totalCartao)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(pedido.status)}
                            <span className="text-sm font-medium text-[#2D1B2E]/70 capitalize">{getStatusLabel(pedido.status)}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'pedidos':
        return <div className="glass-card p-8"><h3 className="font-display text-xl font-bold text-[#2D1B2E] mb-4">Todos os Pedidos</h3><p className="text-[#2D1B2E]/60">Lista completa de pedidos...</p></div>;
      case 'fila':
        return <div className="glass-card p-8"><h3 className="font-display text-xl font-bold text-[#2D1B2E] mb-4">Fila de Atendimento</h3><p className="text-[#2D1B2E]/60">Gerenciamento da fila...</p></div>;
      case 'cardapio':
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-bold text-[#2D1B2E]">Itens do Cardápio</h3>
              <button
                onClick={handleAddDoce}
                className="flex items-center gap-2 px-4 py-2 bg-[#FF1493] text-white rounded-xl hover:bg-[#FF1493]/90 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Novo Item</span>
              </button>
            </div>

            {/* Form */}
            {showForm && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-display text-lg font-bold text-[#2D1B2E]">
                    {editingDoce ? 'Editar Item' : 'Novo Item'}
                  </h4>
                  <button
                    onClick={() => setShowForm(false)}
                    className="p-2 hover:bg-[#FF1493]/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-[#2D1B2E]" />
                  </button>
                </div>

                <form onSubmit={handleSubmitDoce} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#2D1B2E] mb-1">Nome</label>
                      <input
                        type="text"
                        value={formData.nome}
                        onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                        className="input-gourmet w-full"
                        placeholder="Nome do doce"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#2D1B2E] mb-1">Preço (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.preco}
                        onChange={(e) => setFormData(prev => ({ ...prev, preco: e.target.value }))}
                        className="input-gourmet w-full"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#2D1B2E] mb-1">Descrição</label>
                    <textarea
                      value={formData.descricao}
                      onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                      className="input-gourmet w-full h-20 resize-none"
                      placeholder="Descrição do produto"
                      required
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#2D1B2E] mb-1">Categoria</label>
                      <select
                        value={formData.categoria}
                        onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                        className="input-gourmet w-full"
                      >
                        <option value="Tradicionais">Tradicionais</option>
                        <option value="Cocadas">Cocadas</option>
                        <option value="Especiais">Especiais</option>
                        <option value="Bolos">Bolos</option>
                        <option value="Brigadeiros">Brigadeiros</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#2D1B2E] mb-1">Badge (opcional)</label>
                      <input
                        type="text"
                        value={formData.badge}
                        onChange={(e) => setFormData(prev => ({ ...prev, badge: e.target.value }))}
                        className="input-gourmet w-full"
                        placeholder="Ex: Mais Vendido"
                      />
                    </div>
                  </div>

                  {/* Upload de Imagem */}
                  <div>
                    <label className="block text-sm font-medium text-[#2D1B2E] mb-1">Imagem</label>
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={isDragging 
                        ? 'border-2 border-dashed border-[#FF1493] bg-[#FF1493]/5 rounded-xl p-6 text-center transition-all cursor-pointer'
                        : 'border-2 border-dashed border-[#FF1493]/30 rounded-xl p-6 text-center hover:border-[#FF1493] transition-all cursor-pointer'
                      }
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      
                      {previewUrl ? (
                        <div className="space-y-3">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded-lg mx-auto"
                          />
                          <p className="text-sm text-[#2D1B2E]/60">
                            {uploadedFile ? uploadedFile.name : 'Imagem atual'}
                          </p>
                          <div className="flex gap-2 justify-center">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-3 py-1 text-sm bg-[#FF1493]/10 text-[#FF1493] rounded-lg hover:bg-[#FF1493]/20 transition-colors"
                            >
                              Alterar imagem
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewUrl('');
                                setUploadedFile(null);
                                setFormData(prev => ({ ...prev, imagem: '' }));
                              }}
                              className="px-3 py-1 text-sm bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              Remover
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div onClick={() => fileInputRef.current?.click()}>
                          <Image className="w-10 h-10 text-[#FF1493]/50 mx-auto mb-2" />
                          <p className="text-sm font-medium text-[#2D1B2E]">
                            Clique para selecionar ou arraste uma imagem
                          </p>
                          <p className="text-xs text-[#2D1B2E]/50 mt-1">
                            JPG, PNG ou WEBP (max 5MB)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="flex-1 btn-ghost"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 btn-primary"
                    >
                      {editingDoce ? 'Salvar Alterações' : 'Adicionar Item'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Grid de Itens */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {doces.map((doce) => (
                <motion.div
                  key={doce.id}
                  layout
                  className="glass-card overflow-hidden group flex flex-col"
                >
                  {/* Imagem Container - altura fixa reduzida */}
                  <div className="h-32 flex-shrink-0 relative overflow-hidden bg-gray-100">
                    <img
                      src={doce.imagem}
                      alt={doce.nome}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {doce.badge && (
                      <span className="absolute top-2 right-2 bg-[#D4AF37] text-white text-xs px-2 py-1 rounded-full shadow-md z-10">
                        {doce.badge}
                      </span>
                    )}
                  </div>
                  
                  {/* Conteúdo */}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <h4 className="font-display font-bold text-[#2D1B2E] text-sm leading-tight">{doce.nome}</h4>
                      <span className="text-[#FF1493] font-bold text-sm whitespace-nowrap">R$ {doce.preco.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-[#2D1B2E]/60 line-clamp-2 mb-3 flex-1">{doce.descricao}</p>
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#FF1493]/10">
                      <span className="text-xs text-[#2D1B2E]/50 bg-white/50 px-2 py-1 rounded-full">
                        {doce.categoria}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditDoce(doce)}
                          className="p-2 hover:bg-[#FF1493]/10 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4 text-[#FF1493]" />
                        </button>
                        <button
                          onClick={() => handleDeleteDoce(doce.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remover"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );
      case 'gerenciar':
        return <div className="glass-card p-8"><h3 className="font-display text-xl font-bold text-[#2D1B2E] mb-4">Gerenciar Pedidos</h3><p className="text-[#2D1B2E]/60">Ferramentas de gerenciamento...</p></div>;
      case 'categorias':
        return <div className="glass-card p-8"><h3 className="font-display text-xl font-bold text-[#2D1B2E] mb-4">Categorias</h3><p className="text-[#2D1B2E]/60">Gerenciamento de categorias...</p></div>;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-[#FFF0F5]">
      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <motion.div key="login" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full flex items-center justify-center p-4">
            <div className="glass-card p-8 w-full max-w-md">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF1493] to-[#D4AF37] flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h2 className="font-display text-2xl font-bold text-[#2D1B2E]">Acesso Restrito</h2>
                <p className="text-sm text-[#2D1B2E]/60 mt-1">Area exclusiva para administradores</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#2D1B2E] mb-1">Usuario</label>
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="input-gourmet" placeholder="Digite o usuario" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D1B2E] mb-1">Senha</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-gourmet" placeholder="Digite a senha" />
                </div>
                {error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded-lg">{error}</p>}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={onClose} className="flex-1 btn-ghost">Voltar</button>
                  <button type="submit" className="flex-1 btn-primary">Entrar</button>
                </div>
              </form>
            </div>
          </motion.div>
        ) : (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex">
            {/* Sidebar */}
            <div className="w-64 bg-white/80 backdrop-blur-md border-r border-[#FF1493]/10 flex flex-col">
              <div className="p-6 border-b border-[#FF1493]/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF1493] to-[#D4AF37] flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-bold text-[#2D1B2E]">Doce Aracaju</h2>
                    <p className="text-xs text-[#2D1B2E]/60">Painel Admin</p>
                  </div>
                </div>
              </div>
              <nav className="flex-1 p-4 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={isActive 
                        ? 'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-all text-[#FF1493] bg-[#FF1493]/10'
                        : 'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-all text-[#2D1B2E]/70 hover:text-[#FF1493] hover:bg-[#FF1493]/5'
                      }
                    >
                      <Icon className={isActive ? 'w-5 h-5 text-[#FF1493]' : 'w-5 h-5 text-[#2D1B2E]/50'} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
              <div className="p-4 border-t border-[#FF1493]/10">
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium text-red-500 hover:bg-red-50 transition-colors">
                  <LogOut className="w-5 h-5" />
                  <span>Sair</span>
                </button>
              </div>
            </div>
            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="glass-nav sticky top-0 z-10 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold text-[#2D1B2E]">{menuItems.find(item => item.id === activeTab)?.label}</h2>
                  <p className="text-sm text-[#2D1B2E]/60">Bem-vindo, Administrador</p>
                </div>
              </div>
              <div className="p-6">{renderContent()}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

