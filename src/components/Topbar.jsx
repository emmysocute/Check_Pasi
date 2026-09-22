import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="logo-mini">💰</div>
        <span>TaxMe</span>
        <span style={{ color: 'var(--gray-300)', margin: '0 4px' }}>•</span>
        <span>คำนวณภาษีง่าย ๆ สำหรับคุณ</span>
      </div>
      <div className="topbar-right">
        <button className="topbar-bell" title="แจ้งเตือน">
          🔔
        </button>
        
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link to="/profile" className="topbar-user" style={{ textDecoration: 'none' }}>
              <div className="topbar-avatar">{user.display_name ? user.display_name.charAt(0).toUpperCase() : '👤'}</div>
              <span className="topbar-user-name">สวัสดี, {user.display_name || user.email}</span>
            </Link>
            <button 
              onClick={handleLogout}
              style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--gray-200)', background: '#fff', cursor: 'pointer', fontSize: '12px', color: 'var(--red-500)' }}
            >
              ออกจากระบบ
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to="/login" className="btn btn-outline" style={{ padding: '6px 16px', fontSize: '13px' }}>
              เข้าสู่ระบบ
            </Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '13px' }}>
              สมัครสมาชิก
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

export default Topbar;
