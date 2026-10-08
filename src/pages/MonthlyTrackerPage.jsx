import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import Toast from '../components/Toast';
import { blockInvalidChars, sanitizeNumericInput } from '../utils/numberInput';
import {
  MONTH_NAMES_TH,
  MONTH_SHORT_TH,
  createDefaultMonthlyRecords,
  calculateMonthlyTotals,
  calculateQuick3Percent,
  estimateTrackerRefund,
} from '../utils/monthlyTracker';

const TAX_YEARS = [
  { ce: 2026, be: 2569, label: 'ปีภาษี 2569 (2026)' },
  { ce: 2025, be: 2568, label: 'ปีภาษี 2568 (2025)' },
  { ce: 2024, be: 2567, label: 'ปีภาษี 2567 (2024)' },
];

function MonthlyTrackerPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selectedYear, setSelectedYear] = useState(2026);
  const [records, setRecords] = useState(createDefaultMonthlyRecords());
  const [settings, setSettings] = useState({
    showWithholding: true,
    showSocialSecurity: false,
    showNote: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toasts, setToasts] = useState([]);

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
  }, [navigate, selectedYear, totals]);

  return (
    <div className="tracker-page-container has-floating-bar animate-fade-in">
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Header Banner */}
      <div className="tracker-header glass-card">
        <div className="tracker-header-left">
          <div className="tracker-badge">📅 ระบบวางแผนรายเดือน</div>
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
          <span>⚙️ เลือกข้อมูลที่ต้องการกรอก:</span>
          <span className="tracker-toolbar-sub">(ปิดคอลัมน์ที่ไม่จำเป็นเพื่อให้หน้าจอสะอาดขึ้น)</span>
        </div>
        <div className="tracker-pills-group">
          <button
            type="button"
            className="tracker-pill active locked"
            title="รายได้ของแต่ละเดือนจำเป็นต้องกรอก"
            disabled
          >
            ✓ 💰 รายได้ของเดือน
          </button>

          <button
            type="button"
            className={`tracker-pill ${settings.showWithholding ? 'active' : ''}`}
            onClick={() => toggleSetting('showWithholding')}
            id="toggle-col-withholding"
          >
            {settings.showWithholding ? '✓' : '+'} 🧾 ภาษีหัก ณ ที่จ่าย (3%)
          </button>

          <button
            type="button"
            className={`tracker-pill ${settings.showSocialSecurity ? 'active' : ''}`}
            onClick={() => toggleSetting('showSocialSecurity')}
            id="toggle-col-social-security"
          >
            {settings.showSocialSecurity ? '✓' : '+'} 🏥 ประกันสังคม
          </button>

          <button
            type="button"
            className={`tracker-pill ${settings.showNote ? 'active' : ''}`}
            onClick={() => toggleSetting('showNote')}
            id="toggle-col-note"
          >
            {settings.showNote ? '✓' : '+'} 📝 โน้ต / แหล่งที่มา
          </button>
        </div>
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
              {records.map((rec, index) => {
                const monthName = MONTH_NAMES_TH[index];
                const monthShort = MONTH_SHORT_TH[index];

                return (
                  <tr key={rec.month} className="tracker-row">
                    {/* Month Column */}
                    <td className="month-col">
                      <div className="month-badge-wrapper">
                        <span className="month-number">{rec.month}</span>
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
                        <div className="table-input-group has-shortcut">
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
                          <button
                            type="button"
                            className="btn-quick-3percent"
                            onClick={() => handleQuick3Percent(index)}
                            title="คำนวณ 3% อัตโนมัติจากรายได้เดือนนี้"
                            id={`btn-3pct-${rec.month}`}
                          >
                            ⚡ 3%
                          </button>
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
                            📋 คัดลอก
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
                            ✕
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
                🎉 โอกาสได้เงินคืน: +{estimatedRefund.refundPotential.toLocaleString('th-TH')} บ.
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
            onClick={handleSave}
            disabled={isSaving}
            id="btn-save-tracker"
          >
            {isSaving ? '⏳ กำลังบันทึก...' : '💾 บันทึกข้อมูล'}
          </button>

          <button
            type="button"
            className="btn btn-primary btn-bridge-calculator"
            onClick={handleSendToCalculator}
            id="btn-bridge-to-calculator"
          >
            🚀 ส่งยอดไปคำนวณภาษีประจำปี
          </button>
        </div>
      </div>
    </div>
  );
}

export default MonthlyTrackerPage;
