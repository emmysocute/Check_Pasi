import { useState, useMemo, useCallback, useEffect } from 'react';
import WelcomeBanner from '../components/WelcomeBanner';
import IncomeSection from '../components/IncomeSection';
import DeductionSection from '../components/DeductionSection';
import ResultPanel from '../components/ResultPanel';
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
};

function TaxCalculatorPage() {
  const [formData, setFormData] = useState(DEFAULT_STATE);
  const [hasCalculated, setHasCalculated] = useState(true);
  const { user } = useAuth();
  useEffect(() => {
    if (!user) return;

    const fetchLatest = async () => {
      try {
        const res = await api.get('/tax/history');
        if (res.data && res.data.length > 0) {
          const latest = res.data[0];
          setFormData(prev => ({
            ...prev,
            monthlyIncome: Math.max(0, Number(latest.monthly_income) || 0),
            freelanceIncome: Math.max(0, Number(latest.freelance_income) || 0),
            employmentType: latest.employment_type || 'salary',
            personalAllowance: { enabled: Number(latest.personal_allowance) > 0, amount: Number(latest.personal_allowance) || 60000 },
            spouseAllowance: { enabled: Number(latest.spouse_allowance) > 0, amount: Number(latest.spouse_allowance) || 60000 },
            childAllowance: { enabled: Number(latest.child_allowance) > 0, amount: Number(latest.child_allowance) || 0 },
            insurance: { enabled: Number(latest.insurance) > 0, amount: Math.min(Number(latest.insurance) || 0, 100000) },
            socialSecurity: { enabled: Number(latest.social_security) > 0, amount: Math.min(Number(latest.social_security) || 0, 9000) },
            investmentFund: { enabled: Number(latest.investment_fund) > 0, amount: Number(latest.investment_fund) || 0 },
          }));
        }
      } catch (err) {
        console.error('Failed to fetch latest calculation', err);
      }
    };
    fetchLatest();
  }, [user]);

  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateDeduction = useCallback((field, key, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: { ...prev[field], [key]: value }
    }));
  }, []);

  const clearForm = useCallback(() => {
    setFormData(DEFAULT_STATE);
    setHasCalculated(false);
  }, []);

  /* ===== Pure Domain Tax Engine ===== */
  const taxResult = useMemo(() => {
    return calculateTaxFromFormData(formData);
  }, [formData]);

  const handleCalculateAndSave = useCallback(async () => {
    setHasCalculated(true);

    if (!user) {
      alert('กรุณาเข้าสู่ระบบก่อนบันทึกข้อมูล');
      return;
    }

    try {
      await api.post('/tax/calculate', {
        monthlyIncome: Math.max(0, Number(formData.monthlyIncome) || 0),
        freelanceIncome: Math.max(0, Number(formData.freelanceIncome) || 0),
        employmentType: formData.employmentType,
        personalAllowance: formData.personalAllowance.enabled ? formData.personalAllowance.amount : 0,
        spouseAllowance: formData.spouseAllowance.enabled ? formData.spouseAllowance.amount : 0,
        childAllowance: formData.childAllowance.enabled ? Math.max(0, Number(formData.childAllowance.amount) || 0) : 0,
        insurance: formData.insurance.enabled ? Math.min(Math.max(0, Number(formData.insurance.amount) || 0), 100000) : 0,
        socialSecurity: formData.socialSecurity.enabled ? Math.min(Math.max(0, Number(formData.socialSecurity.amount) || 0), 9000) : 0,
        investmentFund: formData.investmentFund.enabled ? Math.max(0, Number(formData.investmentFund.amount) || 0) : 0,
        annualIncome: taxResult.annualIncome,
        expenseDeduction: taxResult.expenseDeduction,
        totalDeduction: taxResult.totalDeduction,
        netIncome: taxResult.netIncome,
        taxAmount: taxResult.tax
      });
      alert('บันทึกข้อมูลสำเร็จ!');
    } catch (err) {
      console.error('Save tax calculation error:', err);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  }, [formData, user, taxResult]);

  return (
    <div className="content-area has-floating-bar">
      <div className="left-content">
        <WelcomeBanner />
        <div className="form-card animate-in-delay-1">
          <IncomeSection
            monthlyIncome={formData.monthlyIncome}
            freelanceIncome={formData.freelanceIncome}
            employmentType={formData.employmentType}
            onIncomeChange={(val) => updateField('monthlyIncome', val)}
            onFreelanceChange={(val) => updateField('freelanceIncome', val)}
            onTypeChange={(val) => updateField('employmentType', val)}
          />
          <div className="section-divider" />
          <DeductionSection
            formData={formData}
            onToggle={(field, val) => updateDeduction(field, 'enabled', val)}
            onAmountChange={(field, val) => updateDeduction(field, 'amount', val)}
          />
          <div className="form-actions">
            <button className="btn btn-outline" onClick={clearForm}>
              ล้างข้อมูล
            </button>
            <button className="btn btn-primary" onClick={handleCalculateAndSave}>
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
            ภาษีที่ต้องจ่าย: <strong>{Number(taxResult.tax).toLocaleString('th-TH')} ฿</strong>
          </span>
          <span className="jump-arrow">↓ ดูสรุปผล</span>
        </button>
      </div>
    </div>
  );
}

export default TaxCalculatorPage;
