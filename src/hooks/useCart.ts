import { useState, useEffect, useCallback } from 'react';
import type { CartItem } from '../types';
import { CREDIT_FEE } from '../data/doces';

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('doceria-cart');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('doceria-cart', JSON.stringify(cart));
  }, [cart]);

  const addItem = useCallback((item: Omit<CartItem, 'quantidade'>) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => 
          i.id === item.id 
            ? { ...i, quantidade: i.quantidade + 1 }
            : i
        );
      }
      return [...prev, { ...item, quantidade: 1 }];
    });
  }, []);

  const removeItem = useCallback((id: number) => {
    setCart(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: number, quantidade: number) => {
    if (quantidade <= 0) {
      removeItem(id);
      return;
    }
    setCart(prev => 
      prev.map(i => i.id === id ? { ...i, quantidade } : i)
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
  const totalPix = subtotal;
  const totalCartao = subtotal * (1 + CREDIT_FEE);
  const itemCount = cart.reduce((sum, item) => sum + item.quantidade, 0);

  return {
    cart,
    isOpen,
    setIsOpen,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    totalPix,
    totalCartao,
    itemCount,
  };
}
