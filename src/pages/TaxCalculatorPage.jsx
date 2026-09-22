import { useState, useMemo, useCallback, useEffect } from 'react';
import WelcomeBanner from '../components/WelcomeBanner';
import IncomeSection from '../components/IncomeSection';
import DeductionSection from '../components/DeductionSection';
import ResultPanel from '../components/ResultPanel';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const DEFAULT_STATE = {
  monthlyIncome: 15000,
  freelanceIncome: 0,
  employmentType: 'salary',
  personalAllowance: { enabled: true, amount: 60000 },
  spouseAllowance: { enabled: false, amount: 60000 },
  childAllowance: {enabled: false, amount: 0 },
  insurance: { enabled: false, amount: 0 },
  socialSecurity: { enabled: true, amount: 7200 },
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
          console.log(latest.monthly_Income)
          setFormData(prev => ({
            ...prev,
            monthlyIncome: Number(latest.monthly_income),
            freelanceIncome: Number(latest.freelance_income) || 0,
            employmentType: latest.employment_type || 'salary',
            personalAllowance: { enabled: Number(latest.personal_allowance) > 0, amount: Number(latest.personal_allowance) || 60000 },
            spouseAllowance: { enabled: Number(latest.spouse_allowance) > 0, amount: Number(latest.spouse_allowance) || 60000 },
            insurance: { enabled: Number(latest.insurance) > 0, amount: Number(latest.insurance) || 0 },
            socialSecurity: { enabled: Number(latest.social_security) > 0, amount: Number(latest.social_security) || 7200 },
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

  /* ===== Tax Calculation Logic (Thai PIT 2568) ===== */
  // 📍 ตำแหน่งของฟังก์ชันคำนวณภาษีที่คุณต้องการแก้ไข Logic อยู่ที่นี่ครับ:
  const taxResult = useMemo(() => {
    const annualIncome = formData.monthlyIncome * 12;
    const sumIncome = annualIncome + formData.freelanceIncome;
    let expenseDeduction = Math.min(sumIncome * 0.5, 100000);

    let totalDeduction = 0;
    if (formData.personalAllowance.enabled) totalDeduction += formData.personalAllowance.amount;
    if (formData.spouseAllowance.enabled) totalDeduction += formData.spouseAllowance.amount;
    if (formData.insurance.enabled) totalDeduction += formData.insurance.amount;
    if (formData.socialSecurity.enabled) totalDeduction += formData.socialSecurity.amount;
    if (formData.investmentFund.enabled) totalDeduction += formData.investmentFund.amount;
    if (formData.childAllowance.enabled) totalDeduction += formData.childAllowance.amount;

    const netIncome = Math.max(0, sumIncome - expenseDeduction - totalDeduction);

    const taxBrackets = [
      { min: 0, max: 150000, rate: 0 },
      { min: 150000, max: 300000, rate: 0.05 },
      { min: 300000, max: 500000, rate: 0.10 },
      { min: 500000, max: 750000, rate: 0.15 },
      { min: 750000, max: 1000000, rate: 0.20 },
      { min: 1000000, max: 2000000, rate: 0.25 },
      { min: 2000000, max: 5000000, rate: 0.30 },
      { min: 5000000, max: Infinity, rate: 0.35 },
    ];

    let tax = 0;
    let remaining = netIncome;

    for (const bracket of taxBrackets) {
      if (remaining <= 0) break;
      const taxable = Math.min(remaining, bracket.max - bracket.min);
      tax += taxable * bracket.rate;
      remaining -= taxable;
    }

    return {
      annualIncome,
      expenseDeduction,
      totalDeduction,
      netIncome,
      tax: Math.round(tax),
    };
  }, [formData]);

  const handleCalculateAndSave = useCallback(async () => {
    setHasCalculated(true);
    
    // Auto save if user is logged in
    if (user) {
      try {
        await api.post('/tax/calculate', {
          monthlyIncome: formData.monthlyIncome,
          freelanceIncome: formData.freelanceIncome,
          employmentType: formData.employmentType,
          personalAllowance: formData.personalAllowance.enabled ? formData.personalAllowance.amount : 0,
          spouseAllowance: formData.spouseAllowance.enabled ? formData.spouseAllowance.amount : 0,
          childAllowance: 0,
          insurance: formData.insurance.enabled ? formData.insurance.amount : 0,
          socialSecurity: formData.socialSecurity.enabled ? formData.socialSecurity.amount : 0,
          investmentFund: formData.investmentFund.enabled ? formData.investmentFund.amount : 0,
          annualIncome: (formData.monthlyIncome * 12) + formData.freelanceIncome,
          totalDeduction: [
            formData.personalAllowance.enabled ? formData.personalAllowance.amount : 0,
            formData.spouseAllowance.enabled ? formData.spouseAllowance.amount : 0,
            formData.insurance.enabled ? formData.insurance.amount : 0,
            formData.socialSecurity.enabled ? formData.socialSecurity.amount : 0,
            formData.investmentFund.enabled ? formData.investmentFund.amount : 0,
          ].reduce((a, b) => a + b, 0),
          netIncome: taxResult.netIncome,
          taxAmount: taxResult.tax
        });
        alert('บันทึกข้อมูลสำเร็จ!');
      } catch (err) {
        console.error(err);
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    }
  }, [formData, user, taxResult]);

  const handleSave = async () => {
    if (!user) return alert('กรุณาเข้าสู่ระบบก่อนบันทึกข้อมูล');
    
    try {
      await api.post('/tax/calculate', {
        monthlyIncome: formData.monthlyIncome,
        freelanceIncome: formData.freelanceIncome,
        employmentType: formData.employmentType,
        personalAllowance: formData.personalAllowance.enabled ? formData.personalAllowance.amount : 0,
        spouseAllowance: formData.spouseAllowance.enabled ? formData.spouseAllowance.amount : 0,
        childAllowance: 0,
        insurance: formData.insurance.enabled ? formData.insurance.amount : 0,
        socialSecurity: formData.socialSecurity.enabled ? formData.socialSecurity.amount : 0,
        investmentFund: formData.investmentFund.enabled ? formData.investmentFund.amount : 0,
        annualIncome: taxResult.annualIncome,
        totalDeduction: taxResult.totalDeduction,
        netIncome: taxResult.netIncome,
        taxAmount: taxResult.tax
      });
      console.log(freelanceIncome)
      alert('บันทึกข้อมูลสำเร็จ!');
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  return (
    <div className="content-area">
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
      <ResultPanel result={taxResult} visible={hasCalculated} onSave={handleSave} user={user} />
    </div>
  );
}

export default TaxCalculatorPage;
