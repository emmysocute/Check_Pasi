import { useState, useEffect } from 'react';
import api from '../utils/api';

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/tax/history');
        setHistory(res.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('คุณต้องการลบข้อมูลนี้ใช่หรือไม่?')) return;
    try {
      await api.delete(`/tax/history/${id}`);
      setHistory(history.filter(h => h.id !== id));
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการลบข้อมูล');
    }
  };

  const fmt = (n) => Number(n).toLocaleString('th-TH');
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('th-TH', { 
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
  });

  if (loading) return <div style={{ padding: '24px' }}>กำลังโหลดข้อมูล...</div>;

  return (
    <div className="history-page-container">
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
                    <th>ภาษีที่ต้องชำระ</th>
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
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          onClick={() => handleDelete(record.id)}
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
                  <button 
                    onClick={() => handleDelete(record.id)}
                    className="history-card-delete-btn"
                    title="ลบรายการ"
                  >
                    ลบ
                  </button>
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
                  <div className="history-card-row highlight-row">
                    <span className="label">ภาษีที่ต้องชำระ:</span>
                    <span className="value-tax">{fmt(record.tax_amount)} บาท</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default HistoryPage;
