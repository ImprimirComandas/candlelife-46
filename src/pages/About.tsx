
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Target, Shield, Users, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Target,
      title: "Gestão Inteligente",
      description: "Controle completo das suas finanças com ferramentas avançadas de análise e planejamento."
    },
    {
      icon: Shield,
      title: "Segurança Total",
      description: "Seus dados estão protegidos com criptografia de ponta e as melhores práticas de segurança."
    },
    {
      icon: Users,
      title: "Gerenciamento de Clientes",
      description: "Organize e acompanhe seus clientes de forma eficiente e profissional."
    },
    {
      icon: Zap,
      title: "Interface Moderna",
      description: "Design intuitivo e responsivo que funciona perfeitamente em todos os dispositivos."
    }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold">Sobre o FinanceApp</h1>
        </div>

        {/* Hero section */}
        <Card className="border-0 bg-gradient-to-br from-primary/10 to-secondary/10">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Transformando a gestão financeira
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                O FinanceApp é uma plataforma completa para gerenciamento financeiro pessoal e empresarial,
                desenvolvida para simplificar suas finanças e ajudá-lo a alcançar seus objetivos.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Mission */}
        <Card>
          <CardHeader>
            <CardTitle>Nossa Missão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Democratizar o acesso a ferramentas de gestão financeira profissional, oferecendo uma
              plataforma intuitiva que permite a qualquer pessoa ou empresa controlar suas finanças
              de forma eficiente e segura.
            </p>
            <p className="text-muted-foreground">
              Acreditamos que o controle financeiro é fundamental para o sucesso e bem-estar,
              e nossa missão é tornar isso acessível para todos.
            </p>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center">Por que escolher o FinanceApp?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Team */}
        <Card>
          <CardHeader>
            <CardTitle>Nossa Equipe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Somos uma equipe apaixonada por tecnologia e finanças, dedicada a criar soluções
              que realmente fazem a diferença na vida das pessoas. Nosso time combina anos de
              experiência em desenvolvimento de software e gestão financeira.
            </p>
            <p className="text-muted-foreground">
              Trabalhamos continuamente para melhorar nossa plataforma, sempre ouvindo o
              feedback dos nossos usuários e implementando novas funcionalidades que agregam valor real.
            </p>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="border-primary/20">
          <CardContent className="p-8 text-center space-y-4">
            <h3 className="text-xl font-semibold">Pronto para começar?</h3>
            <p className="text-muted-foreground">
              Junte-se a milhares de usuários que já transformaram sua gestão financeira.
            </p>
            <Button onClick={() => navigate('/dashboard')} size="lg">
              Acessar Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;
