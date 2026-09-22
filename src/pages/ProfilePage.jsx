import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    displayName: '',
    phone: '',
    address: '',
    taxId: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/user/profile');
        if (res.data) {
          setProfile({
            displayName: res.data.display_name || '',
            phone: res.data.phone || '',
            address: res.data.address || '',
            taxId: res.data.tax_id || ''
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put('/user/profile', profile);
      setMessage('บันทึกข้อมูลสำเร็จ!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '24px' }}>
      <div className="form-card">
        <div className="section-header">
          <h3 className="section-title">ตั้งค่าโปรไฟล์</h3>
        </div>
        <div className="section-body">
          {message && (
            <div style={{ padding: '12px', background: 'var(--green-50)', color: 'var(--green-500)', borderRadius: '8px', marginBottom: '16px' }}>
              {message}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">ชื่อที่แสดง</label>
              <div className="input-wrapper">
                <input type="text" name="displayName" value={profile.displayName} onChange={handleChange} />
              </div>
            </div>
            
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">เบอร์โทรศัพท์</label>
              <div className="input-wrapper">
                <input type="text" name="phone" value={profile.phone} onChange={handleChange} />
              </div>
            </div>
            
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">เลขประจำตัวผู้เสียภาษี</label>
              <div className="input-wrapper">
                <input type="text" name="taxId" value={profile.taxId} onChange={handleChange} />
              </div>
            </div>
            
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">ที่อยู่</label>
              <div className="input-wrapper" style={{ height: 'auto', padding: '10px 14px' }}>
                <textarea 
                  name="address" 
                  value={profile.address} 
                  onChange={handleChange}
                  rows="3"
                  style={{ width: '100%', border: 'none', background: 'transparent', resize: 'vertical', outline: 'none', fontFamily: 'inherit' }}
                />
              </div>
            </div>
            
            <button type="submit" className="btn btn-primary">บันทึกข้อมูล</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
