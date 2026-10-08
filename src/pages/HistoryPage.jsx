import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Toast from '../components/Toast';

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const navigate = useNavigate();

  const handleLoadRecord = (record) => {
    navigate('/calculator', { state: { loadRecord: record } });
  };

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
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('th-TH', { 
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
  });

  const renderStatusBadge = (record) => {
    const tax = Number(record.tax_amount) || 0;
    const wht = Number(record.withholding_tax) || 0;
    const netBalance = tax - wht;

    if (wht > 0 && netBalance < 0) {
      return (
        <span className="history-status-badge refund">
          🎉 ได้คืน {fmt(Math.abs(netBalance))} ฿
        </span>
      );
    }
    if (wht > 0 && netBalance > 0) {
      return (
        <span className="history-status-badge payable">
          ⚠️ จ่ายเพิ่ม {fmt(netBalance)} ฿
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
        <h3 className="section-title">📋 ประวัติการคำนวณภาษี</h3>
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
                    <th>วันที่คำนวณ</th>
                    <th>รายได้ทั้งปี</th>
                    <th>หักค่าใช้จ่าย & ลดหย่อน</th>
                    <th>ภาษีคำนวณ</th>
                    <th>หัก ณ ที่จ่าย</th>
                    <th>สถานะสุทธิ</th>
                    <th style={{ textAlign: 'center' }}>จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((record) => (
                    <tr key={record.id}>
                      <td className="history-date-cell">{formatDate(record.calculated_at)}</td>
                      <td className="history-num-cell">{fmt(record.annual_income)} ฿</td>
                      <td className="history-num-cell">{fmt(Number(record.total_deduction) + Number(record.expense_deduction || 0))} ฿</td>
                      <td className="history-tax-cell">{fmt(record.tax_amount)} ฿</td>
                      <td className="history-num-cell" style={{ color: Number(record.withholding_tax) > 0 ? 'var(--primary-600)' : 'var(--gray-400)' }}>
                        {Number(record.withholding_tax) > 0 ? `${fmt(record.withholding_tax)} ฿` : '-'}
                      </td>
                      <td>{renderStatusBadge(record)}</td>
                      <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* มุมมอง Adaptive Card View สำหรับจอมือถือ (< 768px) */}
          <div className="history-mobile-cards">
            {history.map((record) => (
              <div key={record.id} className="history-card-item form-card animate-in">
                <div className="history-card-top">
                  <div className="history-card-date">
                    <span className="date-icon">🗓️</span>
                    <span>{formatDate(record.calculated_at)}</span>
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
                    <span className="value">{fmt(record.annual_income)} บาท</span>
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
            ))}
          </div>
        </>
      )}

      {/* Confirmation Modal สำหรับการลบประวัติ */}
      {deleteCandidate && (
        <div className="modal-backdrop" onClick={() => setDeleteCandidate(null)}>
          <div className="confirm-modal-box" onClick={e => e.stopPropagation()}>
            <div className="confirm-modal-header">
              <div className="confirm-modal-icon">🗑️</div>
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
