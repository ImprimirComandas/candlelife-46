
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Bell, Volume2, Clock } from 'lucide-react';
import { useGlobalNotifications } from '@/hooks/useGlobalNotifications';
import { useToast } from '@/hooks/use-toast';

const notificationTypes = [
  { key: 'messages', label: 'Mensagens', description: 'Notificações de novas mensagens no chat' },
  { key: 'transactions', label: 'Transações', description: 'Notificações de novas transações financeiras' },
  { key: 'goals', label: 'Metas', description: 'Notificações quando metas são atingidas' },
  { key: 'payments', label: 'Pagamentos', description: 'Notificações de pagamentos recebidos' },
  { key: 'clients', label: 'Clientes', description: 'Notificações de novos clientes' },
  { key: 'social', label: 'Social', description: 'Notificações de curtidas e comentários' },
  { key: 'system', label: 'Sistema', description: 'Notificações do sistema e atualizações' }
];

export const NotificationSettings = () => {
  const { preferences, updatePreferences, requestPermissions } = useGlobalNotifications();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async (key: string, value: boolean) => {
    await updatePreferences({ [key]: value });
    toast({
      title: "Configuração atualizada",
      description: `Notificações de ${notificationTypes.find(t => t.key === key)?.label.toLowerCase()} ${value ? 'ativadas' : 'desativadas'}.`,
    });
  };

  const handleTimeChange = async (field: 'quiet_hours_start' | 'quiet_hours_end', value: string) => {
    await updatePreferences({ [field]: value });
    toast({
      title: "Horário atualizado",
      description: "Horário silencioso foi atualizado.",
    });
  };

  const handleRequestPermissions = async () => {
    setIsLoading(true);
    try {
      const granted = await requestPermissions();
      if (granted) {
        toast({
          title: 'Permissões concedidas',
          description: 'Agora você receberá notificações push.',
        });
      } else {
        toast({
          title: 'Permissões negadas',
          description: 'Você pode ativá-las nas configurações do navegador.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível solicitar permissões.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-4 w-4" />
            Configurações de Notificação
          </CardTitle>
          <CardDescription className="text-sm">
            Configure como e quando você quer receber notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Permission Request */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <h4 className="font-medium text-sm">Permissões do Navegador</h4>
              <p className="text-xs text-muted-foreground">
                Permita notificações para receber alertas mesmo quando o app estiver fechado
              </p>
            </div>
            <Button 
              onClick={handleRequestPermissions}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              {isLoading ? 'Solicitando...' : 'Ativar'}
            </Button>
          </div>

          <Separator />

          {/* Sound Settings */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              <Label className="text-sm font-medium">Som</Label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sound_enabled" className="text-sm">Sons de notificação</Label>
                <p className="text-xs text-muted-foreground">
                  Reproduzir som quando receber notificações
                </p>
              </div>
              <Switch
                id="sound_enabled"
                checked={preferences.sound_enabled}
                onCheckedChange={(checked) => handleToggle('sound_enabled', checked)}
              />
            </div>
          </div>

          <Separator />

          {/* Quiet Hours */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <Label className="text-sm font-medium">Horário Silencioso</Label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="quiet_start" className="text-xs">Início</Label>
                <Input
                  id="quiet_start"
                  type="time"
                  value={preferences.quiet_hours_start}
                  onChange={(e) => handleTimeChange('quiet_hours_start', e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="quiet_end" className="text-xs">Fim</Label>
                <Input
                  id="quiet_end"
                  type="time"
                  value={preferences.quiet_hours_end}
                  onChange={(e) => handleTimeChange('quiet_hours_end', e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Durante este período, você não receberá notificações sonoras
            </p>
          </div>

          <Separator />

          {/* Notification Types */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Tipos de Notificação</Label>
            <div className="space-y-3">
              {notificationTypes.map((type) => (
                <div key={type.key} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor={type.key} className="text-sm">{type.label}</Label>
                    <p className="text-xs text-muted-foreground">
                      {type.description}
                    </p>
                  </div>
                  <Switch
                    id={type.key}
                    checked={preferences[type.key as keyof typeof preferences] as boolean}
                    onCheckedChange={(checked) => handleToggle(type.key, checked)}
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
