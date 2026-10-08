import { useState, useMemo, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import WelcomeBanner from '../components/WelcomeBanner';
import IncomeSection from '../components/IncomeSection';
import DeductionSection from '../components/DeductionSection';
import ResultPanel from '../components/ResultPanel';
import Toast from '../components/Toast';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { calculateTaxFromFormData } from '../utils/taxEngine';

const DEFAULT_STATE = {
  monthlyIncome: 15000,
  freelanceIncome: 0,
  withholdingTax: 0,
  employmentType: 'salary',
  personalAllowance: { enabled: true, amount: 60000 },
  spouseAllowance: { enabled: false, amount: 60000 },
  childAllowance: { enabled: false, amount: 0 },
  insurance: { enabled: false, amount: 0 },
  socialSecurity: { enabled: true, amount: 9000 },
  investmentFund: { enabled: false, amount: 0 },
  homeLoanInterest: { enabled: false, amount: 0 },
  parentAllowance: { 
    enabled: false, 
    ownFather: false, 
    ownMother: false, 
    spouseFather: false, 
    spouseMother: false, 
    amount: 0 
  },
  donationEducation: { enabled: false, amount: 0 },
  donationGeneral: { enabled: false, amount: 0 },
};

function mapRecordToFormData(record) {
  if (!record) return DEFAULT_STATE;
  return {
    monthlyIncome: Math.max(0, Number(record.monthly_income) || 0),
    freelanceIncome: Math.max(0, Number(record.freelance_income) || 0),
    withholdingTax: Math.max(0, Number(record.withholding_tax) || 0),
    employmentType: record.employment_type || 'salary',
    personalAllowance: { enabled: Number(record.personal_allowance) > 0, amount: Number(record.personal_allowance) || 60000 },
    spouseAllowance: { enabled: Number(record.spouse_allowance) > 0, amount: Number(record.spouse_allowance) || 60000 },
    childAllowance: { enabled: Number(record.child_allowance) > 0, amount: Number(record.child_allowance) || 0 },
    insurance: { enabled: Number(record.insurance) > 0, amount: Math.min(Number(record.insurance) || 0, 100000) },
    socialSecurity: { enabled: Number(record.social_security) > 0, amount: Math.min(Number(record.social_security) || 0, 9000) },
    investmentFund: { enabled: Number(record.investment_fund) > 0, amount: Number(record.investment_fund) || 0 },
    homeLoanInterest: { enabled: Number(record.home_loan_interest) > 0, amount: Math.min(Number(record.home_loan_interest) || 0, 100000) },
    parentAllowance: { 
      enabled: Number(record.parent_allowance) > 0 || Boolean(record.parent_own_father || record.parent_own_mother || record.parent_spouse_father || record.parent_spouse_mother),
      ownFather: Boolean(record.parent_own_father),
      ownMother: Boolean(record.parent_own_mother),
      spouseFather: Boolean(record.parent_spouse_father),
      spouseMother: Boolean(record.parent_spouse_mother),
      amount: Number(record.parent_allowance) || 0 
    },
    donationEducation: { 
      enabled: Number(record.donation_education) > 0, 
      amount: Number(record.donation_education) || 0 
    },
    donationGeneral: { 
      enabled: Number(record.donation_general) > 0 || (Number(record.donation) > 0 && !Number(record.donation_education)), 
      amount: Number(record.donation_general) || Number(record.donation) || 0 
    },
  };
}

function TaxCalculatorPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(() => {
    if (location.state?.loadRecord) {
      return mapRecordToFormData(location.state.loadRecord);
    }
    return DEFAULT_STATE;
  });
  const [hasCalculated, setHasCalculated] = useState(true);
  const [showResetModal, setShowResetModal] = useState(false);
  const [toasts, setToasts] = useState([]);
  const { user } = useAuth();

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    if (location.state?.loadRecord) {
      setTimeout(() => {
        showToast('โหลดข้อมูลจากประวัติเรียบร้อยแล้ว', 'success');
      }, 0);
      navigate(location.pathname, { replace: true, state: {} });
      return;
    }

    if (!user) return;

    let isMounted = true;
    const fetchLatest = async () => {
      try {
        const res = await api.get('/tax/history');
        if (isMounted && res.data && res.data.length > 0) {
          setFormData(prev => ({ ...prev, ...mapRecordToFormData(res.data[0]) }));
        }
      } catch (err) {
        console.error('Failed to fetch latest calculation', err);
      }
    };
    fetchLatest();

    return () => { isMounted = false; };
  }, [user, location.state, showToast, navigate, location.pathname]);

  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateDeduction = useCallback((field, key, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: { ...prev[field], [key]: value }
    }));
  }, []);

  const updateParentAllowance = useCallback((personKey, checked) => {
    setFormData(prev => {
      const current = prev.parentAllowance || {};
      const updated = { ...current, [personKey]: checked };
      const count = (updated.ownFather ? 1 : 0) + (updated.ownMother ? 1 : 0) +
                    (updated.spouseFather ? 1 : 0) + (updated.spouseMother ? 1 : 0);
      const amount = count * 30000;
      return {
        ...prev,
        parentAllowance: {
          ...updated,
          amount,
          enabled: count > 0 || current.enabled
        }
      };
    });
  }, []);

  const executeClearForm = useCallback(() => {
    setFormData(DEFAULT_STATE);
    setHasCalculated(false);
    setShowResetModal(false);
    showToast('ล้างข้อมูลเรียบร้อยแล้ว', 'info');
  }, [showToast]);

  /* ===== Pure Domain Tax Engine ===== */
  const taxResult = useMemo(() => {
    return calculateTaxFromFormData(formData);
  }, [formData]);

  const handleCalculateAndSave = useCallback(async () => {
    setHasCalculated(true);

    if (!user) {
      showToast('กรุณาเข้าสู่ระบบก่อนบันทึกข้อมูล', 'info');
      return;
    }

    try {
      await api.post('/tax/calculate', {
        monthlyIncome: Math.max(0, Number(formData.monthlyIncome) || 0),
        freelanceIncome: Math.max(0, Number(formData.freelanceIncome) || 0),
        withholdingTax: Math.max(0, Number(formData.withholdingTax) || 0),
        employmentType: formData.employmentType,
        personalAllowance: formData.personalAllowance.enabled ? formData.personalAllowance.amount : 0,
        spouseAllowance: formData.spouseAllowance.enabled ? formData.spouseAllowance.amount : 0,
        childAllowance: formData.childAllowance.enabled ? Math.max(0, Number(formData.childAllowance.amount) || 0) : 0,
        insurance: formData.insurance.enabled ? Math.min(Math.max(0, Number(formData.insurance.amount) || 0), 100000) : 0,
        socialSecurity: formData.socialSecurity.enabled ? Math.min(Math.max(0, Number(formData.socialSecurity.amount) || 0), 9000) : 0,
        investmentFund: formData.investmentFund.enabled ? Math.max(0, Number(formData.investmentFund.amount) || 0) : 0,
        homeLoanInterest: formData.homeLoanInterest.enabled ? Math.min(Math.max(0, Number(formData.homeLoanInterest.amount) || 0), 100000) : 0,
        parentAllowance: formData.parentAllowance.enabled ? Math.max(0, Number(formData.parentAllowance.amount) || 0) : 0,
        parentOwnFather: formData.parentAllowance.enabled ? Boolean(formData.parentAllowance.ownFather) : false,
        parentOwnMother: formData.parentAllowance.enabled ? Boolean(formData.parentAllowance.ownMother) : false,
        parentSpouseFather: formData.parentAllowance.enabled ? Boolean(formData.parentAllowance.spouseFather) : false,
        parentSpouseMother: formData.parentAllowance.enabled ? Boolean(formData.parentAllowance.spouseMother) : false,
        donationEducation: formData.donationEducation.enabled ? Math.max(0, Number(formData.donationEducation.amount) || 0) : 0,
        donationGeneral: formData.donationGeneral.enabled ? Math.max(0, Number(formData.donationGeneral.amount) || 0) : 0,
        donation: taxResult.itemizedDeductions?.donation || 0,
        taxMethod: taxResult.taxMethod || 'bracket',
        annualIncome: taxResult.annualIncome,
        expenseDeduction: taxResult.expenseDeduction,
        totalDeduction: taxResult.totalDeduction,
        netIncome: taxResult.netIncome,
        taxAmount: taxResult.finalTax || taxResult.tax
      });
      showToast('บันทึกข้อมูลการคำนวณภาษีสำเร็จเรียบร้อยแล้ว!', 'success');
    } catch (err) {
      console.error('Save tax calculation error:', err);
      showToast('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง', 'error');
    }
  }, [formData, user, taxResult, showToast]);

  return (
    <div className="content-area has-floating-bar">
      <Toast toasts={toasts} onDismiss={dismissToast} />

      <div className="left-content">
        <WelcomeBanner />
        <div className="form-card animate-in-delay-1">
          <IncomeSection
            monthlyIncome={formData.monthlyIncome}
            freelanceIncome={formData.freelanceIncome}
            withholdingTax={formData.withholdingTax}
            onIncomeChange={(val) => updateField('monthlyIncome', val)}
            onFreelanceChange={(val) => updateField('freelanceIncome', val)}
            onWithholdingChange={(val) => updateField('withholdingTax', val)}
          />
          <div className="section-divider" />
          <DeductionSection
            formData={formData}
            onToggle={(field, val) => updateDeduction(field, 'enabled', val)}
            onAmountChange={(field, val) => updateDeduction(field, 'amount', val)}
            onParentToggle={updateParentAllowance}
            maxDonationCap={taxResult.maxDonationCap}
            rawDonationClaim={taxResult.rawDonationClaim}
            actualDonationDeduction={taxResult.itemizedDeductions?.donation || 0}
          />
          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-outline" 
              onClick={() => setShowResetModal(true)}
            >
              ล้างข้อมูล
            </button>
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handleCalculateAndSave}
            >
              บันทึก
            </button>
          </div>
        </div>
      </div>

      <div id="tax-result-section" className="result-panel-wrapper">
        <ResultPanel result={taxResult} visible={hasCalculated} />
      </div>

      {/* Floating Quick Jump Bar สำหรับมือถือ */}
      <div className="mobile-quick-jump-container">
        <button
          type="button"
          className="floating-quick-jump"
          onClick={() => {
            const el = document.getElementById('tax-result-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          aria-label="ดูผลลัพธ์การคำนวณภาษี"
        >
          <span className="jump-icon">📊</span>
          <span className="jump-text">
            {taxResult.status === 'refund' ? (
              <span>ได้คืนภาษี: <strong style={{ color: '#86efac' }}>+{Number(taxResult.refundAmount).toLocaleString('th-TH')} ฿</strong></span>
            ) : taxResult.status === 'payable' && taxResult.withholdingTax > 0 ? (
              <span>จ่ายเพิ่ม: <strong style={{ color: '#fca5a5' }}>{Number(taxResult.payableAmount).toLocaleString('th-TH')} ฿</strong></span>
            ) : (
              <span>ภาษีที่ต้องจ่าย: <strong>{Number(taxResult.tax).toLocaleString('th-TH')} ฿</strong></span>
            )}
          </span>
          <span className="jump-arrow">↓ ดูสรุปผล</span>
        </button>
      </div>

      {/* Confirmation Modal สำหรับการล้างข้อมูล */}
      {showResetModal && (
        <div className="modal-backdrop" onClick={() => setShowResetModal(false)}>
          <div className="confirm-modal-box" onClick={e => e.stopPropagation()}>
            <div className="confirm-modal-header">
              <div className="confirm-modal-icon">🔄</div>
              <div className="confirm-modal-title">ยืนยันการล้างข้อมูล</div>
            </div>
            <div className="confirm-modal-desc">
              คุณแน่ใจหรือไม่ว่าต้องการล้างข้อมูลที่กรอกทั้งหมด? ข้อมูลจะถูกรีเซ็ตกลับเป็นค่าเริ่มต้น
            </div>
            <div className="confirm-modal-actions">
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => setShowResetModal(false)}
              >
                ยกเลิก
              </button>
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={executeClearForm}
              >
                ยืนยันล้างข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaxCalculatorPage;
