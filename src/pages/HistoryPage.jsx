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
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div className="section-header" style={{ marginBottom: '24px', padding: '0' }}>
        <h3 className="section-title">ประวัติการคำนวณภาษี</h3>
      </div>
      
      {history.length === 0 ? (
        <div className="form-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--gray-500)' }}>
          ไม่มีประวัติการคำนวณภาษี
        </div>
      ) : (
        <div className="form-card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)', textAlign: 'left' }}>
                <th style={{ padding: '16px 24px', fontWeight: '600', color: 'var(--gray-700)' }}>วันที่คำนวณ</th>
                <th style={{ padding: '16px 24px', fontWeight: '600', color: 'var(--gray-700)' }}>รายได้ทั้งปี</th>
                <th style={{ padding: '16px 24px', fontWeight: '600', color: 'var(--gray-700)' }}>หักลดหย่อน</th>
                <th style={{ padding: '16px 24px', fontWeight: '600', color: 'var(--gray-700)' }}>ภาษีที่ต้องชำระ</th>
                <th style={{ padding: '16px 24px', fontWeight: '600', color: 'var(--gray-700)' }}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {history.map((record) => (
                <tr key={record.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                  <td style={{ padding: '16px 24px', color: 'var(--gray-600)' }}>{formatDate(record.calculated_at)}</td>
                  <td style={{ padding: '16px 24px', fontWeight: '500' }}>{fmt(record.annual_income)} ฿</td>
                  <td style={{ padding: '16px 24px' }}>{fmt(record.total_deduction)} ฿</td>
                  <td style={{ padding: '16px 24px', fontWeight: '700', color: 'var(--primary-600)' }}>{fmt(record.tax_amount)} ฿</td>
                  <td style={{ padding: '16px 24px' }}>
                    <button 
                      onClick={() => handleDelete(record.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--red-500)', cursor: 'pointer' }}
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default HistoryPage;
