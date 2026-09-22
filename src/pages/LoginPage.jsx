import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-body)' }}>
      <div className="form-card" style={{ width: '400px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="logo-icon" style={{ margin: '0 auto 16px', width: '48px', height: '48px', fontSize: '24px' }}>💰</div>
          <h2 style={{ fontSize: '24px', color: 'var(--gray-800)' }}>เข้าสู่ระบบ TaxMe</h2>
        </div>
        
        {error && <div style={{ color: 'var(--red-500)', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">อีเมล</label>
            <div className="input-wrapper">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">รหัสผ่าน</label>
            <div className="input-wrapper">
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>เข้าสู่ระบบ</button>
        </form>
        
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px' }}>
          ยังไม่มีบัญชี? <Link to="/register" style={{ color: 'var(--primary-600)', textDecoration: 'none' }}>สมัครสมาชิก</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
