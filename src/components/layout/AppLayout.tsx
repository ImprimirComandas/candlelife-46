import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet } from "react-router-dom";
import { MobileBottomNavigation } from "./MobileBottomNavigation";
import { Footer } from "./Footer";
import { NotificationPermissionBanner } from "@/components/notifications/NotificationPermissionBanner";
import { GlobalNotificationCenter } from "@/components/notifications/GlobalNotificationCenter";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNative } from "@/hooks/useNative";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const AppLayout = () => {
  const isMobile = useIsMobile();
  const { isNative, hapticFeedback } = useNative();
  const location = useLocation();

  // Check if current route is a chat page
  const isChatPage = location.pathname.startsWith('/chat/');

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
            <header className="flex h-12 items-center border-b px-4 flex-shrink-0 justify-between">
              <SidebarTrigger />
              <GlobalNotificationCenter />
            </header>
          )}
          
          {/* Main content with proper safe areas and mobile spacing */}
          <main className={`flex-1 overflow-auto min-h-0 ${
            isMobile 
              ? isChatPage 
                ? 'pb-0' // No bottom padding for chat pages
                : 'pb-24 pt-2' // Normal padding for other pages
              : 'pb-16' // Bottom padding for desktop footer
          } ${isNative ? 'safe-area-top' : ''}`}>
            <div className={`min-h-full ${!isMobile && !isChatPage ? 'p-4' : isChatPage ? '' : 'p-2 pt-4'}`}>
              <Outlet />
            </div>
          </main>

          {/* Footer - only on desktop and not on chat pages */}
          {!isMobile && !isChatPage && (
            <div className="absolute bottom-0 left-0 right-0">
              <Footer />
            </div>
          )}
        </SidebarInset>
      </div>
      
      {/* Mobile Bottom Navigation - hide on chat pages */}
      {isMobile && !isChatPage && <MobileBottomNavigation />}
      
      {/* Notification Permission Banner */}
      <NotificationPermissionBanner />

      {/* Mobile Notification Center - Floating Action - hide on chat pages */}
      {isMobile && !isChatPage && (
        <div className="fixed top-4 right-4 z-40">
          <GlobalNotificationCenter />
        </div>
      )}
    </SidebarProvider>
  );
};

export default AppLayout;
