import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag, Send, Trash2, Calendar, User, CreditCard, Banknote } from 'lucide-react';
import type { CartItem } from '../types';
import { WHATSAPP_NUMBER } from '../data/doces';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
  subtotal: number;
  totalPix: number;
  totalCartao: number;
  onClear: () => void;
}

export function CartSidebar({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemove,
  subtotal,
  totalPix,
  totalCartao,
  onClear
}: CartSidebarProps) {
  const [nome, setNome] = useState('');
  const [dataEntrega, setDataEntrega] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const handleSendToWhatsApp = () => {
    if (!nome.trim() || !dataEntrega) {
      alert('Por favor, preencha seu nome e a data de entrega.');
      return;
    }

    const itemsList = cart.map(item => 
      `• ${item.quantidade}x ${item.nome} - ${formatCurrency(item.preco * item.quantidade)}`
    ).join('\n');

    const message = `🍬 *NOVO PEDIDO - DOCE ARACAJU*\n\n` +
      `👤 *Cliente:* ${nome}\n` +
      `📅 *Data de Entrega:* ${dataEntrega}\n\n` +
      `📋 *ITENS:*\n${itemsList}\n\n` +
      `────────────────\n` +
      `💰 *Subtotal:* ${formatCurrency(subtotal)}\n` +
      `💳 *Total no Cartão (+5%):* ${formatCurrency(totalCartao)}\n` +
      `💵 *Total no Pix/Dinheiro:* ${formatCurrency(totalPix)}\n\n` +
      `Por favor, confirme o pedido. Obrigado! 😊`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
      onClear();
      onClose();
      setNome('');
      setDataEntrega('');
    }, 3000);
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const sidebarVariants = {
    hidden: { x: '100%' },
    visible: { 
      x: 0,
      transition: { type: 'spring', damping: 25, stiffness: 200 }
    },
    exit: { 
      x: '100%',
      transition: { type: 'spring', damping: 30, stiffness: 300 }
    }
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999]"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        variants={sidebarVariants}
        initial="hidden"
        animate={isOpen ? 'visible' : 'hidden'}
        exit="exit"
        className="fixed top-0 right-0 h-full w-full max-w-md bg-[#FFF0F5] z-[1000] shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#FF1493]/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF1493] to-[#D4AF37] flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-[#2D1B2E]">Seu Pedido</h2>
              <p className="text-sm text-[#2D1B2E]/60">{cart.length} itens</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center hover:bg-[#FF1493]/10 transition-colors"
          >
            <X className="w-5 h-5 text-[#2D1B2E]" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-[#FF1493]/20 mx-auto mb-4" />
              <p className="text-[#2D1B2E]/60">Seu carrinho está vazio</p>
              <p className="text-sm text-[#2D1B2E]/40 mt-1">Adicione doces deliciosos!</p>
            </div>
          ) : (
            cart.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="glass-card p-4 flex gap-4"
              >
                <img
                  src={item.imagem}
                  alt={item.nome}
                  className="w-20 h-20 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-[#2D1B2E] truncate">{item.nome}</h4>
                  <p className="text-sm text-[#FF1493] font-semibold">
                    R$ {(item.preco * item.quantidade).toFixed(2)}
                  </p>
                  
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantidade - 1)}
                      className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-[#FF1493]/10 transition-colors"
                    >
                      <Minus className="w-4 h-4 text-[#2D1B2E]" />
                    </button>
                    <span className="w-8 text-center font-medium text-[#2D1B2E]">
                      {item.quantidade}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantidade + 1)}
                      className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-[#FF1493]/10 transition-colors"
                    >
                      <Plus className="w-4 h-4 text-[#2D1B2E]" />
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={() => onRemove(item.id)}
                  className="self-start p-2 rounded-full hover:bg-red-50 text-[#2D1B2E]/40 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))
          )}
        </div>

        {/* Footer - Totals & Checkout */}
        {cart.length > 0 && (
          <div className="border-t border-[#FF1493]/10 p-6 space-y-4 bg-white/40">
            {/* Customer Form */}
            <div className="space-y-3">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2D1B2E]/40" />
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="input-gourmet pl-10"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2D1B2E]/40" />
                <input
                  type="date"
                  placeholder="Data de entrega"
                  value={dataEntrega}
                  onChange={(e) => setDataEntrega(e.target.value)}
                  className="input-gourmet pl-10"
                />
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-2 py-4 border-y border-[#FF1493]/10">
              <div className="flex justify-between text-sm text-[#2D1B2E]/70">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-xl bg-green-50 border border-green-100">
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Pix/Dinheiro</span>
                </div>
                <span className="font-bold text-green-700">{formatCurrency(totalPix)}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-xl bg-[#FF1493]/5 border border-[#FF1493]/10">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#FF1493]" />
                  <span className="text-sm font-medium text-[#2D1B2E]">Cartão (+5%)</span>
                </div>
                <span className="font-bold text-[#FF1493]">{formatCurrency(totalCartao)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <motion.button
              onClick={handleSendToWhatsApp}
              disabled={showSuccess}
              className="w-full btn-primary btn-lg"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {showSuccess ? (
                <span>Pedido Enviado!</span>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Enviar pelo WhatsApp</span>
                </>
              )}
            </motion.button>
            
            <button
              onClick={onClear}
              className="w-full text-sm text-[#2D1B2E]/50 hover:text-red-500 transition-colors"
            >
              Limpar carrinho
            </button>
          </div>
        )}
      </motion.div>
    </>
  );
}
