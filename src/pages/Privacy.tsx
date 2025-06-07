
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Eye, Lock, Database } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Privacy = () => {
  const navigate = useNavigate();

  const sections = [
    {
      icon: Database,
      title: "Coleta de Dados",
      content: [
        "Coletamos apenas as informações necessárias para fornecer nossos serviços.",
        "Dados pessoais: nome, email, telefone (quando fornecidos voluntariamente).",
        "Dados financeiros: transações, metas e informações de clientes inseridas por você.",
        "Dados técnicos: cookies, logs de acesso e informações do dispositivo."
      ]
    },
    {
      icon: Lock,
      title: "Uso dos Dados",
      content: [
        "Processar e armazenar suas transações financeiras.",
        "Fornecer relatórios e análises personalizadas.",
        "Melhorar nossos serviços e experiência do usuário.",
        "Comunicar atualizações importantes sobre o serviço.",
        "Garantir a segurança e prevenir fraudes."
      ]
    },
    {
      icon: Shield,
      title: "Proteção de Dados",
      content: [
        "Utilizamos criptografia SSL/TLS para todas as comunicações.",
        "Senhas são criptografadas usando algoritmos seguros.",
        "Acesso aos dados é restrito apenas a pessoal autorizado.",
        "Realizamos backups seguros e regulares dos dados.",
        "Monitoramento contínuo contra atividades suspeitas."
      ]
    },
    {
      icon: Eye,
      title: "Compartilhamento",
      content: [
        "Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros.",
        "Dados podem ser compartilhados apenas em caso de obrigação legal.",
        "Utilizamos provedores de serviços confiáveis que seguem nossos padrões de segurança.",
        "Você mantém total controle sobre seus dados e pode exportá-los a qualquer momento."
      ]
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
          <h1 className="text-3xl md:text-4xl font-bold">Política de Privacidade</h1>
        </div>

        {/* Last Updated */}
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              <strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}
            </p>
            <p className="mt-2 text-sm">
              Esta política descreve como coletamos, usamos e protegemos suas informações pessoais.
            </p>
          </CardContent>
        </Card>

        {/* Introduction */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Compromisso com sua Privacidade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              No FinanceApp, levamos sua privacidade muito a sério. Esta política explica como tratamos
              suas informações pessoais e financeiras, garantindo total transparência sobre nossos processos.
            </p>
            <p className="text-muted-foreground">
              Ao usar nossos serviços, você concorda com as práticas descritas nesta política.
              Recomendamos que leia atentamente todos os termos.
            </p>
          </CardContent>
        </Card>

        {/* Main Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <section.icon className="h-5 w-5 text-primary" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Rights */}
        <Card>
          <CardHeader>
            <CardTitle>Seus Direitos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem os seguintes direitos:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Acesso aos seus dados pessoais",
                "Correção de dados incorretos",
                "Exclusão de dados desnecessários",
                "Portabilidade dos seus dados",
                "Revogação do consentimento",
                "Informações sobre compartilhamento"
              ].map((right, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-sm">{right}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cookies */}
        <Card>
          <CardHeader>
            <CardTitle>Cookies e Tecnologias Similares</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Utilizamos cookies para melhorar sua experiência em nosso aplicativo:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span className="text-muted-foreground">
                  <strong>Cookies essenciais:</strong> Necessários para o funcionamento básico do app
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span className="text-muted-foreground">
                  <strong>Cookies de preferência:</strong> Lembram suas configurações e preferências
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span className="text-muted-foreground">
                  <strong>Cookies analíticos:</strong> Ajudam a melhorar nossos serviços (anônimos)
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="border-primary/20">
          <CardContent className="p-8 text-center space-y-4">
            <h3 className="text-xl font-semibold">Dúvidas sobre Privacidade?</h3>
            <p className="text-muted-foreground">
              Se você tiver alguma dúvida sobre nossa política de privacidade ou quiser exercer seus direitos,
              entre em contato conosco.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate('/contact')}>
                Entrar em contato
              </Button>
              <Button variant="outline" onClick={() => navigate('/terms')}>
                Ver Termos de Uso
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;
