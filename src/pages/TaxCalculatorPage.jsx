/* oxlint-disable react/set-state-in-effect */
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Download, BarChart3, RotateCcw, X } from 'lucide-react';
import WelcomeBanner from '../components/WelcomeBanner';
import IncomeSection from '../components/IncomeSection';
import DeductionSection from '../components/DeductionSection';
import ResultPanel from '../components/ResultPanel';
import PreFilingSheetModal from '../components/PreFilingSheetModal';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { calculateTaxFromFormData } from '../utils/taxEngine';

const DEFAULT_STATE = {
  monthlyIncome: 0,
  freelanceIncome: 0,
  withholdingTax: 0,
  employmentType: 'salary',
  personalAllowance: { enabled: true, amount: 60000 },
  spouseAllowance: { enabled: false, amount: 0 },
  childAllowance: { 
    enabled: false, 
    countBefore2561: 0, 
    countAfter2561: 0, 
    countAdopted: 0, 
    amount: 0 
  },
  insurance: { enabled: false, amount: 0 },
  socialSecurity: { enabled: false, amount: 0 },
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

function deduceChildCounts(childAllowanceAmount) {
  const amt = Number(childAllowanceAmount) || 0;
  if (amt <= 0) {
    return { countBefore2561: 0, countAfter2561: 0, countAdopted: 0, amount: 0 };
  }
  let countBefore2561 = 0;
  let countAfter2561 = 0;
  const countAdopted = 0;

  if (amt === 30000) {
    countBefore2561 = 1;
  } else if (amt === 60000) {
    countBefore2561 = 2;
  } else if (amt === 90000) {
    countBefore2561 = 1;
    countAfter2561 = 1;
  } else if (amt === 120000) {
    countBefore2561 = 2;
    countAfter2561 = 1;
  } else if (amt === 150000) {
    countBefore2561 = 1;
    countAfter2561 = 2;
  } else {
    countBefore2561 = Math.floor(amt / 30000);
  }

  return {
    countBefore2561,
    countAfter2561,
    countAdopted,
    amount: amt,
  };
}

function mapRecordToFormData(record) {
  if (!record) return DEFAULT_STATE;
  return {
    monthlyIncome: Math.max(0, Number(record.monthly_income) || 0),
    freelanceIncome: Math.max(0, Number(record.freelance_income) || 0),
    withholdingTax: Math.max(0, Number(record.withholding_tax) || 0),
    employmentType: record.employment_type || 'salary',
    personalAllowance: { enabled: Number(record.personal_allowance) > 0, amount: Number(record.personal_allowance) || 60000 },
    spouseAllowance: { enabled: Number(record.spouse_allowance) > 0, amount: Number(record.spouse_allowance) || 60000 },
    childAllowance: { 
      enabled: Number(record.child_allowance) > 0, 
      ...deduceChildCounts(record.child_allowance) 
    },
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
    if (location.state?.prefillSalary) {
      return {
        ...DEFAULT_STATE,
        monthlyIncome: Number(location.state.prefillSalary) || 0,
      };
    }
    if (location.state?.fromTracker && location.state?.prefill) {
      const p = location.state.prefill;
      return {
        ...DEFAULT_STATE,
        employmentType: 'freelance',
        monthlyIncome: 0,
        freelanceIncome: Number(p.freelanceIncome) || 0,
        withholdingTax: Number(p.withholdingTax) || 0,
        socialSecurity: {
          enabled: Boolean(Number(p.socialSecurity) > 0),
          amount: Number(p.socialSecurity) || 0,
        },
      };
    }
    return DEFAULT_STATE;
  });
  const [trackerImportInfo, setTrackerImportInfo] = useState(() => {
    if (location.state?.fromTracker && location.state?.prefill) {
      return {
        taxYear: location.state.taxYear,
        income: Number(location.state.prefill.freelanceIncome) || 0,
        withholdingTax: Number(location.state.prefill.withholdingTax) || 0,
        socialSecurity: Number(location.state.prefill.socialSecurity) || 0,
      };
    }
    return null;
  });
  const [hasCalculated, setHasCalculated] = useState(true);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showPreFilingModal, setShowPreFilingModal] = useState(false);
  const { toasts, showToast, dismissToast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (location.state?.loadRecord) {
      setFormData(mapRecordToFormData(location.state.loadRecord));
      setTrackerImportInfo(null);
      setHasCalculated(true);
      showToast('โหลดข้อมูลจากประวัติเรียบร้อยแล้ว', 'success');
      navigate(location.pathname, { replace: true, state: null });
      return;
    }

    if (location.state?.fromTracker && location.state?.prefill) {
      const p = location.state.prefill;
      const year = location.state.taxYear || '';
      setTrackerImportInfo({
        taxYear: year,
        income: Number(p.freelanceIncome) || 0,
        withholdingTax: Number(p.withholdingTax) || 0,
        socialSecurity: Number(p.socialSecurity) || 0,
      });
      setFormData({
        ...DEFAULT_STATE,
        employmentType: 'freelance',
        monthlyIncome: 0,
        freelanceIncome: Number(p.freelanceIncome) || 0,
        withholdingTax: Number(p.withholdingTax) || 0,
        socialSecurity: {
          enabled: Boolean(Number(p.socialSecurity) > 0),
          amount: Number(p.socialSecurity) || 0,
        },
      });
      setHasCalculated(true);
      showToast(`นำเข้ายอดสะสม 12 เดือน ${year ? `ปี ${year}` : ''} เรียบร้อยแล้ว`, 'success');
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, location.pathname, navigate, showToast]);

  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateDeduction = useCallback((field, key, value) => {
    setFormData(prev => {
      const current = prev[field] || {};
      const updated = { ...current, [key]: value };

      if (key === 'enabled') {
        if (field === 'spouseAllowance') {
          updated.amount = value ? 60000 : 0;
        } else if (field === 'childAllowance') {
          if (value) {
            const b = current.countBefore2561 ?? 0;
            const a = current.countAfter2561 ?? 0;
            const ad = current.countAdopted ?? 0;
            if (b === 0 && a === 0 && ad === 0) {
              updated.countBefore2561 = 1;
              updated.countAfter2561 = 0;
              updated.countAdopted = 0;
              updated.amount = 30000;
            } else {
              updated.amount = (b * 30000) + (a * 60000) + (ad * 30000);
            }
          } else {
            updated.amount = 0;
          }
        } else if (field === 'socialSecurity' && value === true && (!current.amount || current.amount === 0)) {
          updated.amount = 9000;
        }
      }

      return {
        ...prev,
        [field]: updated
      };
    });
  }, []);

  const updateChildCount = useCallback((key, newCount) => {
    setFormData(prev => {
      const current = prev.childAllowance || {
        enabled: true,
        countBefore2561: 0,
        countAfter2561: 0,
        countAdopted: 0,
        amount: 0,
      };

      let countBefore = current.countBefore2561 ?? 0;
      let countAfter = current.countAfter2561 ?? 0;
      let countAdopted = current.countAdopted ?? 0;

      const sanitizedCount = Math.max(0, Number(newCount) || 0);

      if (key === 'countBefore2561') {
        countBefore = sanitizedCount;
      } else if (key === 'countAfter2561') {
        countAfter = sanitizedCount;
      } else if (key === 'countAdopted') {
        countAdopted = sanitizedCount;
      }

      // Legal constraint: adopted children max 3 total when combined with biological
      const maxAdopted = Math.max(0, 3 - (countBefore + countAfter));
      if (countAdopted > maxAdopted) {
        countAdopted = maxAdopted;
      }

      const totalCount = countBefore + countAfter + countAdopted;
      const amount = (countBefore * 30000) + (countAfter * 60000) + (countAdopted * 30000);

      return {
        ...prev,
        childAllowance: {
          ...current,
          countBefore2561: countBefore,
          countAfter2561: countAfter,
          countAdopted,
          amount,
          enabled: totalCount > 0 ? true : current.enabled,
        }
      };
    });
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
    setTrackerImportInfo(null);
    setHasCalculated(true);
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
        annualIncome: taxResult.annualIncome ?? taxResult.sumIncome ?? (Number(formData.monthlyIncome || 0) * 12 + Number(formData.freelanceIncome || 0)),
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

        {trackerImportInfo && (
          <div className="imported-tracker-banner">
            <div className="imported-tracker-left">
              <span className="imported-tracker-icon">
                <Download size={16} />
              </span>
              <div>
                <div className="imported-tracker-title">
                  นำเข้ายอดสะสม 12 เดือน {trackerImportInfo.taxYear ? `(ปีภาษี ${trackerImportInfo.taxYear})` : ''} เรียบร้อยแล้ว
                </div>
                <div className="imported-tracker-stats">
                  <span>รายได้รวมทั้งปี: <strong>฿{trackerImportInfo.income.toLocaleString('th-TH')}</strong></span>
                  {trackerImportInfo.withholdingTax > 0 && (
                    <span>• ภาษีหัก ณ ที่จ่ายสะสม: <strong>฿{trackerImportInfo.withholdingTax.toLocaleString('th-TH')}</strong></span>
                  )}
                  {trackerImportInfo.socialSecurity > 0 && (
                    <span>• ประกันสังคม: <strong>฿{trackerImportInfo.socialSecurity.toLocaleString('th-TH')}</strong></span>
                  )}
                </div>
              </div>
            </div>
            <button
              type="button"
              className="imported-tracker-close"
              onClick={() => setTrackerImportInfo(null)}
              title="ปิดการแจ้งเตือน"
              aria-label="ปิดการแจ้งเตือน"
            >
              <X size={14} />
            </button>
          </div>
        )}

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
            onChange={(field, val) => updateDeduction(field, 'amount', val)}
            onAmountChange={(field, val) => updateDeduction(field, 'amount', val)}
            onParentToggle={updateParentAllowance}
            onChildCountChange={updateChildCount}
            itemizedDeductions={taxResult.itemizedDeductions}
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
        <ResultPanel
          result={taxResult}
          visible={hasCalculated}
          onOpenPreFilingSheet={() => setShowPreFilingModal(true)}
        />
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
          <span className="jump-icon">
            <BarChart3 size={15} />
          </span>
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
              <div className="confirm-modal-icon">
                <RotateCcw size={22} className="text-amber" />
              </div>
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

      {/* ภ.ง.ด. 90/91 Pre-Filing Cheat Sheet Modal */}
      {showPreFilingModal && (
        <PreFilingSheetModal
          result={taxResult}
          onClose={() => setShowPreFilingModal(false)}
        />
      )}
    </div>
  );
}

export default TaxCalculatorPage;
