import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cake } from 'lucide-react';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { Cardapio } from './components/Cardapio';
import { Sobre } from './components/Sobre';
import { CartSidebar } from './components/CartSidebar';
import { AdminPanel } from './components/AdminPanel';
import { useCart } from './hooks/useCart';
import type { Doce } from './types';

const telefone = "79 99999-9999"

function App() {
  const [currentSection, setCurrentSection] = useState('home');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  
  const {
    cart,
    isOpen: isCartOpen,
    setIsOpen: setIsCartOpen,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    totalPix,
    totalCartao,
    itemCount,
  } = useCart();

  // Scroll reveal effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.reveal').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleAddToCart = (doce: Doce) => {
    addItem({
      id: doce.id,
      nome: doce.nome,
      preco: doce.preco,
      imagem: doce.imagem,
    });
    setIsCartOpen(true);
  };

  const handleNavigate = (section: string) => {
    setCurrentSection(section);
    if (section === 'admin') {
      setIsAdminOpen(true);
    }
  };

  // Check for admin URL param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      setIsAdminOpen(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF0F5] relative">
      {/* Background Orbs */}
      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-2" />
      <div className="bg-orb orb-3" />

      {/* Navigation */}
      <Navigation
        itemCount={itemCount}
        onCartClick={() => setIsCartOpen(true)}
        onNavigate={handleNavigate}
        currentSection={currentSection}
      />

      {/* Main Content */}
      <main className="relative z-10">
        <Hero onNavigate={handleNavigate} />
        <Cardapio onAddToCart={handleAddToCart} onNavigate={handleNavigate} />
        <Sobre onNavigate={handleNavigate} />
        
        {/* Contact / Footer Section */}
        <section id="contato" className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-card p-8 md:p-12 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF1493] to-[#D4AF37] flex items-center justify-center mx-auto mb-6">
                <Cake className="w-8 h-8 text-white" />
              </div>
              
              <h2 className="font-display text-3xl md:text-4xl font-bold text-[#2D1B2E] mb-4">
                Faça seu pedido
              </h2>
              
              <p className="text-lg text-[#2D1B2E]/70 mb-8 max-w-lg mx-auto">
                Escolha seus doces favoritos no cardápio acima 
                e finalize pelo WhatsApp. Entregamos em toda Aracaju!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    const element = document.getElementById('cardapio');
                    if (element) element.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="btn-primary btn-lg"
                >
                  Ver Cardápio
                </button>
                <button
                  onClick={() => setIsAdminOpen(true)}
                  className="btn-ghost btn-lg text-sm"
                >
                  Acesso Admin
                </button>
              </div>

              {/* Footer Info */}
              <div className="mt-12 pt-8 border-t border-[#FF1493]/10">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#2D1B2E]/50">
                  <p>© {new Date().getFullYear()} Doce Aracaju. Todos os direitos reservados.</p>
                  <div className="flex items-center gap-4">
                    <span>Entregas em Aracaju-SE</span>
                    <span>•</span>
                    <span>Tel: ${telefone}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemove={removeItem}
        subtotal={subtotal}
        totalPix={totalPix}
        totalCartao={totalCartao}
        onClear={clearCart}
      />

      {/* Admin Panel */}
      <AdminPanel isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
    </div>
  );
}

export default App;
