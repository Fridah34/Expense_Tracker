import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import MobileDrawer from './MobileDrawer';
import useResponsive from './useResponsive';

const AppLayout = () => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Determine sidebar width based on state and screen size
  const getSidebarWidth = () => {
    if (isMobile) return 0;
    if (isTablet) return 72; // Slightly wider for tablet to accommodate icons comfortably
    return sidebarCollapsed ? 72 : 240; // 72px for collapsed (icon only), 240px for expanded
  };

  const sidebarWidth = getSidebarWidth();

  // Handle sidebar toggle
  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Desktop/Tablet Sidebar */}
      {!isMobile && (
        <aside
          className="bg-[#1A1645] flex flex-col transition-all duration-300 ease-in-out flex-shrink-0 h-full"
          style={{ width: sidebarWidth }}
        >
          <Sidebar
            collapsed={isTablet ? true : sidebarCollapsed}
            onToggle={handleToggleSidebar}
            isMobile={false}
          />
        </aside>
      )}

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav onMenuClick={() => setMobileDrawerOpen(true)} />
        
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Custom scrollbar styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        @keyframes slide-in {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AppLayout;