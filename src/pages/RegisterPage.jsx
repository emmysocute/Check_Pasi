import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function RegisterPage() {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('รหัสผ่านไม่ตรงกัน');
    }
    try {
      await register(formData.email, formData.password, formData.displayName);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-body)' }}>
      <div className="form-card" style={{ width: '400px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', color: 'var(--gray-800)' }}>สมัครสมาชิก TaxMe</h2>
        </div>
        
        {error && <div style={{ color: 'var(--red-500)', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">ชื่อที่แสดง</label>
            <div className="input-wrapper">
              <input type="text" name="displayName" value={formData.displayName} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">อีเมล</label>
            <div className="input-wrapper">
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">รหัสผ่าน</label>
            <div className="input-wrapper">
              <input type="password" name="password" value={formData.password} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">ยืนยันรหัสผ่าน</label>
            <div className="input-wrapper">
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>สมัครสมาชิก</button>
        </form>
        
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px' }}>
          มีบัญชีอยู่แล้ว? <Link to="/login" style={{ color: 'var(--primary-600)', textDecoration: 'none' }}>เข้าสู่ระบบ</Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
