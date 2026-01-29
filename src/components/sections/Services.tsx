import { memo } from 'react';
import { motion } from 'framer-motion';
import { Heart, PartyPopper, GraduationCap, Building2, Music2, Sparkles } from 'lucide-react';
import { AnimatedSection } from '../ui/AnimatedSection';

const services = [
  {
    icon: Heart,
    title: 'Casamentos',
    description:
      'Trilha sonora perfeita para o dia mais especial da sua vida. Do cerimonial à pista de dança.',
    features: ['Cerimônia', 'Recepção', 'Festa'],
  },
  {
    icon: PartyPopper,
    title: '15 Anos',
    description:
      'Transforme a festa de debutante em uma noite inesquecível com o melhor da música.',
    features: ['Valsa', 'Coreografias', 'Balada'],
  },
  {
    icon: GraduationCap,
    title: 'Formaturas',
    description:
      'Celebre sua conquista com uma festa épica que ficará na memória de todos.',
    features: ['Colação', 'Baile', 'After Party'],
  },
  {
    icon: Building2,
    title: 'Corporativos',
    description:
      'Eventos empresariais com a energia certa para cada momento da sua empresa.',
    features: ['Confraternização', 'Lançamentos', 'Convenções'],
  },
  {
    icon: Music2,
    title: 'Festivais',
    description:
      'Sets memoráveis em grandes palcos com a energia que só os festivais proporcionam.',
    features: ['Main Stage', 'Warm Up', 'Closing'],
  },
  {
    icon: Sparkles,
    title: 'Eventos Especiais',
    description:
      'Aniversários, chás de bebê, reveillons e qualquer celebração que mereça trilha sonora.',
    features: ['Personalizado', 'Temático', 'Exclusivo'],
  },
];

export const Services = memo(function Services() {
  return (
    <section id="services" className="section-padding relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-purple-600/5 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <AnimatedSection className="text-center mb-16">
          <p className="section-subtitle mb-4">Serviços</p>
          <h2 className="section-title text-4xl md:text-5xl mb-6">
            <span className="gradient-text">Tipos de Eventos</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Cada evento é único e merece uma experiência sonora personalizada.
            Conheça os serviços que ofereço.
          </p>
        </AnimatedSection>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <AnimatedSection key={service.title} delay={index * 0.1}>
              <motion.div
                whileHover={{ y: -8 }}
                className="glass-card rounded-xl p-8 h-full group cursor-pointer"
              >
                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center mb-6 group-hover:neon-glow-sm transition-all duration-300"
                >
                  <service.icon className="w-8 h-8 text-purple-400 group-hover:text-purple-300 transition-colors" />
                </motion.div>

                {/* Title */}
                <h3 className="text-xl font-bold mb-3 text-white group-hover:gradient-text-static transition-all">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-gray-400 mb-6 leading-relaxed">
                  {service.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-2">
                  {service.features.map((feature) => (
                    <span
                      key={feature}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Hover indicator */}
                <div className="mt-6 flex items-center text-sm text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="mr-2">Saiba mais</span>
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </div>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>

        {/* CTA */}
        <AnimatedSection className="text-center mt-16">
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary-glow px-8 py-4 rounded-lg text-lg inline-flex items-center gap-3"
          >
            <span>Solicitar Orçamento</span>
          </motion.a>
        </AnimatedSection>
      </div>

      {/* Section divider */}
      <div className="absolute bottom-0 left-0 right-0 section-divider" />
    </section>
  );
});
