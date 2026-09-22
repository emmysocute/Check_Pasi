import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function HomePage() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

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
  }, [user]);

  const fmt = (n) => Number(n).toLocaleString('th-TH');

  if (loading) return <div style={{ padding: '24px' }}>กำลังโหลดข้อมูล...</div>;

  if (!user) {
    return (
      <div className="content-area" style={{ display: 'block', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <div className="welcome-banner animate-in">
          <div className="welcome-text" style={{ width: '100%' }}>
            <h2>ยินดีต้อนรับสู่ TaxMe</h2>
            <p style={{ margin: '0 auto' }}>
              เข้าสู่ระบบเพื่อดูสถิติและประวัติการคำนวณภาษีของคุณ
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="content-area" style={{ display: 'block', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <div className="welcome-banner animate-in">
          <div className="welcome-text" style={{ width: '100%' }}>
            <h2>ยินดีต้อนรับ, {user.display_name || user.email}</h2>
            <p style={{ margin: '0 auto 16px' }}>คุณยังไม่มีประวัติการคำนวณภาษี</p>
            <Link to="/calculator" className="btn btn-primary">เริ่มคำนวณภาษีกันเลย!</Link>
          </div>
        </div>
      </div>
    );
  }

  const latest = history[0];
  
  const chartData = [
    { name: 'เงินได้สุทธิ', value: Number(latest.net_income), color: '#1a6ae0' },
    { name: 'ค่าลดหย่อนรวม', value: Number(latest.total_deduction) + Number(latest.expense_deduction || 0), color: '#12b76a' },
    { name: 'ภาษีที่ต้องจ่าย', value: Number(latest.tax_amount), color: '#f04438' }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <div className="welcome-banner animate-in" style={{ marginBottom: '24px' }}>
        <div className="welcome-text">
          <h2>สถิติภาษีล่าสุดของคุณ</h2>
          <p>สรุปข้อมูลจากการคำนวณครั้งล่าสุด (ปีภาษี 2568)</p>
        </div>
        <div className="welcome-badge">
          <div className="welcome-badge-icon">📊</div>
          <div className="welcome-badge-text">STATS</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* สถิติสรุป */}
        <div className="form-card animate-in-delay-1" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>ข้อมูลการคำนวณล่าสุด</h3>
          
          <div className="result-breakdown" style={{ padding: '0' }}>
            <div className="result-row">
              <span className="result-row-label">รายได้ทั้งปี</span>
              <span className="result-row-value">
                {fmt(latest.annual_income)} <span className="result-row-unit">บาท</span>
              </span>
            </div>
            <div className="result-row">
              <span className="result-row-label">รวมหักค่าใช้จ่าย & ลดหย่อน</span>
              <span className="result-row-value">
                {fmt(Number(latest.total_deduction) + Number(latest.expense_deduction || 0))} <span className="result-row-unit">บาท</span>
              </span>
            </div>
            <div className="result-row highlight">
              <span className="result-row-label">เงินได้สุทธิ</span>
              <span className="result-row-value">
                {fmt(latest.net_income)} <span className="result-row-unit">บาท</span>
              </span>
            </div>
          </div>

          <div style={{ marginTop: '24px', padding: '16px', background: 'var(--red-50)', borderRadius: 'var(--radius-md)', border: '1px solid #fecaca' }}>
            <div style={{ fontSize: '13px', color: 'var(--red-500)', marginBottom: '4px' }}>ภาษีที่ต้องชำระ (ประมาณการ)</div>
            <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--red-500)', lineHeight: '1' }}>
              {fmt(latest.tax_amount)} <span style={{ fontSize: '16px' }}>บาท</span>
            </div>
          </div>
          
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <Link to="/calculator" className="btn btn-primary" style={{ width: '100%' }}>
              ไปหน้าคำนวณภาษี 🧮
            </Link>
          </div>
        </div>

        {/* กราฟวงกลม */}
        <div className="form-card animate-in-delay-2" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>สัดส่วนรายได้และภาษี</h3>
          
          <div style={{ flex: 1, minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${fmt(value)} บาท`} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
