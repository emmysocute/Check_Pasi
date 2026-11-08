import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Home,
  Calculator,
  CalendarDays,
  History,
  User,
  X,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

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
    { icon: Home, label: 'หน้าหลัก', path: '/' },
    { icon: Calculator, label: 'คำนวณภาษี', path: '/calculator' },
    { icon: CalendarDays, label: 'บันทึกรายได้ 12 เดือน', path: '/monthly-tracker' },
    { icon: History, label: 'ประวัติการคำนวณ', path: '/history', protected: true },
    { icon: User, label: 'โปรไฟล์', path: '/profile', protected: true },
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
          <Link to="/" className="sidebar-logo-brand" onClick={onClose}>
            <span className="logo-accent-mark">
              <Sparkles size={16} strokeWidth={2.5} />
            </span>
            <span className="logo-text">Check Pasi</span>
          </Link>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="ปิดเมนู"
            title="ปิดเมนู"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="เมนูหลัก">
          {navItems.map((item) => {
            if (item.protected && !user) return null;

            const IconComponent = item.icon;
            const isActive =
              location.pathname === item.path &&
              (item.path !== '/' || location.pathname === '/');

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`nav-item ${isActive ? 'active' : ''}`}
                style={{ textDecoration: 'none' }}
              >
                <span className="nav-icon" aria-hidden="true">
                  <IconComponent size={18} strokeWidth={isActive ? 2.2 : 1.75} />
                </span>
                <span className="nav-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Refined Trust Badge instead of AI cartoon mascot */}
        <div className="sidebar-footer-card">
          <div className="sidebar-footer-badge">
            <ShieldCheck size={16} className="badge-shield-icon" />
            <span className="badge-year-text">ปีภาษี 2569</span>
          </div>
          <p className="sidebar-footer-caption">
            ระบบคำนวณมาตรฐาน ภ.ง.ด. 90/91
          </p>
          <div className="sidebar-tagline">
            <span>Check Pasi © 2569</span>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
