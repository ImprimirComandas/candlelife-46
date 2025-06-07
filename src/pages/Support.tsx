
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, HelpCircle, BookOpen, MessageSquare, Video, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Support = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const supportCategories = [
    {
      icon: BookOpen,
      title: "Guias e Tutoriais",
      description: "Aprenda a usar todas as funcionalidades",
      color: "bg-blue-500/10 text-blue-600"
    },
    {
      icon: Video,
      title: "Vídeos Explicativos",
      description: "Assista nossos tutoriais em vídeo",
      color: "bg-green-500/10 text-green-600"
    },
    {
      icon: MessageSquare,
      title: "Chat ao Vivo",
      description: "Fale com nossa equipe de suporte",
      color: "bg-purple-500/10 text-purple-600"
    },
    {
      icon: FileText,
      title: "Base de Conhecimento",
      description: "Documentação completa do sistema",
      color: "bg-orange-500/10 text-orange-600"
    }
  ];

  const faqs = [
    {
      question: "Como criar uma nova transação?",
      answer: "Para criar uma nova transação, acesse a página 'Transações' e clique no botão 'Nova Transação'. Preencha os campos obrigatórios como valor, descrição e categoria, depois clique em 'Salvar'."
    },
    {
      question: "Como definir metas financeiras?",
      answer: "Vá até a seção 'Metas' no menu principal. Clique em 'Nova Meta', defina o valor alvo, prazo e descrição. O sistema calculará automaticamente o progresso conforme suas transações."
    },
    {
      question: "Como adicionar um cliente?",
      answer: "Na página 'Clientes', clique em 'Novo Cliente'. Preencha os dados como nome, email e telefone. Você pode vincular transações a clientes específicos para um melhor controle."
    },
    {
      question: "Como exportar relatórios?",
      answer: "Nas páginas de transações, você pode usar os filtros de data e clicar em 'Imprimir Extrato' para gerar um relatório em PDF das transações selecionadas."
    },
    {
      question: "Como alterar minha senha?",
      answer: "Acesse 'Configurações' > 'Segurança' e clique em 'Alterar Senha'. Digite sua senha atual e a nova senha duas vezes para confirmar a alteração."
    },
    {
      question: "Como funciona o sistema de backup?",
      answer: "Todos os seus dados são automaticamente sincronizados e salvos na nuvem. Você pode acessar suas informações de qualquer dispositivo fazendo login com sua conta."
    }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-3xl md:text-4xl font-bold">Central de Ajuda</h1>
        </div>

        {/* Hero */}
        <Card className="border-0 bg-gradient-to-br from-primary/10 to-secondary/10">
          <CardContent className="p-8 text-center space-y-4">
            <HelpCircle className="h-16 w-16 text-primary mx-auto" />
            <h2 className="text-2xl md:text-3xl font-bold">Como podemos ajudar?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Encontre respostas rápidas para suas dúvidas ou entre em contato com nossa equipe de suporte.
            </p>
          </CardContent>
        </Card>

        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Busque por uma dúvida..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Support Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {supportCategories.map((category, index) => (
            <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${category.color}`}>
                    <category.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{category.title}</h3>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>Perguntas Frequentes</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredFaqs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma pergunta encontrada para "{searchQuery}"
              </p>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {filteredFaqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card className="border-primary/20">
          <CardContent className="p-8 text-center space-y-4">
            <h3 className="text-xl font-semibold">Não encontrou sua resposta?</h3>
            <p className="text-muted-foreground">
              Nossa equipe de suporte está pronta para ajudá-lo com qualquer dúvida.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate('/contact')}>
                Entrar em contato
              </Button>
              <Button variant="outline">
                Chat ao vivo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Support;
