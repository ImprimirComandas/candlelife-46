
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Terms = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: "1. Aceitação dos Termos",
      content: [
        "Ao acessar e usar o FinanceApp, você concorda em cumprir estes Termos de Uso.",
        "Se você não concordar com qualquer parte destes termos, não deve usar nossos serviços.",
        "Reservamo-nos o direito de modificar estes termos a qualquer momento.",
        "Mudanças significativas serão comunicadas com antecedência de 30 dias."
      ]
    },
    {
      title: "2. Descrição do Serviço",
      content: [
        "O FinanceApp é uma plataforma de gestão financeira pessoal e empresarial.",
        "Oferecemos ferramentas para controle de transações, metas e clientes.",
        "O serviço está disponível via web e aplicativos móveis.",
        "Funcionalidades podem variar entre diferentes planos de uso."
      ]
    },
    {
      title: "3. Conta de Usuário",
      content: [
        "Você é responsável por manter a confidencialidade de suas credenciais.",
        "Uma conta por pessoa/empresa é permitida.",
        "Informações fornecidas devem ser precisas e atualizadas.",
        "Notifique-nos imediatamente sobre uso não autorizado de sua conta."
      ]
    },
    {
      title: "4. Uso Aceitável",
      content: [
        "Use o serviço apenas para fins legais e apropriados.",
        "Não compartilhe conteúdo ofensivo, ilegal ou prejudicial.",
        "Não tente acessar sistemas ou dados não autorizados.",
        "Respeite os direitos de propriedade intelectual."
      ]
    },
    {
      title: "5. Privacidade e Dados",
      content: [
        "Seus dados financeiros são protegidos por criptografia.",
        "Não compartilhamos informações pessoais com terceiros sem consentimento.",
        "Você mantém propriedade total sobre seus dados.",
        "Consulte nossa Política de Privacidade para detalhes completos."
      ]
    },
    {
      title: "6. Limitações de Responsabilidade",
      content: [
        "O serviço é fornecido 'como está', sem garantias explícitas.",
        "Não somos responsáveis por decisões financeiras baseadas no app.",
        "Limitamos nossa responsabilidade ao valor pago pelos serviços.",
        "Recomendamos consultar profissionais para decisões importantes."
      ]
    }
  ];

  const prohibitions = [
    "Usar o serviço para atividades ilegais",
    "Tentar hackear ou comprometer a segurança",
    "Criar múltiplas contas para o mesmo usuário",
    "Compartilhar credenciais de acesso",
    "Fazer engenharia reversa do software"
  ];

  const userRights = [
    "Acesso completo aos seus dados",
    "Exportação de dados a qualquer momento",
    "Cancelamento da conta quando desejar",
    "Suporte técnico durante o período de uso",
    "Atualizações gratuitas de segurança"
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
          <h1 className="text-3xl md:text-4xl font-bold">Termos de Uso</h1>
        </div>

        {/* Last Updated */}
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-5 w-5 text-primary" />
              <p className="font-semibold">Termos de Uso do FinanceApp</p>
            </div>
            <p className="text-sm text-muted-foreground">
              <strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}
            </p>
            <p className="mt-2 text-sm">
              Estes termos regem o uso dos nossos serviços. Leia atentamente antes de utilizar o aplicativo.
            </p>
          </CardContent>
        </Card>

        {/* Main Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{section.title}</CardTitle>
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

        {/* Prohibitions and Rights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Prohibitions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <XCircle className="h-5 w-5" />
                Uso Proibido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {prohibitions.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* User Rights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                Seus Direitos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {userRights.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Important Notice */}
        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-900/10">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-400 mb-2">
                  Aviso Importante
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  O FinanceApp é uma ferramenta de apoio à gestão financeira. Não fornecemos consultoria 
                  financeira profissional. Para decisões financeiras importantes, consulte sempre um 
                  profissional qualificado.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Termination */}
        <Card>
          <CardHeader>
            <CardTitle>7. Cancelamento e Rescisão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              <strong>Cancelamento pelo usuário:</strong> Você pode cancelar sua conta a qualquer momento 
              através das configurações do aplicativo ou entrando em contato conosco.
            </p>
            <p className="text-muted-foreground">
              <strong>Rescisão por nossa parte:</strong> Podemos suspender ou encerrar contas que violem 
              estes termos, com aviso prévio quando possível.
            </p>
            <p className="text-muted-foreground">
              <strong>Dados após cancelamento:</strong> Seus dados serão mantidos por 30 dias para eventual 
              recuperação, depois serão permanentemente excluídos.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="border-primary/20">
          <CardContent className="p-8 text-center space-y-4">
            <h3 className="text-xl font-semibold">Dúvidas sobre os Termos?</h3>
            <p className="text-muted-foreground">
              Se você tiver alguma dúvida sobre estes termos de uso, entre em contato conosco.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate('/contact')}>
                Entrar em contato
              </Button>
              <Button variant="outline" onClick={() => navigate('/privacy')}>
                Ver Política de Privacidade
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms;
