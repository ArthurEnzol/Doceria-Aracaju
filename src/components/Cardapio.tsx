import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Star, Sparkles } from 'lucide-react';
import { docesTipicos } from '../data/doces';
import type { Doce } from '../types';

interface CardapioProps {
  onAddToCart: (item: Doce) => void;
  onNavigate: (section: string) => void;
}

export function Cardapio({ onAddToCart, onNavigate }: CardapioProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onNavigate('cardapio');
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [onNavigate]);

  const categorias = ['all', 'Cocadas', 'Tradicionais', 'Especiais', 'Bolos', 'Brigadeiros'];

  const filteredDoces = filter === 'all' 
    ? docesTipicos 
    : docesTipicos.filter(d => d.categoria === filter);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
    }
  };

  return (
    <section
      ref={sectionRef}
      id="cardapio"
      className="relative py-24 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="badge-gourmet mx-auto mb-4 w-fit">
            <Star className="w-3 h-3" />
            <span>Nosso Cardápio</span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-[#2D1B2E] mb-4">
            Doces de <span className="gradient-text">Aracaju</span>
          </h2>
          <p className="text-lg text-[#2D1B2E]/70 max-w-2xl mx-auto">
            Cada doce conta uma história. Receitas tradicionais sergipanas 
            preparadas com amor e dedicação.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === cat
                  ? 'bg-[#FF1493] text-white shadow-glow-sm'
                  : 'bg-white/60 text-[#2D1B2E]/70 hover:bg-[#FF1493]/10 hover:text-[#FF1493]'
              }`}
            >
              {cat === 'all' ? 'Todos' : cat}
            </button>
          ))}
        </motion.div>

        {/* Grid */}
        <motion.div
          key={filter}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredDoces.map((doce) => (
            <motion.div
              key={doce.id}
              variants={itemVariants}
              className="group glass-card overflow-hidden card-hover"
            >
              {/* Image Container */}
              <div className="relative h-48 overflow-hidden">
                <motion.img
                  src={doce.imagem}
                  alt={doce.nome}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.4 }}
                />
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#2D1B2E]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Badge */}
                {doce.badge && (
                  <div className="absolute top-3 left-3 badge-gold">
                    <Sparkles className="w-3 h-3" />
                    <span>{doce.badge}</span>
                  </div>
                )}

                {/* Quick Add Button */}
                <motion.button
                  onClick={() => onAddToCart(doce)}
                  className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Plus className="w-5 h-5 text-[#FF1493]" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-display text-lg font-bold text-[#2D1B2E] line-clamp-1">
                    {doce.nome}
                  </h3>
                  <span className="text-lg font-bold text-[#FF1493] whitespace-nowrap">
                    R$ {doce.preco.toFixed(2)}
                  </span>
                </div>
                
                <p className="text-sm text-[#2D1B2E]/60 line-clamp-2 mb-4">
                  {doce.descricao}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#D4AF37] font-medium">
                    {doce.categoria}
                  </span>
                  <motion.button
                    onClick={() => onAddToCart(doce)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FF1493]/10 text-[#FF1493] text-sm font-medium hover:bg-[#FF1493] hover:text-white transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
