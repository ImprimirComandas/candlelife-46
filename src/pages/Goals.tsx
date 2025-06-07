
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Plus, Target, Calendar, TrendingUp } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Goals = () => {
  const isMobile = useIsMobile();

  // Dados mockados para demonstração
  const goals = [
    {
      id: "1",
      title: "Fundo de Emergência",
      description: "Reserva para emergências equivalente a 6 meses de gastos",
      targetAmount: 30000,
      currentAmount: 18500,
      deadline: "2024-12-31",
      category: "Emergência",
      status: "active"
    },
    {
      id: "2",
      title: "Viagem para o Japão",
      description: "Economizar para viagem dos sonhos",
      targetAmount: 15000,
      currentAmount: 8200,
      deadline: "2024-09-15",
      category: "Lazer",
      status: "active"
    },
    {
      id: "3",
      title: "Novo MacBook Pro",
      description: "Upgrade do equipamento de trabalho",
      targetAmount: 8000,
      currentAmount: 8000,
      deadline: "2024-03-01",
      category: "Trabalho",
      status: "completed"
    }
  ];

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "active":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/50 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Metas Financeiras</h1>
          <Button size={isMobile ? "sm" : "default"}>
            <Plus className="h-4 w-4 mr-2" />
            {!isMobile && "Nova Meta"}
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="p-4">
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{goals.length}</p>
                <p className="text-sm text-muted-foreground">Total de Metas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {goals.filter(g => g.status === "completed").length}
                </p>
                <p className="text-sm text-muted-foreground">Concluídas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {goals.filter(g => g.status === "active").length}
                </p>
                <p className="text-sm text-muted-foreground">Em Progresso</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-4">
          {goals.map((goal) => {
            const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
            const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            
            return (
              <Card key={goal.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${getStatusColor(goal.status)}/20`}>
                        <Target className={`h-5 w-5 ${getStatusColor(goal.status).replace('bg-', 'text-')}`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{goal.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                      </div>
                    </div>
                    <Badge variant={goal.status === "completed" ? "default" : "secondary"}>
                      {goal.status === "completed" ? "Concluída" : "Ativa"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Progresso</span>
                        <span className="text-sm text-muted-foreground">
                          {progress.toFixed(0)}%
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    {/* Amount Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Atual</p>
                        <p className="text-lg font-bold text-primary">
                          R$ {goal.currentAmount.toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Meta</p>
                        <p className="text-lg font-bold">
                          R$ {goal.targetAmount.toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    {/* Deadline Info */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}</span>
                      </div>
                      {goal.status === "active" && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                          <span className={daysLeft > 0 ? "text-blue-600" : "text-red-600"}>
                            {daysLeft > 0 ? `${daysLeft} dias restantes` : "Prazo vencido"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {goal.status === "active" && (
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="flex-1">
                          Adicionar Valor
                        </Button>
                        <Button size="sm" variant="outline">
                          Editar
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Goals;
