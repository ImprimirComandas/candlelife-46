
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
        <SidebarInset className="flex-1 flex flex-col min-w-0">
          {/* Header with sidebar trigger for desktop and safe area for mobile */}
          {!isMobile && (
            <header className="flex h-12 items-center border-b px-4 flex-shrink-0">
              <SidebarTrigger />
            </header>
          )}
          
          {/* Main content with proper safe areas and mobile spacing */}
          <main className={`flex-1 overflow-auto min-h-0 ${
            isMobile 
              ? 'mobile-content pb-20 pt-2' 
              : 'p-0'
          } ${isNative ? 'safe-area-top' : ''}`}>
            <div className={`h-full ${!isMobile ? 'p-4' : 'p-2 pt-4'}`}>
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
