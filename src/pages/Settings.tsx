
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  CreditCard,
  Download,
  LogOut,
  Camera,
  Mail,
  Phone,
  Lock
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Settings = () => {
  const isMobile = useIsMobile();
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    marketing: false
  });
  const [darkMode, setDarkMode] = useState(false);

  const settingsSections = [
    {
      id: "profile",
      title: "Perfil",
      icon: User,
      items: [
        { label: "Nome completo", value: "João Silva", type: "input" },
        { label: "Email", value: "joao@email.com", type: "input" },
        { label: "Telefone", value: "(11) 99999-9999", type: "input" },
        { label: "Foto do perfil", value: "", type: "avatar" }
      ]
    },
    {
      id: "notifications",
      title: "Notificações",
      icon: Bell,
      items: [
        { label: "Notificações por email", value: notifications.email, type: "switch", key: "email" },
        { label: "Notificações push", value: notifications.push, type: "switch", key: "push" },
        { label: "Emails de marketing", value: notifications.marketing, type: "switch", key: "marketing" }
      ]
    },
    {
      id: "security",
      title: "Segurança",
      icon: Shield,
      items: [
        { label: "Alterar senha", value: "", type: "button", action: "change-password" },
        { label: "Autenticação de dois fatores", value: false, type: "switch" },
        { label: "Sessões ativas", value: "3 dispositivos", type: "info" }
      ]
    },
    {
      id: "appearance",
      title: "Aparência",
      icon: Palette,
      items: [
        { label: "Modo escuro", value: darkMode, type: "switch", key: "darkMode" },
        { label: "Idioma", value: "Português (Brasil)", type: "select" }
      ]
    }
  ];

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/50 p-4">
        <h1 className="text-2xl font-bold">Configurações</h1>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Profile Summary */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-xl">JS</AvatarFallback>
                </Avatar>
                <Button size="icon" className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full">
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold">João Silva</h3>
                <p className="text-muted-foreground">joao@email.com</p>
                <Badge variant="secondary" className="mt-2">
                  Plano Premium
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Sections */}
        {settingsSections.map((section) => (
          <Card key={section.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <section.icon className="h-5 w-5" />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {section.items.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">{item.label}</Label>
                    
                    {item.type === "input" && (
                      <Input 
                        defaultValue={item.value as string}
                        className="w-48"
                      />
                    )}
                    
                    {item.type === "switch" && (
                      <Switch
                        checked={item.value as boolean}
                        onCheckedChange={(checked) => {
                          if (item.key === "darkMode") {
                            setDarkMode(checked);
                          } else if (item.key && section.id === "notifications") {
                            handleNotificationChange(item.key, checked);
                          }
                        }}
                      />
                    )}
                    
                    {item.type === "button" && (
                      <Button variant="outline" size="sm">
                        {item.action === "change-password" ? "Alterar" : "Ação"}
                      </Button>
                    )}
                    
                    {item.type === "info" && (
                      <span className="text-sm text-muted-foreground">{item.value as string}</span>
                    )}
                    
                    {item.type === "select" && (
                      <Button variant="outline" size="sm">
                        {item.value as string}
                      </Button>
                    )}
                  </div>
                  
                  {index < section.items.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        {/* Additional Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Dados e Privacidade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Exportar dados</Label>
              <Button variant="outline" size="sm">
                Baixar
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label>Excluir conta</Label>
              <Button variant="destructive" size="sm">
                Excluir
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Card>
          <CardContent className="p-4">
            <Button variant="outline" className="w-full gap-2">
              <LogOut className="h-4 w-4" />
              Sair da conta
            </Button>
          </CardContent>
        </Card>

        {/* App Info */}
        <div className="text-center text-sm text-muted-foreground py-4">
          <p>CandleLife v1.0.0</p>
          <p>© 2024 Todos os direitos reservados</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
