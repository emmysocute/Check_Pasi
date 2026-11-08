import { useState, useMemo } from 'react';
import { simulateTaxSavings } from '../utils/taxEngine';

function ResultPanel({ result, visible, onOpenPreFilingSheet }) {
  const [isBracketOpen, setIsBracketOpen] = useState(false);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(true);
  const [simulatedAmount, setSimulatedAmount] = useState(30000);

  const fmt = (n) => (n ?? 0).toLocaleString('th-TH');

  const simulation = useMemo(() => {
    if (!result) return null;
    return simulateTaxSavings(result, simulatedAmount);
  }, [result, simulatedAmount]);

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
                <div className="refund-badge">📋 ยอดภาษีที่ต้องชำระเพิ่มเติม</div>
                <div className="result-highlight-label">ยอดภาษีที่ต้องนำส่งเพิ่มหลังหัก ณ ที่จ่ายแล้ว</div>
                <div className="result-highlight-amount">
                  <span className="amount">{fmt(result.payableAmount)}</span>
                  <span className="unit">บาท</span>
                </div>
              </div>
            ) : (
              <div className="result-highlight standard">
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

            {/* CTA Button to Open ภ.ง.ด. 90/91 Pre-Filing Sheet */}
            {onOpenPreFilingSheet && (
              <div style={{ padding: '0 24px 16px' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-block prefiling-trigger-btn"
                  onClick={onOpenPreFilingSheet}
                >
                  📋 ดูใบสรุปเตรียมยื่นแบบ ภ.ง.ด. 90/91
                </button>
              </div>
            )}

            <div className="result-note">
              <p>
                ℹ️ ผลการคำนวณนี้เป็นการประมาณการตามเกณฑ์สรรพากรปีภาษี 2569
                <br />
                เพื่อใช้เตรียมตัววางแผนและนำตัวเลขไปยื่นแบบ ภ.ง.ด. 90/91 ผ่าน rd.go.th
              </p>
            </div>
          </>
        )}
      </div>

      {/* ===== Interactive Tax Saving Advisor (What-If Simulator) ===== */}
      {visible && (result.finalTax > 0 || result.netIncome > 150000) && simulation && (
        <div className="advisor-card glass-card">
          <div className="advisor-header">
            <div className="advisor-title-box">
              <span className="advisor-badge">💡 วางแผนภาษีอัจฉริยะ</span>
              <h4 className="advisor-title">จำลองซื้อลดหย่อนเพิ่ม</h4>
            </div>
            <button
              type="button"
              className="advisor-toggle-btn"
              onClick={() => setIsAdvisorOpen((prev) => !prev)}
              aria-expanded={isAdvisorOpen}
            >
              {isAdvisorOpen ? 'ย่อลง ▲' : 'จำลอง ▼'}
            </button>
          </div>

          <p className="advisor-subtitle">
            จำลองซื้อ SSF / RMF / ประกันชีวิตเพิ่ม เพื่อดูยอดเงินภาษีที่ประหยัดได้จริง
          </p>

          {isAdvisorOpen && (
            <div className="advisor-content">
              <div className="advisor-preset-group" role="group" aria-label="เลือกจำนวนเงินลดหย่อนจำลอง">
                {[10000, 30000, 50000, 100000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    className={`advisor-preset-btn ${simulatedAmount === amt ? 'active' : ''}`}
                    onClick={() => setSimulatedAmount(amt)}
                  >
                    +฿{(amt / 1000).toLocaleString('th-TH')}k
                  </button>
                ))}
              </div>

              <div className="advisor-slider-wrapper">
                <div className="advisor-slider-labels">
                  <span>ลดหย่อนจำลองเพิ่ม:</span>
                  <strong>฿{fmt(simulatedAmount)}</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100000"
                  step="5000"
                  value={simulatedAmount}
                  onChange={(e) => setSimulatedAmount(Number(e.target.value))}
                  className="advisor-range-slider"
                  aria-label="ปรับจำนวนเงินลดหย่อนที่ต้องการจำลอง"
                />
                <div className="slider-ticks">
                  <span>0 บ.</span>
                  <span>50,000 บ.</span>
                  <span>100,000 บ.</span>
                </div>
              </div>

              {simulation.taxSaved > 0 ? (
                <div className="advisor-savings-banner">
                  <div className="savings-row">
                    <div>
                      <div className="savings-label">ประหยัดภาษีได้</div>
                      <div className="savings-amount">฿{fmt(simulation.taxSaved)}</div>
                    </div>
                    <div className="savings-roi-box">
                      <span className="roi-label">Tax ROI</span>
                      <span className="roi-tag">{simulation.effectiveSavingRate}%</span>
                    </div>
                  </div>
                  <div className="savings-microcopy">
                    {simulation.newStatus === 'refund' && simulation.baseStatus !== 'refund' ? (
                      <span>🎉 พลิกเป็น <strong>ได้รับเงินคืนภาษี ฿{fmt(Math.abs(simulation.newBalance))}</strong></span>
                    ) : (
                      <span>ภาระภาษีลดเหลือ <strong>฿{fmt(simulation.newTax)}</strong> (เดิม ฿{fmt(simulation.baseTax)})</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="advisor-no-saving">
                  <span>เลื่อนแถบตัวเลขด้านบนเพื่อจำลองยอดประหยัดภาษี</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

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
