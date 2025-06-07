
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  CreditCard, 
  Target, 
  Users, 
  MessageSquare, 
  Settings, 
  TrendingDown,
  Receipt,
  Globe,
  TrendingUp,
  MoreHorizontal,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNative } from "@/hooks/useNative";
import { useAdvancedMessages } from "@/hooks/useAdvancedMessages";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useState } from "react";

export const MobileBottomNavigation = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { hapticFeedback, isNative } = useNative();
  const { getTotalUnreadCount } = useAdvancedMessages();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const totalUnreadMessages = getTotalUnreadCount();

  // Principais páginas na navegação inferior
  const mainNavItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: CreditCard, label: "Transações", href: "/transactions" },
    { icon: Target, label: "Metas", href: "/goals" },
    { icon: Users, label: "Clientes", href: "/clients" },
  ];

  // Páginas secundárias no drawer
  const secondaryNavItems = [
    { 
      icon: MessageSquare, 
      label: "Chat", 
      href: "/chat",
      badge: totalUnreadMessages > 0 ? (totalUnreadMessages > 99 ? "99+" : totalUnreadMessages.toString()) : undefined
    },
    { icon: Globe, label: "Comunidade", href: "/social" },
    { icon: TrendingUp, label: "Receitas", href: "/transactions?type=income" },
    { icon: TrendingDown, label: "Despesas", href: "/expenses" },
    { icon: Receipt, label: "Faturadas", href: "/invoiced" },
    { icon: Settings, label: "Configurações", href: "/settings" },
  ];

  const handleNavClick = () => {
    hapticFeedback('light');
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
      hapticFeedback('light');
      setIsDrawerOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao fazer logout.",
        variant: "destructive",
      });
    }
  };

  if (!isMobile) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 border-t border-border/50 ${
      isNative ? 'safe-area-bottom pb-2' : 'pb-2'
    }`}>
      <nav className="flex justify-around items-center py-3 px-2">
        {mainNavItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={handleNavClick}
              className={cn(
                "flex flex-col items-center justify-center p-2 transition-all duration-200 rounded-xl min-w-[60px] native-transition relative",
                isActive 
                  ? "text-primary bg-primary/10 scale-105" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50 active:scale-95"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 mb-1 transition-transform duration-200", 
                isActive && "scale-110"
              )} />
              <span className={cn(
                "text-xs font-medium transition-all duration-200",
                isActive ? "font-semibold" : "font-normal"
              )}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
        
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <button 
              onClick={handleNavClick}
              className="flex flex-col items-center justify-center p-2 transition-all duration-200 rounded-xl min-w-[60px] text-muted-foreground hover:text-foreground hover:bg-accent/50 active:scale-95 native-transition relative"
            >
              <MoreHorizontal className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">Mais</span>
              {totalUnreadMessages > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs min-w-[16px] text-[10px]"
                >
                  {totalUnreadMessages > 99 ? "99+" : totalUnreadMessages}
                </Badge>
              )}
            </button>
          </DrawerTrigger>
          <DrawerContent className="bg-background/95 backdrop-blur-md border-t border-border/50">
            <DrawerHeader>
              <DrawerTitle>Menu Completo</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 space-y-2 pb-8">
              {secondaryNavItems.map((item) => {
                const isActive = location.pathname === item.href || 
                                (item.href === "/chat" && location.pathname.startsWith("/chat")) ||
                                (item.href.includes('?type=income') && location.pathname === '/transactions' && location.search.includes('type=income'));
                
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl transition-all duration-200 active:scale-95 native-transition relative",
                      isActive 
                        ? "bg-primary/10 text-primary" 
                        : "hover:bg-accent/50"
                    )}
                    onClick={() => {
                      handleNavClick();
                      setIsDrawerOpen(false);
                    }}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <Badge 
                        variant="destructive" 
                        className="ml-auto h-5 w-5 p-0 flex items-center justify-center text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
              
              {/* Logout Button */}
              <div className="border-t pt-2 mt-4">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 p-4 rounded-xl transition-all duration-200 active:scale-95 native-transition text-destructive hover:bg-destructive/10 w-full"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Sair</span>
                </button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </nav>
    </div>
  );
};
