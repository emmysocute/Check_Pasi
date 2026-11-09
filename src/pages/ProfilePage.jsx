import { useState, useEffect, useRef } from 'react';
import {
  User,
  ShieldCheck,
  Eye,
  EyeOff,
  KeyRound,
  AlertCircle,
  Mail,
  Lock,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import Alert from '../components/Alert';
import { maskTaxId, formatTaxId } from '../utils/privacy';

function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isTaxIdRevealed, setIsTaxIdRevealed] = useState(false);
  const [isTaxIdFocused, setIsTaxIdFocused] = useState(false);
  const addressTextareaRef = useRef(null);

  // Profile Information State
  const [profile, setProfile] = useState({
    email: '',
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

  const formatPhoneNumber = (val) => {
    if (!val) return '';
    const digits = val.replace(/\D/g, '').slice(0, 10);
    if (digits.startsWith('02')) {
      if (digits.length <= 2) return digits;
      if (digits.length <= 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
      return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5, 9)}`;
    }
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/user/profile');
        if (res.data) {
          setProfile({
            email: res.data.email || user?.email || '',
            displayName: res.data.display_name || '',
            firstName: res.data.first_name || '',
            lastName: res.data.last_name || '',
            phone: formatPhoneNumber(res.data.phone || ''),
            address: res.data.address || '',
            taxId: (res.data.tax_id || '').replace(/\D/g, '').slice(0, 13)
          });
        }
      } catch (err) {
        console.error('Fetch profile error:', err);
      }
    };
    fetchProfile();
  }, [user?.email]);

  // Auto-grow textarea for Address without manual resize handle
  useEffect(() => {
    if (addressTextareaRef.current) {
      addressTextareaRef.current.style.height = 'auto';
      addressTextareaRef.current.style.height = `${Math.max(68, addressTextareaRef.current.scrollHeight)}px`;
    }
  }, [profile.address]);

  const getTaxIdInputValue = () => {
    if (!profile.taxId) return '';
    if (isTaxIdFocused || isTaxIdRevealed) {
      return formatTaxId(profile.taxId);
    }
    return maskTaxId(profile.taxId, false);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    let nextVal = value;

    if (name === 'phone') {
      nextVal = formatPhoneNumber(value);
    } else if (name === 'taxId') {
      nextVal = value.replace(/\D/g, '').slice(0, 13);
    } else if (name === 'address') {
      nextVal = value.slice(0, 500);
    }

    setProfile(prev => ({ ...prev, [name]: nextVal }));
    if (profileErrors[name]) {
      setProfileErrors(prev => ({ ...prev, [name]: '' }));
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

    if (profile.phone) {
      const phoneDigits = profile.phone.replace(/\D/g, '');
      if (phoneDigits.startsWith('02')) {
        if (phoneDigits.length !== 9) {
          errors.phone = 'เบอร์โทรศัพท์บ้านต้องมี 9 หลัก (เช่น 02-XXX-XXXX)';
        }
      } else {
        if (phoneDigits.length !== 10 || !phoneDigits.startsWith('0')) {
          errors.phone = 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลักขึ้นต้นด้วย 0 (เช่น 08X-XXX-XXXX)';
        }
      }
    }

    if (profile.taxId) {
      const taxDigits = profile.taxId.replace(/\D/g, '');
      if (taxDigits.length !== 13) {
        errors.taxId = 'เลขประจำตัวผู้เสียภาษีต้องมี 13 หลัก';
      }
    }

    if (profile.address && profile.address.length > 500) {
      errors.address = 'ที่อยู่ต้องไม่เกิน 500 ตัวอักษร';
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
    <div className="profile-page-container">
      {/* ส่วนที่ 1: ข้อมูลส่วนตัว */}
      <div className="form-card" style={{ marginBottom: '24px' }}>
        <div className="section-header">
          <div className="section-header-title-row">
            <User size={18} className="section-icon" />
            <h3 className="section-title">ข้อมูลส่วนตัว</h3>
          </div>
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
            {/* แถวที่ 1: อีเมลบัญชี (Read-only) และ ชื่อที่แสดง */}
            <div className="form-grid-2" style={{ marginBottom: '16px' }}>
              <div className="form-group">
                <div className="form-label-header">
                  <label htmlFor="profile-email" className="form-label">
                    อีเมลบัญชี (Email)
                  </label>
                  <span className="readonly-badge">
                    <Lock size={11} />
                    <span>ไม่สามารถแก้ไขได้</span>
                  </span>
                </div>
                <div className="input-wrapper input-readonly">
                  <Mail size={16} className="input-leading-icon" />
                  <input
                    id="profile-email"
                    type="email"
                    name="email"
                    value={profile.email || user?.email || ''}
                    readOnly
                    disabled
                    aria-readonly="true"
                    title="อีเมลผูกกับบัญชีผู้ใช้ ไม่สามารถเปลี่ยนได้"
                  />
                </div>
                <span className="field-hint">อีเมลหลักที่ใช้เข้าสู่ระบบ TaxMe</span>
              </div>

              <div className="form-group">
                <div className="form-label-header">
                  <label htmlFor="profile-display-name" className="form-label">
                    ชื่อที่แสดง (Display Name) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                </div>
                <div className={`input-wrapper ${profileErrors.displayName ? 'has-error' : ''}`}>
                  <input
                    id="profile-display-name"
                    type="text"
                    name="displayName"
                    value={profile.displayName}
                    onChange={handleProfileChange}
                    placeholder="เช่น Emmy หรือ สมชาย"
                  />
                </div>
                {profileErrors.displayName ? (
                  <span className="field-error-msg">
                    <AlertCircle size={13} />
                    <span>{profileErrors.displayName}</span>
                  </span>
                ) : (
                  <span className="field-hint">ชื่อที่ปรากฏในแถบเมนูและมุมขวาบน</span>
                )}
              </div>
            </div>

            <div className="form-grid-2" style={{ marginBottom: '16px' }}>
              <div className="form-group">
                <div className="form-label-header">
                  <label htmlFor="profile-first-name" className="form-label">
                    ชื่อจริง (First Name)
                  </label>
                </div>
                <div className="input-wrapper">
                  <input
                    id="profile-first-name"
                    type="text"
                    name="firstName"
                    value={profile.firstName}
                    onChange={handleProfileChange}
                    placeholder="ชื่อจริง"
                  />
                </div>
              </div>
              <div className="form-group">
                <div className="form-label-header">
                  <label htmlFor="profile-last-name" className="form-label">
                    นามสกุล (Last Name)
                  </label>
                </div>
                <div className="input-wrapper">
                  <input
                    id="profile-last-name"
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
                <div className="form-label-header">
                  <label htmlFor="profile-phone" className="form-label">
                    เบอร์โทรศัพท์
                  </label>
                </div>
                <div className={`input-wrapper ${profileErrors.phone ? 'has-error' : ''}`}>
                  <input
                    id="profile-phone"
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleProfileChange}
                    placeholder="08X-XXX-XXXX"
                    maxLength={12}
                  />
                </div>
                {profileErrors.phone ? (
                  <span className="field-error-msg">
                    <AlertCircle size={13} />
                    <span>{profileErrors.phone}</span>
                  </span>
                ) : (
                  <span className="field-hint">เบอร์โทรสำหรับติดต่อและรับแจ้งเตือน</span>
                )}
              </div>
              <div className="form-group">
                <div className="form-label-header">
                  <label htmlFor="profile-tax-id" className="form-label">
                    เลขประจำตัวผู้เสียภาษี (Tax ID)
                  </label>
                  <span className="privacy-badge" title="คุ้มครองข้อมูลส่วนบุคคลตาม พ.ร.บ. PDPA">
                    <ShieldCheck size={12} />
                    <span>PDPA</span>
                  </span>
                </div>
                <div className={`input-wrapper ${profileErrors.taxId ? 'has-error' : ''} has-action-btn`}>
                  <input
                    id="profile-tax-id"
                    type="text"
                    name="taxId"
                    value={getTaxIdInputValue()}
                    onChange={handleProfileChange}
                    onFocus={() => setIsTaxIdFocused(true)}
                    onBlur={() => setIsTaxIdFocused(false)}
                    placeholder="X-XXXX-XXXXX-XX-X"
                    maxLength={17}
                    autoComplete="off"
                    spellCheck="false"
                    style={{ fontFamily: 'monospace', letterSpacing: '0.04em' }}
                  />
                  <button
                    type="button"
                    className="input-eye-btn"
                    onClick={() => setIsTaxIdRevealed(prev => !prev)}
                    aria-label={isTaxIdRevealed ? 'ซ่อนเลขประจำตัวผู้เสียภาษี' : 'แสดงเลขประจำตัวผู้เสียภาษี'}
                    title={isTaxIdRevealed ? 'ซ่อนเลข' : 'แสดงเลข'}
                  >
                    {isTaxIdRevealed ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {profileErrors.taxId ? (
                  <span className="field-error-msg">
                    <AlertCircle size={13} />
                    <span>{profileErrors.taxId}</span>
                  </span>
                ) : (
                  <span className="field-hint">ระบบกำบังเลข 5 หลักตรงกลางเพื่อความปลอดภัย</span>
                )}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <div className="form-label-header">
                <label htmlFor="profile-address" className="form-label">ที่อยู่สำหรับออกเอกสาร</label>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  {profile.address.length}/500 ตัวอักษร
                </span>
              </div>
              <div className={`input-wrapper ${profileErrors.address ? 'has-error' : ''}`} style={{ height: 'auto', padding: '10px 14px' }}>
                <textarea
                  id="profile-address"
                  ref={addressTextareaRef}
                  name="address"
                  value={profile.address}
                  onChange={handleProfileChange}
                  rows={2}
                  maxLength={500}
                  placeholder="ที่อยู่ บ้านเลขที่ ซอย ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
                  style={{
                    width: '100%',
                    minHeight: '68px',
                    border: 'none',
                    background: 'transparent',
                    resize: 'none',
                    outline: 'none',
                    fontFamily: 'inherit',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    overflow: 'hidden'
                  }}
                />
              </div>
              {profileErrors.address && (
                <span className="field-error-msg">
                  <AlertCircle size={13} />
                  <span>{profileErrors.address}</span>
                </span>
              )}
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
          <div className="section-header-title-row">
            <KeyRound size={18} className="section-icon" />
            <h3 className="section-title">เปลี่ยนรหัสผ่าน</h3>
          </div>
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
              <div className="form-label-header">
                <label htmlFor="currentPassword" className="form-label">
                  รหัสผ่านปัจจุบัน <span style={{ color: '#ef4444' }}>*</span>
                </label>
              </div>
              <div className={`input-wrapper ${passwordErrors.currentPassword ? 'has-error' : ''}`}>
                <input
                  id="currentPassword"
                  type="password"
                  name="currentPassword"
                  value={passwords.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="กรอกรหัสผ่านปัจจุบันของคุณ"
                />
              </div>
              {passwordErrors.currentPassword && (
                <span className="field-error-msg">
                  <AlertCircle size={13} />
                  <span>{passwordErrors.currentPassword}</span>
                </span>
              )}
            </div>

            <div className="form-grid-2" style={{ marginBottom: '24px' }}>
              <div className="form-group">
                <div className="form-label-header">
                  <label htmlFor="newPassword" className="form-label">
                    รหัสผ่านใหม่ <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                </div>
                <div className={`input-wrapper ${passwordErrors.newPassword ? 'has-error' : ''}`}>
                  <input
                    id="newPassword"
                    type="password"
                    name="newPassword"
                    value={passwords.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="อย่างน้อย 6 ตัวอักษร"
                  />
                </div>
                {passwordErrors.newPassword && (
                  <span className="field-error-msg">
                    <AlertCircle size={13} />
                    <span>{passwordErrors.newPassword}</span>
                  </span>
                )}
              </div>

              <div className="form-group">
                <div className="form-label-header">
                  <label htmlFor="confirmPassword" className="form-label">
                    ยืนยันรหัสผ่านใหม่ <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                </div>
                <div className={`input-wrapper ${passwordErrors.confirmPassword ? 'has-error' : ''}`}>
                  <input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    value={passwords.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="กรอกยืนยันรหัสผ่านใหม่อีกครั้ง"
                  />
                </div>
                {passwordErrors.confirmPassword && (
                  <span className="field-error-msg">
                    <AlertCircle size={13} />
                    <span>{passwordErrors.confirmPassword}</span>
                  </span>
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
