import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, LogOut, Package, DollarSign, Users, TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import type { Pedido } from '../types';

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'aju2026';

// Mock orders for demonstration
const mockPedidos: Pedido[] = [
  {
    id: 'PED-001',
    cliente: 'Maria Silva',
    dataEntrega: '2024-01-15',
    itens: [
      { id: 1, nome: 'Cocada Caramelada', preco: 8.00, quantidade: 5, imagem: '' },
      { id: 7, nome: 'Bolo Souza Leão', preco: 18.00, quantidade: 1, imagem: '' }
    ],
    totalPix: 58.00,
    totalCartao: 60.90,
    status: 'pendente',
    dataPedido: '2024-01-10'
  },
  {
    id: 'PED-002',
    cliente: 'João Santos',
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Credenciais inválidas');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
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

  const totalPedidos = mockPedidos.length;
  const totalReceita = mockPedidos.reduce((sum, p) => sum + p.totalPix, 0);
  const pedidosPendentes = mockPedidos.filter(p => p.status === 'pendente').length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-[#FFF0F5]">
      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="h-full flex items-center justify-center p-4"
          >
            <div className="glass-card p-8 w-full max-w-md">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF1493] to-[#D4AF37] flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h2 className="font-display text-2xl font-bold text-[#2D1B2E]">
                  Acesso Restrito
                </h2>
                <p className="text-sm text-[#2D1B2E]/60 mt-1">
                  Área exclusiva para administradores
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#2D1B2E] mb-1">
                    Usuário
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input-gourmet"
                    placeholder="Digite o usuário"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D1B2E] mb-1">
                    Senha
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-gourmet"
                    placeholder="Digite a senha"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-500 bg-red-50 p-2 rounded-lg">
                    {error}
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 btn-ghost"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                  >
                    Entrar
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full overflow-y-auto"
          >
            {/* Header */}
            <div className="glass-nav sticky top-0 z-10 px-6 py-4">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF1493] to-[#D4AF37] flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold text-[#2D1B2E]">
                      Dashboard
                    </h2>
                    <p className="text-xs text-[#2D1B2E]/60">
                      Bem-vindo, Administrador
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Sair</span>
                </button>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="max-w-7xl mx-auto p-6 space-y-6">
              {/* Stats Cards */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#FF1493]/10 flex items-center justify-center">
                      <Package className="w-6 h-6 text-[#FF1493]" />
                    </div>
                    <span className="text-xs text-[#2D1B2E]/40 bg-white/50 px-2 py-1 rounded-full">
                      Total
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-[#2D1B2E]">{totalPedidos}</p>
                  <p className="text-sm text-[#2D1B2E]/60">Pedidos recebidos</p>
                </div>

                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-[#D4AF37]" />
                    </div>
                    <span className="text-xs text-[#2D1B2E]/40 bg-white/50 px-2 py-1 rounded-full">
                      Receita
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-[#2D1B2E]">
                    {formatCurrency(totalReceita)}
                  </p>
                  <p className="text-sm text-[#2D1B2E]/60">Total em pedidos</p>
                </div>

                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                      <Users className="w-6 h-6 text-amber-600" />
                    </div>
                    <span className="text-xs text-[#2D1B2E]/40 bg-white/50 px-2 py-1 rounded-full">
                      Pendentes
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-[#2D1B2E]">{pedidosPendentes}</p>
                  <p className="text-sm text-[#2D1B2E]/60">Aguardando preparo</p>
                </div>
              </div>

              {/* Orders Table */}
              <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-[#FF1493]/10">
                  <h3 className="font-display text-xl font-bold text-[#2D1B2E]">
                    Pedidos Recentes
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/40">
                      <tr>
                        <th className="text-left text-xs font-semibold text-[#2D1B2E]/60 uppercase tracking-wider px-6 py-3">
                          Pedido
                        </th>
                        <th className="text-left text-xs font-semibold text-[#2D1B2E]/60 uppercase tracking-wider px-6 py-3">
                          Cliente
                        </th>
                        <th className="text-left text-xs font-semibold text-[#2D1B2E]/60 uppercase tracking-wider px-6 py-3">
                          Entrega
                        </th>
                        <th className="text-left text-xs font-semibold text-[#2D1B2E]/60 uppercase tracking-wider px-6 py-3">
                          Total
                        </th>
                        <th className="text-left text-xs font-semibold text-[#2D1B2E]/60 uppercase tracking-wider px-6 py-3">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#FF1493]/5">
                      {mockPedidos.map((pedido) => (
                        <tr key={pedido.id} className="hover:bg-white/30 transition-colors">
                          <td className="px-6 py-4 font-mono text-sm text-[#2D1B2E]">
                            {pedido.id}
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium text-[#2D1B2E]">{pedido.cliente}</p>
                            <p className="text-xs text-[#2D1B2E]/50">
                              {pedido.itens.length} itens
                            </p>
                          </td>
                          <td className="px-6 py-4 text-sm text-[#2D1B2E]/70">
                            {new Date(pedido.dataEntrega).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-semibold text-[#FF1493]">
                              {formatCurrency(pedido.totalPix)}
                            </p>
                            <p className="text-xs text-[#2D1B2E]/50">
                              Cartão: {formatCurrency(pedido.totalCartao)}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(pedido.status)}
                              <span className="text-sm font-medium text-[#2D1B2E]/70 capitalize">
                                {getStatusLabel(pedido.status)}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
