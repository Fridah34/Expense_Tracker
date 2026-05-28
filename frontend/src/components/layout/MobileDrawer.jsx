import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import Sidebar from './Sidebar';

const MobileDrawer = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const drawerContent = (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="absolute top-0 left-0 bottom-0 w-64 bg-[#1A1645] shadow-xl animate-slide-in">
        <div className="relative h-full">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-1 rounded-lg text-white/50 hover:text-white/70"
          >
            <X size={18} />
          </button>
          
          {/* Sidebar content (without toggle) */}
          <div className="pt-12 h-full">
            <Sidebar collapsed={false} isMobile={true} onMobileClose={onClose} />
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(drawerContent, document.body);
};

export default MobileDrawer;