import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Sidebar({ isOpen = false, onClose = () => {} }) {
  const location = useLocation();
  const { user } = useAuth();

  // Accessibility (Escape key) & Body Scroll Lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);
  
  const navItems = [
    { icon: '🏠', label: 'หน้าหลัก', path: '/' },
    { icon: '🧮', label: 'คำนวณภาษี', path: '/calculator' },
    { icon: '📅', label: 'บันทึกรายได้ 12 เดือน', path: '/monthly-tracker' },
    { icon: '📋', label: 'ประวัติการคำนวณ', path: '/history', protected: true },
    { icon: '👤', label: 'โปรไฟล์', path: '/profile', protected: true },
  ];

  return (
    <>
      {/* Backdrop overlay สำหรับจอมือถือเมื่อเปิด Drawer */}
      <div 
        className={`sidebar-backdrop ${isOpen ? 'active' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-brand">
            <div className="logo-icon">💰</div>
            <span className="logo-text">TaxMe</span>
          </div>
          <button 
            className="sidebar-close-btn" 
            onClick={onClose} 
            aria-label="ปิดเมนู"
            title="ปิดเมนู"
          >
            ✕
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, i) => {
            // Hide protected items if not logged in
            if (item.protected && !user) return null;
            
            const isActive = location.pathname === item.path && 
                             (item.path !== '/' || location.pathname === '/');
                             
            return (
              <Link
                key={i}
                to={item.path}
                onClick={onClose}
                className={`nav-item ${isActive ? 'active' : ''}`}
                style={{ textDecoration: 'none' }}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="illustration-container">
          <div className="illustration-box">
            <div className="illustration-character">🧑‍💼</div>
            <div className="illustration-text">
              <p>วางแผนภาษี</p>
              <p>ให้เป็นเรื่องง่าย</p>
              <p>สำหรับคุณ</p>
            </div>
          </div>
        </div>

        <div className="sidebar-tagline">
          <p>TaxMe © 2569</p>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
