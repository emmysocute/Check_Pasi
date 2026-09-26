import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Alert from '../components/Alert';
import { isValidEmail } from '../utils/validation';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (fieldErrors.email) {
      setFieldErrors({ ...fieldErrors, email: '' });
    }
    if (error) setError('');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (fieldErrors.password) {
      setFieldErrors({ ...fieldErrors, password: '' });
    }
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Custom Validation to replace browser native bubbles
    const errors = {};

    if (!email.trim()) {
      errors.email = 'กรุณากรอกอีเมลของคุณ';
    } else if (!isValidEmail(email)) {
      errors.email = 'รูปแบบอีเมลไม่ถูกต้อง (เช่น name@example.com)';
    }

    if (!password) {
      errors.password = 'กรุณากรอกรหัสผ่านของคุณ';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-body)', padding: '20px' }}>
      <div className="form-card" style={{ width: '100%', maxWidth: '420px', padding: '36px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="logo-icon" style={{ margin: '0 auto 16px', width: '52px', height: '52px', fontSize: '26px' }}>💰</div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--gray-800)', marginBottom: '6px' }}>เข้าสู่ระบบ TaxMe</h2>
          <p style={{ fontSize: '13px', color: 'var(--gray-500)' }}>ระบบคำนวณและวางแผนภาษีเงินได้บุคคลธรรมดา</p>
        </div>
        
        {error && (
          <Alert type="error" message={error} onClose={() => setError('')} />
        )}
        
        <form noValidate onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">อีเมล</label>
            <div className={`input-wrapper ${fieldErrors.email ? 'has-error' : ''}`}>
              <input
                type="text"
                value={email}
                onChange={handleEmailChange}
                placeholder="name@example.com"
              />
            </div>
            {fieldErrors.email && (
              <span className="field-error-msg">⚠️ {fieldErrors.email}</span>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">รหัสผ่าน</label>
            <div className={`input-wrapper ${fieldErrors.password ? 'has-error' : ''}`}>
              <input
                type="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="กรอกรหัสผ่านของคุณ"
              />
            </div>
            {fieldErrors.password && (
              <span className="field-error-msg">⚠️ {fieldErrors.password}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px' }}
            disabled={loading}
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>
        
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13.5px', color: 'var(--gray-600)' }}>
          ยังไม่มีบัญชีผู้ใช้งาน?{' '}
          <Link to="/register" style={{ color: 'var(--primary-600)', fontWeight: '600', textDecoration: 'none' }}>
            สมัครสมาชิก
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
