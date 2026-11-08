import { ShieldCheck } from 'lucide-react';

function WelcomeBanner() {
  return (
    <div className="welcome-banner">
      <div className="welcome-text">
        <h2>คำนวณภาษีเงินได้บุคคลธรรมดา</h2>
        <p>
          คำนวณและวางแผนลดหย่อนภาษี ตามอัตราภาษีปี 2569
          <br />
          กรอกข้อมูลรายได้และค่าลดหย่อนเพื่อตรวจสอบจำนวนภาษีและวางแผนขอคืนภาษี
        </p>
      </div>
      <div className="welcome-badge">
        <ShieldCheck size={16} />
        <span className="welcome-badge-text">ปีภาษี 2569</span>
      </div>
    </div>
  );
}

export default WelcomeBanner;
