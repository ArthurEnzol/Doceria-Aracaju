import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Phone, Award, Heart, Users } from 'lucide-react';

interface SobreProps {
  onNavigate: (section: string) => void;
}

export function Sobre({ onNavigate }: SobreProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onNavigate('sobre');
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [onNavigate]);

  return (
    <section
      ref={sectionRef}
      id="sobre"
      className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[#D4AF37]/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-[#FF1493]/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left - Image/Visual */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative aspect-square max-w-md mx-auto lg:mx-0">
              {/* Main Image */}
              <div className="absolute inset-0 rounded-[2rem] overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&h=600&fit=crop"
                  alt="Confeitaria Artesanal"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2D1B2E]/30 via-transparent to-transparent" />
              </div>
              
              {/* Floating Card */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-6 -right-6 glass-card p-4 shadow-xl max-w-[200px]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF1493] to-[#D4AF37] flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-[#2D1B2E]">+45 Anos</p>
                    <p className="text-xs text-[#2D1B2E]/60">Tradição familiar</p>
                  </div>
                </div>
              </motion.div>

              {/* Stats Badge */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -top-4 -left-4 glass-card px-4 py-2 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#FF1493]" />
                  <span className="text-sm font-medium text-[#2D1B2E]">10.000+ clientes felizes</span>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right - Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="badge-gold w-fit">
              <Users className="w-3 h-3" />
              <span>Nossa História</span>
            </div>

            <h2 className="font-display text-4xl sm:text-5xl font-bold text-[#2D1B2E] leading-tight">
              Uma história de
              <span className="gradient-gold block">sabor e tradição</span>
            </h2>

            <div className="space-y-4 text-[#2D1B2E]/70 leading-relaxed">
              <p>
                Desde 1978, a Doce Aracaju leva aos sergipanos e visitantes 
                os sabores mais autênticos da nossa terra. Começamos como 
                uma pequena confeitaria familiar e hoje somos referência 
                em doces típicos de Aracaju.
              </p>
              <p>
                Cada receita foi passada de geração em geração, preservando 
                o sabor caseiro e a qualidade artesanal que nos tornou 
                conhecidos. Usamos apenas ingredientes frescos e selecionados, 
                sem conservantes ou aditivos.
              </p>
            </div>

            {/* Info Cards */}
            <div className="grid sm:grid-cols-2 gap-4 pt-4">
              <div className="glass-card p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FF1493]/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-[#FF1493]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#2D1B2E]">Localização</p>
                  <p className="text-xs text-[#2D1B2E]/60">Centro, Aracaju-SE</p>
                </div>
              </div>

              <div className="glass-card p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#2D1B2E]">Horário</p>
                  <p className="text-xs text-[#2D1B2E]/60">Seg-Sáb: 8h às 20h</p>
                </div>
              </div>

              <div className="glass-card p-4 flex items-center gap-3 sm:col-span-2">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#2D1B2E]">WhatsApp</p>
                  <p className="text-xs text-[#2D1B2E]/60">(79) 99146-6257</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
