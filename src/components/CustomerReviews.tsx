import React from 'react';
import { Star } from 'lucide-react';

const reviews = [
  { name: 'Sophie Lemaitre', role: 'Directrice Logistique, Paris', lang: 'FR', flag: '🇫🇷',
    text: 'Service exceptionnel ! Le suivi en temps réel est incroyablement précis. Mes colis arrivent toujours à l\'heure prévue. EuroTransit a transformé notre chaîne d\'approvisionnement.' },
  { name: 'Michael Thompson', role: 'CEO, GlobalShip Inc.', lang: 'EN', flag: '🇺🇸',
    text: 'Absolutely the best logistics platform we have ever used. The live tracking map and instant notifications give our customers peace of mind. Highly recommended!' },
  { name: 'Carlos Mendes', role: 'Gerente de Operações, Lisboa', lang: 'PT', flag: '🇵🇹',
    text: 'Excelente plataforma! O rastreamento em tempo real funciona perfeitamente e o suporte ao cliente é fantástico. Os meus clientes adoram a transparência.' },
  { name: 'Amélie Dubois', role: 'Responsable E-commerce, Lyon', lang: 'FR', flag: '🇫🇷',
    text: 'EuroTransit est devenu indispensable pour notre activité. La carte interactive est magnifique et les délais sont toujours respectés. Cinq étoiles bien méritées !' },
  { name: 'Jennifer Park', role: 'Logistics Manager, Singapore', lang: 'EN', flag: '🇸🇬',
    text: 'Outstanding service from start to finish. The pause/resume feature with detailed reasons keeps our clients fully informed. A truly professional solution.' },
  { name: 'Beatriz Santos', role: 'Diretora Comercial, São Paulo', lang: 'PT', flag: '🇧🇷',
    text: 'Plataforma incrível! A integração com FedEx, DHL e UPS facilita imenso o nosso trabalho. Os tickets em PDF são uma maravilha para a contabilidade.' },
  { name: 'Jean-Pierre Moreau', role: 'PDG, TransLogistique SA', lang: 'FR', flag: '🇫🇷',
    text: 'Une plateforme professionnelle et fiable. Les fonctionnalités de simulation et de génération de tickets PDF sont absolument fantastiques. Je recommande vivement.' },
  { name: 'David Wilson', role: 'Supply Chain Lead, London', lang: 'EN', flag: '🇬🇧',
    text: 'The real-time GPS tracking is a game changer. Customers stop calling to ask "where is my package" - they can see it themselves. ROI in just two months.' },
  { name: 'Inês Ferreira', role: 'Coordenadora, Porto', lang: 'PT', flag: '🇵🇹',
    text: 'Trabalho com EuroTransit há mais de um ano e nunca tive uma experiência ruim. O sistema de chat e os recibos PDF são muito profissionais. Cinco estrelas!' },
];

const CustomerReviews: React.FC = () => (
  <section className="py-20 bg-muted/30">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-foreground mb-3">What Customers Say Worldwide</h2>
        <p className="text-muted-foreground">Five-star reviews from our global community</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((r, i) => (
          <div key={i} className="p-6 rounded-xl bg-card border border-border shadow-card hover:shadow-lg transition-shadow flex flex-col">
            <div className="flex items-center gap-1 mb-3">
              {[...Array(5)].map((_, k) => <Star key={k} className="w-4 h-4 fill-secondary text-secondary" />)}
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground font-medium">{r.flag} {r.lang}</span>
            </div>
            <p className="text-sm text-foreground mb-4 italic flex-1">&ldquo;{r.text}&rdquo;</p>
            <div className="pt-3 border-t border-border">
              <div className="font-semibold text-foreground text-sm">{r.name}</div>
              <div className="text-xs text-muted-foreground">{r.role}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default CustomerReviews;