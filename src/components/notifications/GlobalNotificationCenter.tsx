
import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Bell, Check, CheckCheck, Settings, Trash2 } from 'lucide-react';
import { useGlobalNotifications } from '@/hooks/useGlobalNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'message':
      return '💬';
    case 'transaction':
      return '💰';
    case 'goal_achieved':
      return '🎯';
    case 'payment_received':
      return '✅';
    case 'client_added':
      return '👤';
    case 'system':
      return '⚙️';
    case 'social':
      return '❤️';
    default:
      return '📢';
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'message':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'transaction':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'goal_achieved':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    case 'payment_received':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300';
    case 'client_added':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    case 'system':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    case 'social':
      return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300';
    default:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
  }
};

export const GlobalNotificationCenter = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useGlobalNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Handle navigation based on notification type and data
    if (notification.type === 'message' && notification.data?.senderId) {
      window.dispatchEvent(new CustomEvent('open-chat', {
        detail: {
          userId: notification.data.senderId,
          userName: notification.data.senderName,
          userAvatar: notification.data.senderAvatar
        }
      }));
      setIsOpen(false);
    } else if (notification.type === 'transaction' && notification.data?.transactionId) {
      window.location.hash = '/transactions';
      setIsOpen(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Notificações</span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Marcar todas como lidas
                </Button>
              )}
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-4">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">Nenhuma notificação</h3>
              <p className="text-sm text-muted-foreground">
                Suas notificações aparecerão aqui
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification, index) => (
                <div key={notification.id}>
                  <div
                    className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent/50 ${
                      !notification.read ? 'bg-accent/30' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 text-lg">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm truncate">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getNotificationColor(notification.type)}`}
                          >
                            {notification.type.replace('_', ' ')}
                          </Badge>
                          
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.created_at), {
                              addSuffix: true,
                              locale: ptBR
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {index < notifications.length - 1 && <Separator className="my-1" />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
