import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  Scale,
  FileText,
  Briefcase,
  Lock,
  Sparkles,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { calculateTax } from '../utils/taxEngine';
import { formatNumberWithCommas, parseFormattedNumber, blockInvalidChars } from '../utils/numberInput';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(Boolean(user));
  
  // Interactive Quick Calculator state for Landing Page
  const [quickSalary, setQuickSalary] = useState(30000);

  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    const fetchHistory = async () => {
      try {
        const res = await api.get('/tax/history');
        if (isMounted) setHistory(res.data);
      } catch (err) {
        console.error('Fetch home history error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchHistory();
    return () => { isMounted = false; };
  }, [user]);

  const fmt = (n) => Number(n ?? 0).toLocaleString('th-TH');

  // Quick estimation for landing page demo (Good React #03 Derived State)
  const quickEstimate = useMemo(() => {
    return calculateTax({
      monthlyIncome: quickSalary,
      freelanceIncome: 0,
      withholdingTax: 0,
      personalAllowance: 60000,
    });
  }, [quickSalary]);

  const handleStartWithSalary = () => {
    navigate('/calculator', { state: { prefillSalary: quickSalary } });
  };

  if (user && loading) {
    return (
      <div className="home-container" style={{ padding: '40px 24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--gray-500)' }}>กำลังโหลดข้อมูลสถิติ...</p>
      </div>
    );
  }

  // ===== PUBLIC LANDING PAGE (When not logged in) =====
  if (!user) {
    return (
      <div className="home-container landing-container">
        {/* Hero Section */}
        <section className="landing-hero animate-in">
          <div className="landing-badge">
            <span className="badge-sparkle" aria-hidden="true">
              <Sparkles size={14} />
            </span>
            <span>ระบบคำนวณและวางแผนภาษี ปีภาษี 2569</span>
          </div>

          <h1 className="landing-title">
            วางแผนภาษีเงินได้บุคคลธรรมดา
            <br />
            <span className="highlight-text">ให้เป็นเรื่องง่ายและคุ้มค่าที่สุด</span>
          </h1>

          <p className="landing-desc">
            คำนวณภาษีแม่นยำตามเกณฑ์กรมสรรพากรไทย รองรับทั้งเงินเดือนประจำและรายได้ฟรีแลนซ์
            พร้อมจัดหมวดหมู่ลดหย่อน 4 กลุ่มมาตรฐาน ภ.ง.ด. 90/91 เช็กสิทธิ์ครบ ไม่ตกหล่น
          </p>

          <div className="landing-cta-group">
            <Link to="/calculator" className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
              <span>เริ่มคำนวณภาษีเต็มรูปแบบ (ฟรี)</span>
              <ArrowRight size={16} />
            </Link>
            <Link to="/monthly-tracker" className="btn btn-outline btn-lg" style={{ textDecoration: 'none' }}>
              <CalendarDays size={16} />
              <span>บันทึกรายได้ฟรีแลนซ์ 12 เดือน</span>
            </Link>
          </div>
        </section>

        {/* Interactive Quick Calculator Demo Widget */}
        <section className="quick-calc-section animate-in-delay-1">
          <div className="quick-calc-card">
            <div className="quick-calc-header">
              <div className="quick-calc-icon" aria-hidden="true">
                <Zap size={20} />
              </div>
              <div>
                <h2 className="quick-calc-title">ทดลองคำนวณภาษีเบื้องต้นทันที</h2>
                <p className="quick-calc-subtitle">ใส่เงินเดือนของคุณเพื่อดูประมาณการภาษีและเงินได้สุทธิ</p>
              </div>
            </div>

            <div className="quick-calc-body">
              <div className="quick-calc-input-group">
                <label className="form-label" htmlFor="quick-salary-input">
                  เงินเดือนประจำของคุณ
                </label>
                <div className="input-wrapper">
                  <span className="input-prefix" aria-hidden="true">฿</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    id="quick-salary-input"
                    value={formatNumberWithCommas(quickSalary)}
                    onChange={(e) => setQuickSalary(parseFormattedNumber(e.target.value))}
                    onKeyDown={blockInvalidChars}
                    placeholder="0"
                  />
                  <span className="input-suffix">บาท / เดือน</span>
                </div>
              </div>

              <div className="quick-calc-result-grid">
                <div className="quick-result-item">
                  <span className="result-label">รายได้ทั้งปี (x12)</span>
                  <strong className="result-val">{fmt(quickEstimate.annualSalary)} บาท</strong>
                </div>
                <div className="quick-result-item">
                  <span className="result-label">หักค่าใช้จ่าย + ลดหย่อนส่วนตัว</span>
                  <strong className="result-val text-green">- {fmt(quickEstimate.expenseDeduction + 60000)} บาท</strong>
                </div>
                <div className="quick-result-item">
                  <span className="result-label">เงินได้สุทธิพึงประเมิน</span>
                  <strong className="result-val">{fmt(quickEstimate.netIncome)} บาท</strong>
                </div>
                <div className="quick-result-item highlight">
                  <span className="result-label">ภาษีประมาณการ (ก่อนลดหย่อนอื่น)</span>
                  <strong className="result-val text-primary">{fmt(quickEstimate.tax)} บาท</strong>
                </div>
              </div>

              <div className="quick-calc-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleStartWithSalary}
                >
                  <span>นำยอดนี้ไปวางแผนลดหย่อนต่อ (เช็กประกัน, กองทุน, ครอบครัว)</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Core Highlights */}
        <section className="landing-features animate-in-delay-2">
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon" aria-hidden="true">
                <Scale size={22} />
              </div>
              <h3 className="feature-title">แม่นยำตามเกณฑ์สรรพากร 2569</h3>
              <p className="feature-desc">
                คิดอัตราภาษีก้าวหน้า 8 ขั้นบันไดอย่างถูกต้อง พร้อมระบบเปรียบเทียบภาษีเหมา 0.5% (ม.48(2)) สำหรับผู้มีรายได้ฟรีแลนซ์เกิน 1.2 แสนบาท
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" aria-hidden="true">
                <FileText size={22} />
              </div>
              <h3 className="feature-title">โครงสร้างลดหย่อน 4 หมวด ภ.ง.ด.</h3>
              <p className="feature-desc">
                จัดหมวดหมู่ ตนเอง/ครอบครัว, ประกัน/การออม, ที่อยู่อาศัย, และเงินบริจาค ตามแบบยื่นจริงของกรมสรรพากร ช่วยเตือนสิทธิ์ครบถ้วน
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" aria-hidden="true">
                <Briefcase size={22} />
              </div>
              <h3 className="feature-title">บันทึกรายได้ฟรีแลนซ์ 12 เดือน</h3>
              <p className="feature-desc">
                สำหรับคนทำงานอิสระ มีปุ่มลัดคำนวณหัก ณ ที่จ่าย 3% สะสมยอดรายเดือน และส่งยอดไปคำนวณภาษีประจำปีได้ในคลิกเดียว
              </p>
            </div>
          </div>
        </section>

        {/* Security / Trust Assurance */}
        <section className="landing-trust-bar">
          <span className="trust-icon" aria-hidden="true">
            <Lock size={15} />
          </span>
          <span>ข้อมูลการคำนวณปลอดภัย ไม่มีการส่งต่อให้บุคคลภายนอก ใช้งานฟรี 100%</span>
        </section>
      </div>
    );
  }

  // ===== LOGGED-IN DASHBOARD (When user has no history yet) =====
  if (history.length === 0) {
    return (
      <div className="home-container" style={{ textAlign: 'center', padding: '40px 24px' }}>
        <div className="welcome-banner animate-in">
          <div className="welcome-text" style={{ width: '100%' }}>
            <h2>ยินดีต้อนรับ, {user.display_name || user.email}</h2>
            <p style={{ margin: '0 auto 16px' }}>คุณยังไม่มีประวัติการคำนวณภาษีที่บันทึกไว้</p>
            <Link to="/calculator" className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
              <span>เริ่มคำนวณและบันทึกประวัติภาษี</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ===== LOGGED-IN DASHBOARD (With History) =====
  const latest = history[0];
  const annualIncome = Number(latest.annual_income) || 0;
  const expenseAndDeduction = Number(latest.total_deduction) + Number(latest.expense_deduction || 0);
  const taxAmount = Number(latest.tax_amount) || 0;
  const withholdingTax = Number(latest.withholding_tax) || 0;
  const netBalance = taxAmount - withholdingTax;
  const takeHomeIncome = Math.max(0, annualIncome - taxAmount);

  const chartData = [
    { name: 'เงินได้สุทธิคงเหลือหลังภาษี', value: takeHomeIncome, color: '#1a6ae0' },
    { name: 'หักค่าใช้จ่าย & ค่าลดหย่อน', value: expenseAndDeduction, color: '#12b76a' },
    { name: 'ภาษีที่คำนวณได้', value: taxAmount, color: '#f59e0b' }
  ];

  return (
    <div className="home-container">
      <div className="welcome-banner animate-in" style={{ marginBottom: '24px' }}>
        <div className="welcome-text">
          <h2>สถิติภาษีล่าสุดของคุณ</h2>
          <p>สรุปข้อมูลจากการคำนวณครั้งล่าสุด (ปีภาษี 2569)</p>
        </div>
        <div className="welcome-badge">
          <div className="welcome-badge-text">ปีภาษี 2569</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* สถิติสรุป */}
        <div className="form-card animate-in-delay-1" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>ข้อมูลการคำนวณล่าสุด</h3>
          
          <div className="result-breakdown" style={{ padding: '0' }}>
            <div className="result-row">
              <span className="result-row-label">รายได้ทั้งปี</span>
              <span className="result-row-value">
                {fmt(latest.annual_income)} <span className="result-row-unit">บาท</span>
              </span>
            </div>
            <div className="result-row">
              <span className="result-row-label">รวมหักค่าใช้จ่าย & ลดหย่อน</span>
              <span className="result-row-value">
                {fmt(expenseAndDeduction)} <span className="result-row-unit">บาท</span>
              </span>
            </div>
            <div className="result-row highlight">
              <span className="result-row-label">เงินได้สุทธิ</span>
              <span className="result-row-value">
                {fmt(latest.net_income)} <span className="result-row-unit">บาท</span>
              </span>
            </div>
            {withholdingTax > 0 && (
              <div className="result-row">
                <span className="result-row-label">หัก ณ ที่จ่ายสะสม</span>
                <span className="result-row-value" style={{ color: 'var(--primary-600)' }}>
                  - {fmt(withholdingTax)} <span className="result-row-unit">บาท</span>
                </span>
              </div>
            )}
          </div>

          {/* สรุปสถานะภาษีสุทธิ (Calm palette) */}
          {withholdingTax > 0 && netBalance < 0 ? (
            <div className="home-refund-card">
              <div className="home-refund-badge">
                <Sparkles size={14} className="inline-sparkle" />
                <span>ได้รับเงินคืนภาษีสุทธิ (Tax Refund)</span>
              </div>
              <div className="home-refund-label">ยอดเงินที่คุณจะได้รับคืนจากกรมสรรพากร</div>
              <div className="home-refund-amount">
                +{fmt(Math.abs(netBalance))} <span className="home-refund-unit">บาท</span>
              </div>
            </div>
          ) : withholdingTax > 0 && netBalance > 0 ? (
            <div className="home-payable-card">
              <div className="home-payable-badge">
                <AlertCircle size={14} />
                <span>ยอดภาษีที่ต้องชำระเพิ่มเติม</span>
              </div>
              <div className="home-payable-label">ยอดภาษีที่ต้องนำส่งเพิ่มหลังหัก ณ ที่จ่ายแล้ว</div>
              <div className="home-payable-amount">
                {fmt(netBalance)} <span className="home-payable-unit">บาท</span>
              </div>
            </div>
          ) : (
            <div className="home-default-tax-card">
              <div className="home-default-tax-label">ภาษีที่ต้องชำระ (ประมาณการ)</div>
              <div className="home-default-tax-amount">
                {fmt(latest.tax_amount)} <span className="home-default-tax-unit">บาท</span>
              </div>
            </div>
          )}
          
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <Link to="/calculator" className="btn btn-primary" style={{ width: '100%', textDecoration: 'none' }}>
              <span>ไปหน้าคำนวณภาษี</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* กราฟวงกลม */}
        <div className="form-card animate-in-delay-2 home-chart-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>สัดส่วนรายได้และภาษี</h3>
          
          <div className="chart-container-wrapper" style={{ flex: 1, minHeight: '280px' }}>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${fmt(value)} บาท`} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
