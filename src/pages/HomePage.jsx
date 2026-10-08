import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function HomePage() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(Boolean(user));

  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    const fetchHistory = async () => {
      try {
        const res = await api.get('/tax/history');
        if (isMounted) setHistory(res.data);
      } catch (err) {
        console.error('Fetch home history error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchHistory();
    return () => { isMounted = false; };
  }, [user]);

  const fmt = (n) => Number(n ?? 0).toLocaleString('th-TH');

  if (user && loading) return <div style={{ padding: '24px' }}>กำลังโหลดข้อมูล...</div>;

  if (!user) {
    return (
      <div className="home-container" style={{ textAlign: 'center' }}>
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
      <div className="home-container" style={{ textAlign: 'center' }}>
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
  const annualIncome = Number(latest.annual_income) || 0;
  const expenseAndDeduction = Number(latest.total_deduction) + Number(latest.expense_deduction || 0);
  const taxAmount = Number(latest.tax_amount) || 0;
  const withholdingTax = Number(latest.withholding_tax) || 0;
  const netBalance = taxAmount - withholdingTax;
  const takeHomeIncome = Math.max(0, annualIncome - taxAmount);

  const chartData = [
    { name: 'เงินได้สุทธิคงเหลือหลังภาษี', value: takeHomeIncome, color: '#1a6ae0' },
    { name: 'หักค่าใช้จ่าย & ค่าลดหย่อน', value: expenseAndDeduction, color: '#12b76a' },
    { name: 'ภาษีที่คำนวณได้', value: taxAmount, color: '#f04438' }
  ];

  return (
    <div className="home-container">
      <div className="welcome-banner animate-in" style={{ marginBottom: '24px' }}>
        <div className="welcome-text">
          <h2>สถิติภาษีล่าสุดของคุณ</h2>
          <p>สรุปข้อมูลจากการคำนวณครั้งล่าสุด (ปีภาษี 2569)</p>
        </div>
        <div className="welcome-badge">
          <div className="welcome-badge-icon">📊</div>
          <div className="welcome-badge-text">STATS</div>
        </div>
      </div>

      <div className="dashboard-grid">
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
                {fmt(expenseAndDeduction)} <span className="result-row-unit">บาท</span>
              </span>
            </div>
            <div className="result-row highlight">
              <span className="result-row-label">เงินได้สุทธิ</span>
              <span className="result-row-value">
                {fmt(latest.net_income)} <span className="result-row-unit">บาท</span>
              </span>
            </div>
            {withholdingTax > 0 && (
              <div className="result-row">
                <span className="result-row-label">หัก ณ ที่จ่ายสะสม</span>
                <span className="result-row-value" style={{ color: 'var(--primary-600)' }}>
                  - {fmt(withholdingTax)} <span className="result-row-unit">บาท</span>
                </span>
              </div>
            )}
          </div>

          {/* สรุปสถานะภาษีสุทธิ */}
          {withholdingTax > 0 && netBalance < 0 ? (
            <div style={{ marginTop: '20px', padding: '16px', background: '#ecfdf5', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0' }}>
              <div style={{ fontSize: '13px', color: '#047857', fontWeight: 600, marginBottom: '4px' }}>🎉 ได้รับเงินคืนภาษีสุทธิ (Refund)</div>
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#059669', lineHeight: '1' }}>
                +{fmt(Math.abs(netBalance))} <span style={{ fontSize: '16px' }}>บาท</span>
              </div>
            </div>
          ) : withholdingTax > 0 && netBalance > 0 ? (
            <div style={{ marginTop: '20px', padding: '16px', background: 'var(--red-50)', borderRadius: 'var(--radius-md)', border: '1px solid #fecaca' }}>
              <div style={{ fontSize: '13px', color: 'var(--red-500)', fontWeight: 600, marginBottom: '4px' }}>⚠️ ภาษีที่ต้องชำระเพิ่มเติม</div>
              <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--red-500)', lineHeight: '1' }}>
                {fmt(netBalance)} <span style={{ fontSize: '16px' }}>บาท</span>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: '20px', padding: '16px', background: 'var(--red-50)', borderRadius: 'var(--radius-md)', border: '1px solid #fecaca' }}>
              <div style={{ fontSize: '13px', color: 'var(--red-500)', marginBottom: '4px' }}>ภาษีที่ต้องชำระ (ประมาณการ)</div>
              <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--red-500)', lineHeight: '1' }}>
                {fmt(latest.tax_amount)} <span style={{ fontSize: '16px' }}>บาท</span>
              </div>
            </div>
          )}
          
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <Link to="/calculator" className="btn btn-primary" style={{ width: '100%' }}>
              ไปหน้าคำนวณภาษี 🧮
            </Link>
          </div>
        </div>

        {/* กราฟวงกลม */}
        <div className="form-card animate-in-delay-2 home-chart-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>สัดส่วนรายได้และภาษี</h3>
          
          <div className="chart-container-wrapper" style={{ flex: 1, minHeight: '280px' }}>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
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
