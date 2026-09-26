import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import Alert from '../components/Alert';

function ProfilePage() {
  const { updateUser } = useAuth();

  // Profile Information State
  const [profile, setProfile] = useState({
    displayName: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    taxId: ''
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);

  // Password State
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/user/profile');
        if (res.data) {
          setProfile({
            displayName: res.data.display_name || '',
            firstName: res.data.first_name || '',
            lastName: res.data.last_name || '',
            phone: res.data.phone || '',
            address: res.data.address || '',
            taxId: res.data.tax_id || ''
          });
        }
      } catch (err) {
        console.error('Fetch profile error:', err);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
    if (profileErrors[name]) {
      setProfileErrors({ ...profileErrors, [name]: '' });
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords({ ...passwords, [name]: value });
    if (passwordErrors[name]) {
      setPasswordErrors({ ...passwordErrors, [name]: '' });
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMessage({ type: '', text: '' });

    // Validate fields
    const errors = {};
    if (!profile.displayName.trim()) {
      errors.displayName = 'กรุณาระบุชื่อที่แสดง';
    }
    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }

    setIsSubmittingProfile(true);

    try {
      await api.put('/user/profile', profile);
      if (updateUser) {
        updateUser({ display_name: profile.displayName });
      }
      setProfileMessage({ type: 'success', text: 'บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว' });
      setTimeout(() => setProfileMessage({ type: '', text: '' }), 4000);
    } catch (err) {
      setProfileMessage({
        type: 'error',
        text: err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
      });
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    // Custom Validation to replace browser native bubbles
    const errors = {};
    if (!passwords.currentPassword) {
      errors.currentPassword = 'กรุณากรอกรหัสผ่านปัจจุบันของคุณ';
    }
    if (!passwords.newPassword) {
      errors.newPassword = 'กรุณากรอกรหัสผ่านใหม่';
    } else if (passwords.newPassword.length < 6) {
      errors.newPassword = 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
    }

    if (!passwords.confirmPassword) {
      errors.confirmPassword = 'กรุณากรอกยืนยันรหัสผ่านใหม่อีกครั้ง';
    } else if (passwords.newPassword && passwords.newPassword !== passwords.confirmPassword) {
      errors.confirmPassword = 'รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน';
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setIsSubmittingPassword(true);

    try {
      await api.put('/user/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      setPasswordMessage({
        type: 'success',
        text: 'เปลี่ยนรหัสผ่านสำเร็จเรียบร้อยแล้ว'
      });
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordErrors({});
      setTimeout(() => setPasswordMessage({ type: '', text: '' }), 4000);
    } catch (err) {
      setPasswordMessage({
        type: 'error',
        text: err.response?.data?.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน'
      });
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', paddingTop: '24px', paddingBottom: '48px' }}>
      {/* ส่วนที่ 1: ข้อมูลส่วนตัว */}
      <div className="form-card" style={{ marginBottom: '24px' }}>
        <div className="section-header">
          <h3 className="section-title">👤 ข้อมูลส่วนตัว</h3>
        </div>
        <div className="section-body">
          {profileMessage.text && (
            <Alert
              type={profileMessage.type}
              message={profileMessage.text}
              onClose={() => setProfileMessage({ type: '', text: '' })}
            />
          )}

          <form noValidate onSubmit={handleProfileSubmit}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">ชื่อที่แสดง (Display Name) <span style={{ color: '#ef4444' }}>*</span></label>
              <div className={`input-wrapper ${profileErrors.displayName ? 'has-error' : ''}`}>
                <input
                  type="text"
                  name="displayName"
                  value={profile.displayName}
                  onChange={handleProfileChange}
                  placeholder="เช่น Emmy หรือ สมชาย"
                />
              </div>
              {profileErrors.displayName && (
                <span className="field-error-msg">⚠️ {profileErrors.displayName}</span>
              )}
            </div>

            <div className="form-grid-2" style={{ marginBottom: '16px' }}>
              <div className="form-group">
                <label className="form-label">ชื่อจริง (First Name)</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="firstName"
                    value={profile.firstName}
                    onChange={handleProfileChange}
                    placeholder="ชื่อจริง"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">นามสกุล (Last Name)</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="lastName"
                    value={profile.lastName}
                    onChange={handleProfileChange}
                    placeholder="นามสกุล"
                  />
                </div>
              </div>
            </div>

            <div className="form-grid-2" style={{ marginBottom: '16px' }}>
              <div className="form-group">
                <label className="form-label">เบอร์โทรศัพท์</label>
                <div className="input-wrapper">
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleProfileChange}
                    placeholder="08X-XXX-XXXX"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">เลขประจำตัวผู้เสียภาษี (Tax ID)</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="taxId"
                    value={profile.taxId}
                    onChange={handleProfileChange}
                    placeholder="เลขประจำตัว 13 หลัก"
                    maxLength={13}
                  />
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">ที่อยู่สำหรับออกเอกสาร</label>
              <div className="input-wrapper" style={{ height: 'auto', padding: '10px 14px' }}>
                <textarea
                  name="address"
                  value={profile.address}
                  onChange={handleProfileChange}
                  rows="3"
                  placeholder="ที่อยู่ บ้านเลขที่ ซอย ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
                  style={{
                    width: '100%',
                    border: 'none',
                    background: 'transparent',
                    resize: 'vertical',
                    outline: 'none',
                    fontFamily: 'inherit',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmittingProfile}
            >
              {isSubmittingProfile ? 'กำลังบันทึก...' : 'บันทึกข้อมูลส่วนตัว'}
            </button>
          </form>
        </div>
      </div>

      {/* ส่วนที่ 2: เปลี่ยนรหัสผ่าน */}
      <div className="form-card">
        <div className="section-header">
          <h3 className="section-title">🔒 เปลี่ยนรหัสผ่าน</h3>
        </div>
        <div className="section-body">
          {passwordMessage.text && (
            <Alert
              type={passwordMessage.type}
              message={passwordMessage.text}
              onClose={() => setPasswordMessage({ type: '', text: '' })}
            />
          )}

          <form noValidate onSubmit={handlePasswordSubmit}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">รหัสผ่านปัจจุบัน <span style={{ color: '#ef4444' }}>*</span></label>
              <div className={`input-wrapper ${passwordErrors.currentPassword ? 'has-error' : ''}`}>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwords.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="กรอกรหัสผ่านปัจจุบันของคุณ"
                />
              </div>
              {passwordErrors.currentPassword && (
                <span className="field-error-msg">⚠️ {passwordErrors.currentPassword}</span>
              )}
            </div>

            <div className="form-grid-2" style={{ marginBottom: '24px' }}>
              <div className="form-group">
                <label className="form-label">รหัสผ่านใหม่ <span style={{ color: '#ef4444' }}>*</span></label>
                <div className={`input-wrapper ${passwordErrors.newPassword ? 'has-error' : ''}`}>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwords.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="อย่างน้อย 6 ตัวอักษร"
                  />
                </div>
                {passwordErrors.newPassword && (
                  <span className="field-error-msg">⚠️ {passwordErrors.newPassword}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">ยืนยันรหัสผ่านใหม่ <span style={{ color: '#ef4444' }}>*</span></label>
                <div className={`input-wrapper ${passwordErrors.confirmPassword ? 'has-error' : ''}`}>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwords.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="กรอกยืนยันรหัสผ่านใหม่อีกครั้ง"
                  />
                </div>
                {passwordErrors.confirmPassword && (
                  <span className="field-error-msg">⚠️ {passwordErrors.confirmPassword}</span>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-secondary"
              disabled={isSubmittingPassword}
            >
              {isSubmittingPassword ? 'กำลังเปลี่ยนรหัสผ่าน...' : 'อัปเดตรหัสผ่าน'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
