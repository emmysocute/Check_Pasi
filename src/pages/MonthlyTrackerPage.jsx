import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Coins,
  Receipt,
  ShieldCheck,
  FileText,
  Download,
  Copy,
  Sparkles,
  Save,
  ArrowRight,
  X,
  Sliders,
  Check,
  Plus,
  Zap,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import { blockInvalidChars, sanitizeNumericInput } from '../utils/numberInput';
import {
  MONTH_NAMES_TH,
  MONTH_SHORT_TH,
  createDefaultMonthlyRecords,
  calculateMonthlyTotals,
  calculateQuick3Percent,
  estimateTrackerRefund,
  QUARTERS,
  filterRecordsByQuarter,
  calculateQuarterSummaries,
} from '../utils/monthlyTracker';
import { generateMonthlyTrackerCSV, downloadCSV } from '../utils/exportUtils';

const TAX_YEARS = [
  { ce: 2026, be: 2569, label: 'ปีภาษี 2569 (2026)' },
  { ce: 2025, be: 2568, label: 'ปีภาษี 2568 (2025)' },
  { ce: 2024, be: 2567, label: 'ปีภาษี 2567 (2024)' },
];

function MonthlyTrackerPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toasts, showToast, dismissToast } = useToast();

  const [selectedYear, setSelectedYear] = useState(2026);
  const [records, setRecords] = useState(createDefaultMonthlyRecords());
  const [settings, setSettings] = useState({
    showWithholding: true,
    showSocialSecurity: false,
    showNote: false,
  });
  const [activeQuarter, setActiveQuarter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch data from backend when year changes or user logs in
  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    const fetchTrackerData = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/monthly-tracker?year=${selectedYear}`);
        if (isMounted && res.data) {
          if (Array.isArray(res.data.records) && res.data.records.length > 0) {
            setRecords(res.data.records);
          }
          if (res.data.settings) {
            setSettings(res.data.settings);
          }
        }
      } catch (err) {
        console.error('Failed to fetch monthly tracker data', err);
        showToast('ไม่สามารถโหลดข้อมูลรายเดือนได้ กรุณาลองใหม่อีกครั้ง', 'error');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchTrackerData();

    return () => {
      isMounted = false;
    };
  }, [user, selectedYear, showToast]);

  // Update specific month field
  const handleRecordChange = useCallback((monthIndex, field, value) => {
    setRecords(prev => {
      const next = [...prev];
      next[monthIndex] = {
        ...next[monthIndex],
        [field]: value,
      };
      return next;
    });
  }, []);

  // One-click 3% shortcut helper
  const handleQuick3Percent = useCallback((monthIndex) => {
    const currentIncome = records[monthIndex]?.income || 0;
    const computedWht = calculateQuick3Percent(currentIncome);
    handleRecordChange(monthIndex, 'withholdingTax', computedWht);
    showToast(`คำนวณหัก ณ ที่จ่าย 3% เดือน ${MONTH_SHORT_TH[monthIndex]} สำเร็จ (${computedWht.toLocaleString('th-TH')} บ.)`, 'info');
  }, [records, handleRecordChange, showToast]);

  // Copy values from current month to next month
  const handleCopyToNextMonth = useCallback((monthIndex) => {
    if (monthIndex >= 11) return;
    const current = records[monthIndex];
    setRecords(prev => {
      const next = [...prev];
      next[monthIndex + 1] = {
        ...next[monthIndex + 1],
        income: current.income,
        withholdingTax: current.withholdingTax,
        socialSecurity: current.socialSecurity,
        note: current.note,
      };
      return next;
    });
    showToast(`คัดลอกข้อมูลไปเดือน ${MONTH_SHORT_TH[monthIndex + 1]} เรียบร้อยแล้ว`, 'success');
  }, [records, showToast]);

  // Reset/Clear specific month
  const handleClearMonth = useCallback((monthIndex) => {
    setRecords(prev => {
      const next = [...prev];
      next[monthIndex] = {
        month: monthIndex + 1,
        income: 0,
        withholdingTax: 0,
        socialSecurity: 0,
        note: '',
      };
      return next;
    });
  }, []);

  // Toggle column settings
  const toggleSetting = useCallback((settingKey) => {
    setSettings(prev => ({
      ...prev,
      [settingKey]: !prev[settingKey],
    }));
  }, []);

  // Aggregate totals
  const totals = useMemo(() => {
    return calculateMonthlyTotals(records);
  }, [records]);

  // Quarter summaries and filtered rows
  const quarterSummaries = useMemo(() => {
    return calculateQuarterSummaries(records);
  }, [records]);

  const displayedRecords = useMemo(() => {
    return filterRecordsByQuarter(records, activeQuarter);
  }, [records, activeQuarter]);

  // Export 12-month records to CSV
  const handleExportCSV = useCallback(() => {
    const beYear = selectedYear + 543;
    const csv = generateMonthlyTrackerCSV(records, beYear);
    downloadCSV(`check-pasi-freelance-${beYear}.csv`, csv);
    showToast(`ดาวน์โหลดสรุปรายได้ปีภาษี ${beYear} (CSV/Excel) สำเร็จ`, 'success');
  }, [records, selectedYear, showToast]);

  // Estimated refund callout
  const estimatedRefund = useMemo(() => {
    return estimateTrackerRefund({
      totalIncome: totals.totalIncome,
      totalWithholdingTax: totals.totalWithholdingTax,
      totalSocialSecurity: totals.totalSocialSecurity,
    });
  }, [totals]);

  // Save to database
  const handleSave = useCallback(async () => {
    if (!user) {
      showToast('กรุณาเข้าสู่ระบบเพื่อบันทึกข้อมูลลงฐานข้อมูล', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      await api.post('/monthly-tracker', {
        year: selectedYear,
        records,
        settings,
      });
      showToast(`บันทึกข้อมูลรายได้ 12 เดือน ปี ${selectedYear} เรียบร้อยแล้ว!`, 'success');
    } catch (err) {
      console.error('Failed to save monthly tracker records', err);
      showToast('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [user, selectedYear, records, settings, showToast]);

  // Bridge to Calculator Page
  const handleSendToCalculator = useCallback(() => {
    // If logged in, perform silent background auto-save so user never loses their monthly entries
    if (user) {
      api.post('/monthly-tracker', {
        year: selectedYear,
        records,
        settings,
      }).catch(err => {
        console.error('Silent auto-save monthly tracker error:', err);
      });
    }

    navigate('/calculator', {
      state: {
        fromTracker: true,
        taxYear: selectedYear,
        prefill: {
          freelanceIncome: totals.totalIncome,
          withholdingTax: totals.totalWithholdingTax,
          socialSecurity: totals.totalSocialSecurity,
        },
      },
    });
  }, [navigate, selectedYear, totals, user, records, settings]);

  return (
    <div className="tracker-page-container has-floating-bar animate-fade-in">
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Header Banner */}
      <div className="tracker-header glass-card">
        <div className="tracker-header-left">
          <div className="tracker-badge">
            <CalendarDays size={13} />
            <span>ระบบวางแผนรายเดือน</span>
          </div>
          <h1 className="tracker-title">บันทึกรายได้ 12 เดือน (พาร์ทไทม์ & ฟรีแลนซ์)</h1>
          <p className="tracker-subtitle">
            จดรายได้ ภาษีหัก ณ ที่จ่าย 3% และประกันสังคมแยกรายเดือน เพื่อสะสมยอดส่งคำนวณภาษีและเช็กสิทธิเงินคืนภาษีสะสม
          </p>
        </div>

        <div className="tracker-header-right">
          <label htmlFor="tax-year-select" className="tracker-year-label">
            เลือกปีภาษี:
          </label>
          <select
            id="tax-year-select"
            className="tracker-year-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            disabled={isLoading}
          >
            {TAX_YEARS.map((y) => (
              <option key={y.ce} value={y.ce}>
                {y.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Customizable Columns Toggle Bar */}
      <div className="tracker-toolbar glass-card">
        <div className="tracker-toolbar-label">
          <Sliders size={14} className="toolbar-icon" />
          <span>เลือกข้อมูลที่ต้องการกรอก:</span>
          <span className="tracker-toolbar-sub">(ปิดคอลัมน์ที่ไม่จำเป็นเพื่อให้หน้าจอสะอาดขึ้น)</span>
        </div>
        <div className="tracker-pills-group">
          <button
            type="button"
            className="tracker-pill active locked"
            title="รายได้ของแต่ละเดือนจำเป็นต้องกรอก"
            disabled
          >
            <Check size={13} />
            <Coins size={14} />
            <span>รายได้ของเดือน</span>
          </button>

          <button
            type="button"
            className={`tracker-pill ${settings.showWithholding ? 'active' : ''}`}
            onClick={() => toggleSetting('showWithholding')}
            id="toggle-col-withholding"
          >
            {settings.showWithholding ? <Check size={13} /> : <Plus size={13} />}
            <Receipt size={14} />
            <span>ภาษีหัก ณ ที่จ่าย (3%)</span>
          </button>

          <button
            type="button"
            className={`tracker-pill ${settings.showSocialSecurity ? 'active' : ''}`}
            onClick={() => toggleSetting('showSocialSecurity')}
            id="toggle-col-social-security"
          >
            {settings.showSocialSecurity ? <Check size={13} /> : <Plus size={13} />}
            <ShieldCheck size={14} />
            <span>ประกันสังคม</span>
          </button>

          <button
            type="button"
            className={`tracker-pill ${settings.showNote ? 'active' : ''}`}
            onClick={() => toggleSetting('showNote')}
            id="toggle-col-note"
          >
            {settings.showNote ? <Check size={13} /> : <Plus size={13} />}
            <FileText size={14} />
            <span>โน้ต / แหล่งที่มา</span>
          </button>
        </div>
      </div>

      {/* Quarter Tab Bar & Export */}
      <div className="tracker-quarter-bar">
        <div className="tracker-quarter-tabs" role="tablist" aria-label="เลือกมุมมองไตรมาส">
          {QUARTERS.map((q) => {
            const isSelected = activeQuarter === q.id;
            const subtotal = q.id === 'ALL' ? totals.totalIncome : (quarterSummaries[q.id]?.totalIncome || 0);
            return (
              <button
                key={q.id}
                type="button"
                role="tab"
                id={`tab-quarter-${q.id}`}
                aria-selected={isSelected}
                className={`quarter-tab-btn ${isSelected ? 'active' : ''}`}
                onClick={() => setActiveQuarter(q.id)}
              >
                <span className="quarter-tab-label">{q.label}</span>
                <span className={`quarter-tab-badge ${subtotal > 0 ? 'has-income' : ''}`}>
                  {subtotal > 0 ? `฿${subtotal.toLocaleString('th-TH')}` : '0 บ.'}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="btn btn-outline btn-sm tracker-export-btn"
          onClick={handleExportCSV}
          title="ดาวน์โหลดสรุป 12 เดือนเป็นไฟล์ CSV เพื่อเปิดใน Excel"
        >
          <Download size={14} />
          <span>ดาวน์โหลด Excel / CSV</span>
        </button>
      </div>

      {/* 12-Month Table / Grid */}
      <div className="tracker-table-card glass-card">
        <div className="table-responsive-wrapper">
          <table className="tracker-table">
            <thead>
              <tr>
                <th style={{ width: '130px' }}>เดือน</th>
                <th>รายได้ของเดือน (บาท)</th>
                {settings.showWithholding && <th>ภาษีหัก ณ ที่จ่าย (บาท)</th>}
                {settings.showSocialSecurity && <th>เงินสมทบประกันสังคม (บาท)</th>}
                {settings.showNote && <th>โน้ต / แหล่งที่มา</th>}
                <th style={{ width: '120px', textAlign: 'center' }}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {displayedRecords.map((rec) => {
                const index = rec.month - 1;
                const monthName = MONTH_NAMES_TH[index];
                const monthShort = MONTH_SHORT_TH[index];

                return (
                  <tr key={rec.month} className="tracker-row">
                    {/* Month Column */}
                    <td className="month-col">
                      <div className="month-badge-wrapper">
                        <span className="month-number">{String(rec.month).padStart(2, '0')}</span>
                        <div className="month-labels">
                          <span className="month-name-bold">{monthShort}</span>
                          <span className="month-name-full">{monthName}</span>
                        </div>
                      </div>
                    </td>

                    {/* Income Column */}
                    <td className="income-col">
                      <div className="table-input-group">
                        <input
                          type="number"
                          id={`input-income-${rec.month}`}
                          className="table-input"
                          placeholder="0"
                          value={rec.income === 0 ? '' : rec.income}
                          onKeyDown={blockInvalidChars}
                          onChange={(e) =>
                            handleRecordChange(
                              index,
                              'income',
                              sanitizeNumericInput(e.target.value)
                            )
                          }
                          min="0"
                          step="any"
                        />
                        <span className="input-suffix">บาท</span>
                      </div>
                    </td>

                    {/* Withholding Tax Column */}
                    {settings.showWithholding && (
                      <td className="wht-col">
                        <div className={`table-input-group ${(!rec.withholdingTax || Number(rec.withholdingTax) === 0) ? 'has-shortcut' : ''}`}>
                          <input
                            type="number"
                            id={`input-wht-${rec.month}`}
                            className="table-input"
                            placeholder="0"
                            value={rec.withholdingTax === 0 ? '' : rec.withholdingTax}
                            onKeyDown={blockInvalidChars}
                            onChange={(e) =>
                              handleRecordChange(
                                index,
                                'withholdingTax',
                                sanitizeNumericInput(e.target.value)
                              )
                            }
                            min="0"
                            step="any"
                          />
                          <span className="input-suffix">บาท</span>
                          {(!rec.withholdingTax || Number(rec.withholdingTax) === 0) && (
                            <button
                              type="button"
                              className="btn-quick-3percent"
                              onClick={() => handleQuick3Percent(index)}
                              title="คำนวณ 3% อัตโนมัติจากรายได้เดือนนี้"
                              id={`btn-3pct-${rec.month}`}
                            >
                              <Zap size={11} />
                              <span>3%</span>
                            </button>
                          )}
                        </div>
                      </td>
                    )}

                    {/* Social Security Column */}
                    {settings.showSocialSecurity && (
                      <td className="sso-col">
                        <div className="table-input-group">
                          <input
                            type="number"
                            id={`input-sso-${rec.month}`}
                            className="table-input"
                            placeholder="0"
                            value={rec.socialSecurity === 0 ? '' : rec.socialSecurity}
                            onKeyDown={blockInvalidChars}
                            onChange={(e) =>
                              handleRecordChange(
                                index,
                                'socialSecurity',
                                sanitizeNumericInput(e.target.value)
                              )
                            }
                            min="0"
                            step="any"
                          />
                          <span className="input-suffix">บาท</span>
                        </div>
                      </td>
                    )}

                    {/* Note Column */}
                    {settings.showNote && (
                      <td className="note-col">
                        <input
                          type="text"
                          id={`input-note-${rec.month}`}
                          className="table-input note-input"
                          placeholder="เช่น ร้านกาแฟ A, งานฟรีแลนซ์ B"
                          value={rec.note || ''}
                          maxLength={500}
                          onChange={(e) => handleRecordChange(index, 'note', e.target.value)}
                        />
                      </td>
                    )}

                    {/* Row Actions */}
                    <td className="actions-col">
                      <div className="row-action-btns">
                        {index < 11 && (
                          <button
                            type="button"
                            className="btn-action-copy"
                            onClick={() => handleCopyToNextMonth(index)}
                            title="คัดลอกข้อมูลไปเดือนถัดไป"
                            id={`btn-copy-${rec.month}`}
                          >
                            <Copy size={12} />
                            <span>คัดลอก</span>
                          </button>
                        )}
                        {(rec.income > 0 || rec.withholdingTax > 0 || rec.socialSecurity > 0 || rec.note) && (
                          <button
                            type="button"
                            className="btn-action-clear"
                            onClick={() => handleClearMonth(index)}
                            title="ล้างข้อมูลเดือนนี้"
                            id={`btn-clear-${rec.month}`}
                          >
                            <X size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sticky Annual Summary Footer */}
      <div className="tracker-summary-bar glass-card">
        <div className="summary-stat-grid">
          <div className="summary-stat-box">
            <span className="stat-label">รายได้รวมทั้งปี ({totals.activeMonthsCount}/12 เดือน)</span>
            <span className="stat-value primary-highlight">
              {totals.totalIncome.toLocaleString('th-TH')} <span className="stat-unit">บาท</span>
            </span>
          </div>

          {settings.showWithholding && (
            <div className="summary-stat-box">
              <span className="stat-label">ภาษีหัก ณ ที่จ่ายสะสม</span>
              <span className="stat-value wht-highlight">
                {totals.totalWithholdingTax.toLocaleString('th-TH')} <span className="stat-unit">บาท</span>
              </span>
            </div>
          )}

          {settings.showSocialSecurity && (
            <div className="summary-stat-box">
              <span className="stat-label">ประกันสังคมสะสม</span>
              <span className="stat-value sso-highlight">
                {totals.totalSocialSecurity.toLocaleString('th-TH')} <span className="stat-unit">บาท</span>
              </span>
            </div>
          )}

          {/* Refund Callout */}
          <div className="summary-stat-box refund-callout-box">
            <span className="stat-label">ประมาณการสิทธิภาษี</span>
            {estimatedRefund.status === 'refund' && (
              <span className="stat-value refund-positive">
                <Sparkles size={14} className="sparkle-icon" />
                <span>โอกาสได้เงินคืน: +{estimatedRefund.refundPotential.toLocaleString('th-TH')} บ.</span>
              </span>
            )}
            {estimatedRefund.status === 'payable' && (
              <span className="stat-value refund-payable">
                ประมาณการภาษีชำระเพิ่ม: {estimatedRefund.payablePotential.toLocaleString('th-TH')} บ.
              </span>
            )}
            {estimatedRefund.status === 'zero' && (
              <span className="stat-value refund-neutral">
                ภาษีที่ต้องชำระ: 0 บาท
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="tracker-summary-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleExportCSV}
            title="ดาวน์โหลดสรุป 12 เดือนเป็นไฟล์ CSV เพื่อเปิดใน Excel"
            id="btn-export-csv"
          >
            <Download size={14} />
            <span>ดาวน์โหลด Excel</span>
          </button>

          <button
            type="button"
            className="btn btn-outline"
            onClick={handleSave}
            disabled={isSaving}
            id="btn-save-tracker"
          >
            <Save size={14} />
            <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}</span>
          </button>

          <button
            type="button"
            className="btn btn-primary btn-bridge-calculator"
            onClick={handleSendToCalculator}
            id="btn-bridge-to-calculator"
          >
            <span>ส่งยอดไปคำนวณภาษี</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default MonthlyTrackerPage;
