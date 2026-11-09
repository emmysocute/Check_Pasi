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
  Wallet,
  ShieldCheck,
  TrendingUp,
  FileSpreadsheet,
  SlidersHorizontal,
  Printer,
  ChevronRight,
  PieChart as PieChartIcon,
  Lightbulb,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { calculateTax, TAX_BRACKETS } from '../utils/taxEngine';
import { formatNumberWithCommas, parseFormattedNumber, blockInvalidChars } from '../utils/numberInput';
import PreFilingSheetModal from '../components/PreFilingSheetModal';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(Boolean(user));
  const [showPreFilingModal, setShowPreFilingModal] = useState(false);
  
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
            <Link to="/calculator" className="btn btn-primary btn-lg" style={{ color: '#ffffff', textDecoration: 'none' }}>
              <span style={{ color: '#ffffff' }}>เริ่มคำนวณภาษีเต็มรูปแบบ (ฟรี)</span>
              <ArrowRight size={16} color="#ffffff" />
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
            <Link to="/calculator" className="btn btn-primary btn-lg" style={{ color: '#ffffff', textDecoration: 'none' }}>
              <span style={{ color: '#ffffff' }}>เริ่มคำนวณและบันทึกประวัติภาษี</span>
              <ArrowRight size={16} color="#ffffff" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ===== LOGGED-IN DASHBOARD (With History) =====
  const latest = history[0];
  const expenseAndDeduction = Number(latest.total_deduction) + Number(latest.expense_deduction || 0);
  const annualIncome = Number(latest.annual_income) || 
    (Number(latest.monthly_income || 0) * 12 + Number(latest.freelance_income || 0)) || 
    (Number(latest.net_income || 0) + expenseAndDeduction);
  const taxAmount = Number(latest.tax_amount) || 0;
  const withholdingTax = Number(latest.withholding_tax) || 0;
  const netBalance = taxAmount - withholdingTax;
  const takeHomeIncome = Math.max(0, annualIncome - taxAmount);
  const netIncome = Number(latest.net_income) || Math.max(0, annualIncome - expenseAndDeduction);

  let marginalRate = 0;
  TAX_BRACKETS.forEach((bracket) => {
    if (netIncome > bracket.min) {
      marginalRate = bracket.rate;
    }
  });

  const effectiveTaxRate = annualIncome > 0 ? ((taxAmount / annualIncome) * 100).toFixed(1) : '0.0';
  const takeHomePct = annualIncome > 0 ? ((takeHomeIncome / annualIncome) * 100).toFixed(1) : '0.0';
  const deductionPct = annualIncome > 0 ? ((expenseAndDeduction / annualIncome) * 100).toFixed(1) : '0.0';
  const taxPct = annualIncome > 0 ? ((taxAmount / annualIncome) * 100).toFixed(1) : '0.0';

  const chartData = [
    { name: 'เงินได้สุทธิคงเหลือหลังภาษี', value: takeHomeIncome, color: '#2563eb' },
    { name: 'หักค่าใช้จ่าย & ค่าลดหย่อน', value: expenseAndDeduction, color: '#059669' },
    { name: 'ภาษีที่คำนวณได้', value: taxAmount, color: '#f59e0b' }
  ];

  const prefilingData = latest ? {
    annualSalary: Number(latest.monthly_income || 0) * 12,
    freelanceIncome: Number(latest.freelance_income || 0),
    sumIncome: annualIncome,
    expenseDeduction: Number(latest.expense_deduction || 0),
    totalDeduction: Number(latest.total_deduction || 0),
    netIncome: netIncome,
    finalTax: taxAmount,
    withholdingTax: withholdingTax,
    status: netBalance < 0 ? 'refund' : netBalance > 0 ? 'payable' : 'zero',
    refundAmount: netBalance < 0 ? Math.abs(netBalance) : 0,
    payableAmount: netBalance > 0 ? netBalance : 0,
    taxMethod: latest.tax_method || 'bracket',
    marginalRate: marginalRate,
    itemizedDeductions: {
      personal: Number(latest.personal_allowance || 60000),
      spouse: Number(latest.spouse_allowance || 0),
      child: Number(latest.child_allowance || 0),
      insurance: Number(latest.insurance || 0),
      socialSecurity: Number(latest.social_security || 0),
      investmentFund: Number(latest.investment_fund || 0),
      homeLoanInterest: Number(latest.home_loan_interest || 0),
      parentAllowance: Number(latest.parent_allowance || 0),
      donation: Number(latest.donation || 0),
    }
  } : null;

  return (
    <div className="home-container">
      {/* ภ.ง.ด. 90/91 Pre-Filing Sheet Modal */}
      {showPreFilingModal && prefilingData && (
        <PreFilingSheetModal
          result={prefilingData}
          onClose={() => setShowPreFilingModal(false)}
        />
      )}

      {/* Header Banner */}
      <div className="welcome-banner animate-in" style={{ marginBottom: '24px' }}>
        <div className="welcome-text">
          <h2>ภาพรวมการวางแผนภาษีของคุณ</h2>
          <p>
            สรุปข้อมูลสถิติและการคำนวณล่าสุด • ยินดีต้อนรับคุณ {user.display_name || user.email}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div className="welcome-badge">
            <div className="welcome-badge-text">ปีภาษี 2569</div>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setShowPreFilingModal(true)}
            style={{ background: '#ffffff', borderColor: 'var(--gray-300)' }}
          >
            <Printer size={14} />
            <span>พิมพ์แผ่นสรุป ภ.ง.ด.</span>
          </button>
        </div>
      </div>

      {/* 1. 4 Metric Bento Cards */}
      <div className="kpi-bento-grid animate-in-delay-1">
        {/* KPI 1: Annual Income */}
        <div className="kpi-bento-card">
          <div className="kpi-card-top">
            <span className="kpi-card-title">รายได้รวมทั้งปี</span>
            <div className="kpi-icon-badge blue" aria-hidden="true">
              <Wallet size={16} />
            </div>
          </div>
          <div className="kpi-card-amount">
            {fmt(annualIncome)} <span className="kpi-unit">บาท</span>
          </div>
          <div className="kpi-card-footer">
            <span>มาตรา 40(1) และ 40(2)</span>
          </div>
        </div>

        {/* KPI 2: Deductions */}
        <div className="kpi-bento-card">
          <div className="kpi-card-top">
            <span className="kpi-card-title">รวมค่าใช้จ่าย & สิทธิลดหย่อน</span>
            <div className="kpi-icon-badge emerald" aria-hidden="true">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="kpi-card-amount">
            {fmt(expenseAndDeduction)} <span className="kpi-unit">บาท</span>
          </div>
          <div className="kpi-card-footer">
            <span>หัก 50% + 4 หมวดสรรพากร</span>
          </div>
        </div>

        {/* KPI 3: Marginal Tax Bracket */}
        <div className="kpi-bento-card">
          <div className="kpi-card-top">
            <span className="kpi-card-title">ฐานภาษีสูงสุดของคุณ</span>
            <div className="kpi-icon-badge purple" aria-hidden="true">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="kpi-card-amount">
            {Math.round(marginalRate * 100)}%
          </div>
          <div className="kpi-card-footer">
            <span>เงินได้สุทธิ {fmt(netIncome)} บ.</span>
          </div>
        </div>

        {/* KPI 4: Net Tax / Refund Position */}
        <div className="kpi-bento-card">
          <div className="kpi-card-top">
            <span className="kpi-card-title">
              {withholdingTax > 0 && netBalance < 0
                ? 'ยอดเงินคืนภาษีสุทธิ'
                : withholdingTax > 0 && netBalance > 0
                ? 'ยอดภาษีที่ต้องชำระเพิ่ม'
                : 'ภาษีที่ต้องชำระ (ทั้งปี)'}
            </span>
            <div
              className={`kpi-icon-badge ${
                netBalance < 0 ? 'emerald' : netBalance > 0 ? 'amber' : 'blue'
              }`}
              aria-hidden="true"
            >
              {netBalance < 0 ? <Sparkles size={16} /> : <AlertCircle size={16} />}
            </div>
          </div>
          <div
            className={`kpi-card-amount ${
              netBalance < 0
                ? 'highlight-refund'
                : netBalance > 0
                ? 'highlight-payable'
                : ''
            }`}
          >
            {netBalance < 0
              ? `+${fmt(Math.abs(netBalance))}`
              : netBalance > 0
              ? fmt(netBalance)
              : fmt(taxAmount)}{' '}
            <span className="kpi-unit">บาท</span>
          </div>
          <div className="kpi-card-footer">
            {withholdingTax > 0 ? (
              <span>หลังหัก ณ ที่จ่าย {fmt(withholdingTax)} บ.</span>
            ) : (
              <span>ยังไม่มีภาษีหัก ณ ที่จ่ายสะสม</span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Middle Section: Donut Breakdown + Advisor / Quick Actions */}
      <div className="home-dual-grid animate-in-delay-2">
        {/* Left: Donut Chart & Breakdown */}
        <div className="home-panel-card">
          <div className="home-panel-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PieChartIcon size={18} style={{ color: 'var(--primary-600)' }} />
              <h3>สัดส่วนโครงสร้างภาษีและรายได้</h3>
            </div>
            <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '11.5px', padding: '3px 8px', borderRadius: '4px' }}>
              ปีภาษี 2569
            </span>
          </div>

          <div style={{ position: 'relative', width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={88}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${fmt(value)} บาท`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="donut-center-metric">
            <div className="metric-val">{effectiveTaxRate}%</div>
            <div className="metric-label">อัตราภาษีเฉลี่ยจริง (Effective Tax Rate)</div>
          </div>

          <div className="donut-breakdown-list">
            <div className="donut-breakdown-item">
              <span className="donut-item-label">
                <span className="donut-color-dot" style={{ background: '#2563eb' }}></span>
                <span>เงินได้สุทธิคงเหลือหลังภาษี (Take-home)</span>
              </span>
              <span className="donut-item-val">
                {fmt(takeHomeIncome)} บาท <span className="donut-item-pct">({takeHomePct}%)</span>
              </span>
            </div>

            <div className="donut-breakdown-item">
              <span className="donut-item-label">
                <span className="donut-color-dot" style={{ background: '#059669' }}></span>
                <span>หักค่าใช้จ่าย & สิทธิลดหย่อน</span>
              </span>
              <span className="donut-item-val">
                {fmt(expenseAndDeduction)} บาท <span className="donut-item-pct">({deductionPct}%)</span>
              </span>
            </div>

            <div className="donut-breakdown-item">
              <span className="donut-item-label">
                <span className="donut-color-dot" style={{ background: '#f59e0b' }}></span>
                <span>ภาษีที่คำนวณได้</span>
              </span>
              <span className="donut-item-val">
                {fmt(taxAmount)} บาท <span className="donut-item-pct">({taxPct}%)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Smart Advisor & Action Hub */}
        <div className="home-panel-card">
          <div className="home-panel-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lightbulb size={18} style={{ color: '#d97706' }} />
              <h3>ข้อแนะนำและเครื่องมือด่วน</h3>
            </div>
          </div>

          {/* Smart Tax Advisor Box */}
          <div className="tax-advisor-box">
            <div className="advisor-box-header">
              <Sparkles size={15} />
              <span>โอกาสประหยัดภาษี (Tax Health Insight)</span>
            </div>
            <p className="advisor-box-text">
              {marginalRate > 0 ? (
                <>
                  ฐานภาษีของคุณอยู่ที่ <strong>{Math.round(marginalRate * 100)}%</strong> ทุกๆ ยอดลดหย่อนเพิ่ม <strong>฿10,000</strong> จะช่วยให้คุณประหยัดเงินภาษีได้จริงทันที <strong>฿{fmt(10000 * marginalRate)} บาท</strong> วางแผนใช้สิทธิประกันหรือกองทุน RMF/SSF เพื่อเซฟภาษีสูงสุด
                </>
              ) : (
                <>
                  เงินได้สุทธิของคุณยังอยู่ในเกณฑ์ <strong>ได้รับยกเว้นภาษี (0%)</strong> ไม่ต้องเสียภาษีเงินได้บุคคลธรรมดาสำหรับปีนี้ หากมีภาษีถูกหัก ณ ที่จ่ายไว้ คุณจะได้รับเงินคืนทั้งหมด
                </>
              )}
            </p>
          </div>

          {/* Action Hub Tiles */}
          <div className="home-actions-title">ทางลัดการทำงาน</div>
          <div className="home-action-tiles">
            <Link to="/calculator" className="home-action-tile">
              <div className="action-tile-left">
                <div className="action-tile-icon">
                  <SlidersHorizontal size={18} />
                </div>
                <div className="action-tile-info">
                  <h4>คำนวณและปรับลดหย่อนภาษี</h4>
                  <p>ทดลองปรับยอดเงิน ปรับค่าลดหย่อน 4 หมวด</p>
                </div>
              </div>
              <ChevronRight size={16} className="action-tile-arrow" />
            </Link>

            <Link to="/monthly-tracker" className="home-action-tile">
              <div className="action-tile-left">
                <div className="action-tile-icon">
                  <CalendarDays size={18} />
                </div>
                <div className="action-tile-info">
                  <h4>บันทึกรายได้ฟรีแลนซ์ 12 เดือน</h4>
                  <p>บันทึกหัก ณ ที่จ่าย 3% พร้อมดาวน์โหลด Excel</p>
                </div>
              </div>
              <ChevronRight size={16} className="action-tile-arrow" />
            </Link>

            <button
              type="button"
              className="home-action-tile"
              onClick={() => setShowPreFilingModal(true)}
            >
              <div className="action-tile-left">
                <div className="action-tile-icon">
                  <FileSpreadsheet size={18} />
                </div>
                <div className="action-tile-info">
                  <h4>เปิดใบสรุปเตรียมยื่น ภ.ง.ด. 90/91</h4>
                  <p>ดูตัวเลขแยกช่องสรรพากร พร้อมพิมพ์ PDF A4</p>
                </div>
              </div>
              <ChevronRight size={16} className="action-tile-arrow" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
