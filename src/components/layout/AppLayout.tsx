
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Routes, Route } from "react-router-dom";
import { MobileBottomNavigation } from "./MobileBottomNavigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNative } from "@/hooks/useNative";
import { useEffect } from "react";
import Dashboard from "@/pages/Dashboard";
import ChatPage from "@/pages/ChatPage";
import ChatConversationPage from "@/pages/ChatConversationPage";

const AppLayout = () => {
  const isMobile = useIsMobile();
  const { isNative, hapticFeedback } = useNative();

  // Adicionar feedback háptico para interações móveis
  useEffect(() => {
    if (isNative && isMobile) {
      const handleTouchStart = () => {
        hapticFeedback('light');
      };

      // Adicionar feedback háptico sutil para botões
      document.addEventListener('touchstart', handleTouchStart, { passive: true });

      return () => {
        document.removeEventListener('touchstart', handleTouchStart);
      };
    }
  }, [isNative, isMobile, hapticFeedback]);

  return (
    <SidebarProvider>
      <div className={`flex h-screen w-full ${isNative ? 'native-app' : ''}`}>
        {!isMobile && <AppSidebar />}
        <SidebarInset className="flex-1">
          {/* Header with sidebar trigger for desktop and safe area for mobile */}
          {!isMobile && (
            <header className="flex h-12 items-center border-b px-4">
              <SidebarTrigger />
            </header>
          )}
          
          {/* Main content with proper safe areas and mobile spacing */}
          <main className={`flex-1 overflow-auto ${
            isMobile 
              ? 'mobile-content pb-24 pt-2' 
              : 'p-4 pt-0'
          } ${isNative ? 'safe-area-top' : ''}`}>
            <div className={!isMobile ? 'p-4' : 'p-4 pt-6'}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/chat/:userId" element={<ChatConversationPage />} />
                <Route path="/transactions" element={<div>Transações</div>} />
                <Route path="/goals" element={<div>Metas</div>} />
                <Route path="/clients" element={<div>Clientes</div>} />
                <Route path="/social" element={<div>Comunidade</div>} />
                <Route path="/settings" element={<div>Configurações</div>} />
                <Route path="/expenses" element={<div>Despesas</div>} />
                <Route path="/invoiced" element={<div>Faturadas</div>} />
              </Routes>
            </div>
          </main>
        </SidebarInset>
      </div>
      {isMobile && <MobileBottomNavigation />}
    </SidebarProvider>
  );
};

export default AppLayout;
