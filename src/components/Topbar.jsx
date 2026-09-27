import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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
          className={`hamburger-btn ${isMenuOpen ? 'active' : ''}`}
          onClick={onToggleMenu}
          aria-label="เปิดเมนูนำทาง"
          title="เมนู"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        <div className="logo-mini">💰</div>
        <span className="topbar-brand-title">TaxMe</span>
        <span className="topbar-separator">•</span>
        <span className="topbar-tagline">คำนวณภาษีง่าย ๆ สำหรับคุณ</span>
      </div>

      <div className="topbar-right">
        <button className="topbar-bell" title="แจ้งเตือน">
          🔔
        </button>
        
        {user ? (
          <div className="topbar-user-section">
            <Link to="/profile" className="topbar-user" style={{ textDecoration: 'none' }}>
              <div className="topbar-avatar">{user.display_name ? user.display_name.charAt(0).toUpperCase() : '👤'}</div>
              <span className="topbar-user-name">สวัสดี, {user.display_name || user.email}</span>
            </Link>
            <button 
              onClick={handleLogout}
              className="topbar-logout-btn"
            >
              ออกจากระบบ
            </button>
          </div>
        ) : (
          <div className="topbar-auth-btns">
            <Link to="/login" className="btn btn-outline btn-sm">
              เข้าสู่ระบบ
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              สมัครสมาชิก
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

export default Topbar;
