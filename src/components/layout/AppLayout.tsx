
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet } from "react-router-dom";
import { MobileBottomNavigation } from "./MobileBottomNavigation";
import { Footer } from "./Footer";
import { NotificationPermissionBanner } from "@/components/notifications/NotificationPermissionBanner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNative } from "@/hooks/useNative";
import { useEffect } from "react";

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
        <SidebarInset className="flex-1 flex flex-col">
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
              <Outlet />
            </div>
          </main>

          {/* Footer - only on desktop */}
          {!isMobile && <Footer />}
        </SidebarInset>
      </div>
      {isMobile && <MobileBottomNavigation />}
      
      {/* Notification Permission Banner */}
      <NotificationPermissionBanner />
    </SidebarProvider>
  );
};

export default AppLayout;
