import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History,
  Calendar,
  Sparkles,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import api from '../utils/api';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const { toasts, showToast, dismissToast } = useToast();
  const navigate = useNavigate();

  const handleLoadRecord = (record) => {
    navigate('/calculator', { state: { loadRecord: record } });
  };

  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      try {
        const res = await api.get('/tax/history');
        if (isMounted) setHistory(res.data);
      } catch (err) {
        console.error('Fetch history error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchHistory();
    return () => { isMounted = false; };
  }, []);

  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    try {
      await api.delete(`/tax/history/${deleteCandidate}`);
      setHistory(prev => prev.filter(h => h.id !== deleteCandidate));
      showToast('ลบรายการประวัติเรียบร้อยแล้ว', 'info');
    } catch (err) {
      console.error('Delete history error:', err);
      showToast('เกิดข้อผิดพลาดในการลบข้อมูล', 'error');
    } finally {
      setDeleteCandidate(null);
    }
  };

  const fmt = (n) => Number(n ?? 0).toLocaleString('th-TH');

  const formatDateParts = (dateStr) => {
    const d = new Date(dateStr);
    const dateFormatted = d.toLocaleDateString('th-TH', { 
      day: 'numeric', month: 'short', year: 'numeric' 
    });
    const timeFormatted = d.toLocaleTimeString('th-TH', { 
      hour: '2-digit', minute: '2-digit' 
    });
    return { dateFormatted, timeFormatted };
  };

  const getAnnualIncome = (record) => {
    const annual = Number(record.annual_income) || 0;
    if (annual > 0) return annual;
    const fromMonthlyAndFreelance = (Number(record.monthly_income || 0) * 12) + Number(record.freelance_income || 0);
    if (fromMonthlyAndFreelance > 0) return fromMonthlyAndFreelance;
    const deductions = Number(record.total_deduction || 0) + Number(record.expense_deduction || 0);
    return Number(record.net_income || 0) + deductions;
  };

  const renderStatusBadge = (record) => {
    const tax = Number(record.tax_amount) || 0;
    const wht = Number(record.withholding_tax) || 0;
    const netBalance = tax - wht;

    if (wht > 0 && netBalance < 0) {
      return (
        <span className="history-status-badge refund">
          <Sparkles size={12} className="inline-sparkle" />
          <span>ได้คืน {fmt(Math.abs(netBalance))} ฿</span>
        </span>
      );
    }
    if (wht > 0 && netBalance > 0) {
      return (
        <span className="history-status-badge payable">
          <AlertCircle size={12} />
          <span>จ่ายเพิ่ม {fmt(netBalance)} ฿</span>
        </span>
      );
    }
    if (tax === 0) {
      return <span className="history-status-badge zero">ยกเว้นภาษี (0 ฿)</span>;
    }
    return <span className="history-status-badge normal">ภาษี {fmt(tax)} ฿</span>;
  };

  if (loading) return <div style={{ padding: '24px' }}>กำลังโหลดข้อมูล...</div>;

  return (
    <div className="history-page-container">
      <Toast toasts={toasts} onDismiss={dismissToast} />

      <div className="section-header" style={{ marginBottom: '24px', padding: '0' }}>
        <div className="section-header-title-row">
          <History size={18} className="section-icon" />
          <h3 className="section-title">ประวัติการคำนวณภาษี</h3>
        </div>
      </div>
      
      {history.length === 0 ? (
        <div className="form-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--gray-500)' }}>
          ไม่มีประวัติการคำนวณภาษี
        </div>
      ) : (
        <>
          {/* มุมมองตารางสำหรับ Tablet & Desktop (≥ 768px) */}
          <div className="form-card history-desktop-view">
            <div className="table-responsive-wrapper">
              <table className="history-table">
                <thead>
                  <tr>
                    <th style={{ width: '15%' }}>วันที่คำนวณ</th>
                    <th style={{ textAlign: 'right', width: '14%' }}>รายได้ทั้งปี</th>
                    <th style={{ textAlign: 'right', width: '16%' }}>หักค่าใช้จ่าย & ลดหย่อน</th>
                    <th style={{ textAlign: 'right', width: '14%' }}>ภาษีคำนวณ</th>
                    <th style={{ textAlign: 'right', width: '13%' }}>หัก ณ ที่จ่าย</th>
                    <th style={{ textAlign: 'center', width: '14%' }}>สถานะสุทธิ</th>
                    <th style={{ textAlign: 'center', width: '14%' }}>จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((record) => {
                    const { dateFormatted, timeFormatted } = formatDateParts(record.calculated_at);
                    const annualIncome = getAnnualIncome(record);
                    const deductions = Number(record.total_deduction) + Number(record.expense_deduction || 0);
                    const tax = Number(record.tax_amount) || 0;
                    const wht = Number(record.withholding_tax) || 0;

                    return (
                      <tr key={record.id}>
                        <td className="history-date-cell">
                          <div className="history-date-main">{dateFormatted}</div>
                          <div className="history-date-sub">{timeFormatted} น.</div>
                        </td>
                        <td className="history-num-cell" style={{ textAlign: 'right' }}>
                          {fmt(annualIncome)} ฿
                        </td>
                        <td className="history-num-cell" style={{ textAlign: 'right' }}>
                          {fmt(deductions)} ฿
                        </td>
                        <td className="history-tax-cell" style={{ textAlign: 'right' }}>
                          {fmt(tax)} ฿
                        </td>
                        <td className="history-num-cell" style={{ textAlign: 'right', color: wht > 0 ? 'var(--primary-600)' : 'var(--gray-400)' }}>
                          {wht > 0 ? `${fmt(wht)} ฿` : '-'}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {renderStatusBadge(record)}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div className="history-actions-cell">
                            <button 
                              onClick={() => handleLoadRecord(record)}
                              className="history-action-load"
                              title="นำข้อมูลนี้ไปคำนวณในฟอร์ม"
                            >
                              ใช้ข้อมูลนี้
                            </button>
                            <button 
                              onClick={() => setDeleteCandidate(record.id)}
                              className="history-action-delete"
                              title="ลบรายการนี้"
                            >
                              ลบ
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* มุมมอง Adaptive Card View สำหรับจอมือถือ (< 768px) */}
          <div className="history-mobile-cards">
            {history.map((record) => {
              const { dateFormatted, timeFormatted } = formatDateParts(record.calculated_at);
              const annualIncome = getAnnualIncome(record);
              return (
                <div key={record.id} className="history-card-item form-card animate-in">
                  <div className="history-card-top">
                    <div className="history-card-date">
                      <span className="date-icon"><Calendar size={13} /></span>
                      <span>{dateFormatted} • {timeFormatted} น.</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <button 
                        onClick={() => handleLoadRecord(record)}
                        className="history-card-load-btn"
                        title="นำข้อมูลนี้ไปคำนวณในฟอร์ม"
                      >
                        ใช้ข้อมูลนี้
                      </button>
                      <button 
                        onClick={() => setDeleteCandidate(record.id)}
                        className="history-card-delete-btn"
                        title="ลบรายการ"
                      >
                        ลบ
                      </button>
                    </div>
                  </div>

                  <div className="history-card-details">
                    <div className="history-card-row">
                      <span className="label">รายได้ทั้งปี:</span>
                      <span className="value">{fmt(annualIncome)} บาท</span>
                    </div>
                    <div className="history-card-row">
                      <span className="label">หักค่าใช้จ่าย & ลดหย่อน:</span>
                      <span className="value">{fmt(Number(record.total_deduction) + Number(record.expense_deduction || 0))} บาท</span>
                    </div>
                    <div className="history-card-row">
                      <span className="label">ภาษีคำนวณ:</span>
                      <span className="value-tax">{fmt(record.tax_amount)} บาท</span>
                    </div>
                  {Number(record.withholding_tax) > 0 && (
                    <div className="history-card-row">
                      <span className="label">หัก ณ ที่จ่าย:</span>
                      <span className="value" style={{ color: 'var(--primary-600)' }}>
                        {fmt(record.withholding_tax)} บาท
                      </span>
                    </div>
                  )}
                  <div className="history-card-row highlight-row">
                    <span className="label">สถานะสุทธิ:</span>
                    <div>{renderStatusBadge(record)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        </>
      )}

      {/* Confirmation Modal สำหรับการลบประวัติ */}
      {deleteCandidate && (
        <div className="modal-backdrop" onClick={() => setDeleteCandidate(null)}>
          <div className="confirm-modal-box" onClick={e => e.stopPropagation()}>
            <div className="confirm-modal-header">
              <div className="confirm-modal-icon">
                <Trash2 size={22} className="text-red-500" />
              </div>
              <div className="confirm-modal-title">ยืนยันการลบประวัติ</div>
            </div>
            <div className="confirm-modal-desc">
              คุณต้องการลบข้อมูลการคำนวณภาษีนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
            </div>
            <div className="confirm-modal-actions">
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => setDeleteCandidate(null)}
              >
                ยกเลิก
              </button>
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={confirmDelete}
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HistoryPage;
