
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Search, Users, Phone, Mail, MapPin } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Clients = () => {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");

  // Dados mockados para demonstração
  const clients = [
    {
      id: "1",
      name: "João Silva",
      email: "joao@empresa.com",
      phone: "(11) 99999-9999",
      company: "Tech Solutions LTDA",
      avatar: "",
      status: "active",
      totalProjects: 5,
      totalEarnings: 25000,
      lastProject: "2024-01-15"
    },
    {
      id: "2", 
      name: "Maria Santos",
      email: "maria@startup.com",
      phone: "(11) 88888-8888",
      company: "StartupX",
      avatar: "",
      status: "active",
      totalProjects: 3,
      totalEarnings: 15000,
      lastProject: "2024-01-10"
    },
    {
      id: "3",
      name: "Pedro Costa",
      email: "pedro@design.com", 
      phone: "(11) 77777-7777",
      company: "Design Studio",
      avatar: "",
      status: "inactive",
      totalProjects: 2,
      totalEarnings: 8000,
      lastProject: "2023-12-01"
    }
  ];

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeClients = clients.filter(c => c.status === "active").length;
  const totalEarnings = clients.reduce((sum, c) => sum + c.totalEarnings, 0);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/50 p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Clientes</h1>
            <Button size={isMobile ? "sm" : "default"}>
              <Plus className="h-4 w-4 mr-2" />
              {!isMobile && "Novo Cliente"}
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Clientes</p>
                <p className="text-2xl font-bold">{clients.length}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clientes Ativos</p>
                <p className="text-2xl font-bold text-green-600">{activeClients}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Faturamento Total</p>
                <p className="text-2xl font-bold text-blue-600">
                  R$ {totalEarnings.toLocaleString('pt-BR')}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clients List */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={client.avatar} alt={client.name} />
                      <AvatarFallback>
                        {client.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{client.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{client.company}</p>
                    </div>
                  </div>
                  <Badge variant={client.status === "active" ? "default" : "secondary"}>
                    {client.status === "active" ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Contact Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{client.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{client.phone}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">Projetos</p>
                      <p className="font-semibold">{client.totalProjects}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Faturamento</p>
                      <p className="font-semibold text-green-600">
                        R$ {client.totalEarnings.toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  {/* Last Project */}
                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground">
                      Último projeto: {new Date(client.lastProject).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3">
                    <Button size="sm" className="flex-1">
                      Ver Detalhes
                    </Button>
                    <Button size="sm" variant="outline">
                      Editar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-8">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum cliente encontrado</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Tente buscar por outro nome" : "Adicione seu primeiro cliente para começar"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Clients;
