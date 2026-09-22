import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();
  
  const navItems = [
    { icon: '🏠', label: 'หน้าหลัก', path: '/' },
    { icon: '🧮', label: 'คำนวณภาษี', path: '/calculator' },,
    { icon: '📋', label: 'ประวัติการคำนวณ', path: '/history', protected: true },
    { icon: '👤', label: 'โปรไฟล์', path: '/profile', protected: true },
    { icon: '⚙️', label: 'ตั้งค่า', path: '/' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">💰</div>
        <span className="logo-text">TaxMe</span>
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
        <p>TaxMe © 2568</p>
      </div>
    </aside>
  );
}

export default Sidebar;
