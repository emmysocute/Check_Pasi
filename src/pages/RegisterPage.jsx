import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Alert from '../components/Alert';
import { isValidEmail } from '../utils/validation';

function RegisterPage() {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' });
    }
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Custom Validation
    const errors = {};

    if (!formData.displayName.trim()) {
      errors.displayName = 'กรุณาระบุชื่อที่แสดงของคุณ';
    }

    if (!formData.email.trim()) {
      errors.email = 'กรุณากรอกอีเมล';
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'รูปแบบอีเมลไม่ถูกต้อง (เช่น name@example.com)';
    }

    if (!formData.password) {
      errors.password = 'กรุณากำหนดรหัสผ่าน';
    } else if (formData.password.length < 6) {
      errors.password = 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'กรุณากรอกยืนยันรหัสผ่าน';
    } else if (formData.password && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      await register(formData.email, formData.password, formData.displayName);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-body)', padding: '20px' }}>
      <div className="form-card" style={{ width: '100%', maxWidth: '420px', padding: '36px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="logo-icon" style={{ margin: '0 auto 16px', width: '52px', height: '52px', fontSize: '26px' }}>📝</div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--gray-800)', marginBottom: '6px' }}>สมัครสมาชิก TaxMe</h2>
          <p style={{ fontSize: '13px', color: 'var(--gray-500)' }}>เริ่มต้นวางแผนภาษีง่าย ๆ และปลอดภัย</p>
        </div>

        {error && (
          <Alert type="error" message={error} onClose={() => setError('')} />
        )}

        <form noValidate onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">ชื่อที่แสดง (Display Name) <span style={{ color: '#ef4444' }}>*</span></label>
            <div className={`input-wrapper ${fieldErrors.displayName ? 'has-error' : ''}`}>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                placeholder="เช่น สมชาย"
              />
            </div>
            {fieldErrors.displayName && (
              <span className="field-error-msg">⚠️ {fieldErrors.displayName}</span>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">อีเมล <span style={{ color: '#ef4444' }}>*</span></label>
            <div className={`input-wrapper ${fieldErrors.email ? 'has-error' : ''}`}>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
              />
            </div>
            {fieldErrors.email && (
              <span className="field-error-msg">⚠️ {fieldErrors.email}</span>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">รหัสผ่าน (อย่างน้อย 6 ตัวอักษร) <span style={{ color: '#ef4444' }}>*</span></label>
            <div className={`input-wrapper ${fieldErrors.password ? 'has-error' : ''}`}>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="ตั้งรหัสผ่านของคุณ"
              />
            </div>
            {fieldErrors.password && (
              <span className="field-error-msg">⚠️ {fieldErrors.password}</span>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">ยืนยันรหัสผ่าน <span style={{ color: '#ef4444' }}>*</span></label>
            <div className={`input-wrapper ${fieldErrors.confirmPassword ? 'has-error' : ''}`}>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="กรอกรหัสผ่านอีกครั้ง"
              />
            </div>
            {fieldErrors.confirmPassword && (
              <span className="field-error-msg">⚠️ {fieldErrors.confirmPassword}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px' }}
            disabled={loading}
          >
            {loading ? 'กำลังสร้างบัญชี...' : 'สมัครสมาชิก'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13.5px', color: 'var(--gray-600)' }}>
          มีบัญชีอยู่แล้ว?{' '}
          <Link to="/login" style={{ color: 'var(--primary-600)', fontWeight: '600', textDecoration: 'none' }}>
            เข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
