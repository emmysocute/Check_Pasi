import { useState } from 'react';

function ResultPanel({ result, visible }) {
  const [isBracketOpen, setIsBracketOpen] = useState(false);
  const fmt = (n) => (n ?? 0).toLocaleString('th-TH');

  return (
    <div className="right-panel">
      {/* ===== Tax Result Card ===== */}
      <div className="result-card">
        <div className="result-header">
          <div className="result-header-text">
            <h3>ผลการคำนวณภาษี</h3>
            <p>จากข้อมูลที่คุณกรอก</p>
          </div>
        </div>

        {visible && (
          <>
            <div style={{ padding: '0 24px' }}>
              {result.taxMethod === 'flat_rate' ? (
                <div className="tax-method-badge flat-rate">
                  ⚡ คำนวณวิธีเหมา 0.5% (ม.48(2))
                </div>
              ) : (
                <div className="tax-method-badge bracket">
                  📈 คำนวณตามอัตราก้าวหน้า (ม.48(1))
                </div>
              )}
            </div>

            {result.status === 'refund' ? (
              <div className="result-highlight refund">
                <div className="refund-badge">🎉 ได้รับเงินคืนภาษี (Tax Refund)</div>
                <div className="result-highlight-label">ยอดเงินที่คุณจะได้รับคืนจากกรมสรรพากร</div>
                <div className="result-highlight-amount">
                  <span className="amount">{fmt(result.refundAmount)}</span>
                  <span className="unit">บาท</span>
                </div>
              </div>
            ) : result.status === 'payable' && result.withholdingTax > 0 ? (
              <div className="result-highlight payable">
                <div className="refund-badge" style={{ background: 'rgba(0,0,0,0.18)' }}>⚠️ ภาษีที่ต้องชำระเพิ่มเติม</div>
                <div className="result-highlight-label">ยอดภาษีที่ต้องนำส่งเพิ่มหลังหัก ณ ที่จ่าย</div>
                <div className="result-highlight-amount">
                  <span className="amount">{fmt(result.payableAmount)}</span>
                  <span className="unit">บาท</span>
                </div>
              </div>
            ) : (
              <div className="result-highlight">
                <div className="result-highlight-label">ภาษีที่ต้องชำระทั้งปี (โดยประมาณ)</div>
                <div className="result-highlight-amount">
                  <span className="amount">{fmt(result.finalTax ?? result.tax)}</span>
                  <span className="unit">บาท / ปี</span>
                </div>
              </div>
            )}

            {result.taxMethod === 'flat_rate' && (
              <div style={{
                margin: '12px 24px 0',
                padding: '10px 14px',
                background: '#fffbeb',
                border: '1px solid #fef3c7',
                borderRadius: 'var(--radius-md)',
                fontSize: '11px',
                color: '#92400e',
                lineHeight: 1.5
              }}>
                💡 เนื่องจากคุณมีรายได้ฟรีแลนซ์/อื่นๆ เกิน 120,000 บาท และคำนวณภาษีวิธีเหมา 0.5% ({fmt(result.flatRateTax)} บาท) ได้ยอดสูงกว่าวิธีอัตราก้าวหน้า ({fmt(result.bracketTax)} บาท) กฎหมายสรรพากรกำหนดให้เสียภาษีตามยอดที่สูงกว่า
              </div>
            )}

            <div className="result-breakdown">
              <div className="result-row">
                <span className="result-row-label">รายได้ทั้งปี</span>
                <span className="result-row-value">
                  {fmt(result.sumIncome || result.annualIncome)} บาท
                </span>
              </div>
              <div className="result-row">
                <span className="result-row-label">หักค่าใช้จ่าย (มาตรฐาน)</span>
                <span className="result-row-value">
                  {fmt(result.expenseDeduction)} บาท
                </span>
              </div>
              <div className="result-row">
                <span className="result-row-label">หักลดหย่อน</span>
                <span className="result-row-value">
                  {fmt(result.totalDeduction)} บาท
                </span>
              </div>
              <div className="result-row highlight">
                <span className="result-row-label">เงินได้สุทธิ</span>
                <span className="result-row-value">
                  {fmt(result.netIncome)} บาท
                </span>
              </div>
              <div className="result-row highlight">
                <span className="result-row-label">ภาษีที่คำนวณได้ทั้งปี</span>
                <span className="result-row-value">
                  {fmt(result.finalTax ?? result.tax)} บาท
                </span>
              </div>

              {result.withholdingTax > 0 && (
                <>
                  <div className="result-row">
                    <span className="result-row-label">หัก ภาษี ณ ที่จ่ายสะสม</span>
                    <span className="result-row-value" style={{ color: 'var(--primary-600)' }}>
                      - {fmt(result.withholdingTax)} บาท
                    </span>
                  </div>
                  <div className="result-row highlight" style={{ 
                    borderTop: '2px dashed var(--gray-200)', 
                    paddingTop: '10px', 
                    marginTop: '6px' 
                  }}>
                    <span className="result-row-label" style={{ fontWeight: 700 }}>
                      {result.status === 'refund' ? 'ยอดเงินคืนภาษีสุทธิ' : 'ยอดภาษีที่ต้องชำระเพิ่ม'}
                    </span>
                    <span className="result-row-value" style={{ 
                      fontWeight: 800, 
                      color: result.status === 'refund' ? 'var(--green-600)' : 'var(--red-600)',
                      fontSize: '15px'
                    }}>
                      {result.status === 'refund' ? `+ ${fmt(result.refundAmount)} ฿` : `${fmt(result.payableAmount)} ฿`}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* ===== Collapsible Tax Bracket Breakdown ===== */}
            {result.brackets && result.brackets.length > 0 && (
              <div className="tax-bracket-accordion">
                <button
                  type="button"
                  className="accordion-toggle-btn"
                  onClick={() => setIsBracketOpen(prev => !prev)}
                  aria-expanded={isBracketOpen}
                >
                  <span className="accordion-toggle-title">
                    <span>📊</span>
                    <span>ดูแจกแจงขั้นบันไดภาษี 8 ขั้น</span>
                  </span>
                  <span className={`accordion-arrow ${isBracketOpen ? 'open' : ''}`}>▼</span>
                </button>
                {isBracketOpen && (
                  <div className="accordion-content">
                    <div className="marginal-banner">
                      <span className="marginal-banner-label">ฐานภาษีสูงสุดของคุณ:</span>
                      <span className="marginal-banner-badge">{Math.round((result.marginalRate || 0) * 100)}%</span>
                    </div>
                    <table className="bracket-table">
                      <thead>
                        <tr>
                          <th>ขั้นเงินได้สุทธิ</th>
                          <th className="text-right">อัตรา</th>
                          <th className="text-right">เงินได้ในขั้น</th>
                          <th className="text-right">ภาษี</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.brackets.map((b, idx) => {
                          const isMarginal = result.marginalRate > 0 && b.rate === result.marginalRate && b.taxable > 0;
                          const hasTaxable = b.taxable > 0;
                          return (
                            <tr
                              key={idx}
                              className={`${isMarginal ? 'marginal-bracket' : ''} ${hasTaxable ? 'active-bracket' : ''}`}
                            >
                              <td>
                                {b.label}
                                {isMarginal && <span style={{ marginLeft: 4, fontSize: 10, color: 'var(--primary-600)' }}>★ สูงสุด</span>}
                              </td>
                              <td className="text-right">
                                <span className={`rate-chip ${b.rate === 0 ? 'zero' : b.rate <= 0.1 ? 'low' : b.rate <= 0.2 ? 'mid' : 'high'}`}>
                                  {Math.round(b.rate * 100)}%
                                </span>
                              </td>
                              <td className="text-right">{fmt(b.taxable)} ฿</td>
                              <td className="text-right" style={{ fontWeight: b.tax > 0 ? 600 : 400 }}>{fmt(b.tax)} ฿</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            <div className="result-note">
              <p>
                ผลการคำนวณนี้เป็นการประมาณการเบื้องต้น
                <br />
                อาจมีการเปลี่ยนแปลงตามรายละเอียดอื่นๆ
              </p>
            </div>
          </>
        )}
      </div>

      {/* ===== Info Card ===== */}
      <div className="info-card">
        <div className="info-card-header">
          <h4>ข้อมูลที่ควรรู้</h4>
        </div>
        <div className="info-list">
          <div className="info-list-item">
            <span>• สามารถหักค่าลดหย่อนภาษีได้ตามสิทธิที่กฎหมายกำหนด</span>
          </div>
          <div className="info-list-item">
            <span>• สำหรับฟรีแลนซ์/รายได้อื่นเกิน 120,000 บ. กรมสรรพากรจะเปรียบเทียบอัตราเหมา 0.5% (ม.48(2))</span>
          </div>
          <div className="info-list-item">
            <span>
              • ตรวจสอบรายละเอียดเพิ่มเติมได้ที่{' '}
              <a href="https://www.rd.go.th" target="_blank" rel="noopener noreferrer">
                กรมสรรพากร
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResultPanel;
