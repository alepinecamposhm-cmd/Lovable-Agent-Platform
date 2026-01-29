import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, Users, MessageSquare, Calendar, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  { icon: Users, title: 'Pipeline de Leads', description: 'Gestiona clientes potenciales con drag & drop' },
  { icon: MessageSquare, title: 'Inbox Unificado', description: 'Todas tus conversaciones en un solo lugar' },
  { icon: Calendar, title: 'Calendario', description: 'Agenda citas y visitas fácilmente' },
  { icon: Building2, title: 'Propiedades', description: 'Administra listings y su rendimiento' },
  { icon: BarChart3, title: 'Reportes', description: 'Métricas y análisis de tu desempeño' },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background" />
        <div className="relative container max-w-6xl mx-auto px-4 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              <span className="gradient-text">AgentHub</span>
              <br />
              <span className="text-foreground">Plataforma de Agentes</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              CRM inmobiliario interactivo. Gestiona leads, propiedades y citas con micro-interacciones que hacen tu trabajo más eficiente.
            </p>
            <Button size="lg" asChild>
              <Link to="/agents">
                Entrar al Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Features */}
      <div className="container max-w-6xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="group p-6 rounded-xl border bg-card hover:shadow-lg hover:-translate-y-1 transition-all"
            >
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
