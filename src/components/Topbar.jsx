import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Bell, User, LogOut } from 'lucide-react';

function Topbar({ onToggleMenu = () => {}, isMenuOpen = false }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className={`hamburger-btn ${isMenuOpen ? 'active' : ''}`}
          onClick={onToggleMenu}
          aria-label="เปิดเมนูนำทาง"
          title="เมนู"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        <span className="topbar-brand-title">TaxMe</span>
        <span className="topbar-separator">•</span>
        <span className="topbar-tagline">ระบบคำนวณภาษีเงินได้บุคคลธรรมดา</span>
      </div>

      <div className="topbar-right">
        <button type="button" className="topbar-bell" title="การแจ้งเตือน" aria-label="การแจ้งเตือน">
          <Bell size={18} strokeWidth={1.75} />
        </button>

        {user ? (
          <div className="topbar-user-section">
            <Link to="/profile" className="topbar-user" style={{ textDecoration: 'none' }}>
              <div className="topbar-avatar" aria-hidden="true">
                {user.display_name ? (
                  user.display_name.charAt(0).toUpperCase()
                ) : (
                  <User size={14} />
                )}
              </div>
              <span className="topbar-user-name">
                สวัสดี, {user.display_name || user.email}
              </span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="topbar-logout-btn"
              title="ออกจากระบบ"
            >
              <LogOut size={14} />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        ) : (
          <div className="topbar-auth-btns">
            <Link to="/login" className="btn btn-outline btn-sm topbar-btn-login" style={{ textDecoration: 'none' }}>
              เข้าสู่ระบบ
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm topbar-btn-register" style={{ color: '#ffffff', textDecoration: 'none' }}>
              <span style={{ color: '#ffffff' }}>สมัครสมาชิก</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

export default Topbar;
