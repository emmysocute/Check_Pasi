import { useState, useMemo, useCallback } from 'react';
import {
  Sparkles,
  TrendingUp,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Info,
  Sliders,
  Layers,
  Star,
} from 'lucide-react';
import { simulateTaxSavings } from '../utils/taxEngine';

function ResultPanel({ result, visible, onOpenPreFilingSheet }) {
  const [isBracketOpen, setIsBracketOpen] = useState(false);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(true);
  const [simulatedAmount, setSimulatedAmount] = useState(30000);
  const [hasCopied, setHasCopied] = useState(false);

  const fmt = (n) => (n ?? 0).toLocaleString('th-TH');

  const simulation = useMemo(() => {
    if (!result) return null;
    return simulateTaxSavings(result, simulatedAmount);
  }, [result, simulatedAmount]);

  const handleCopyResult = useCallback(() => {
    if (!result) return;
    const amount =
      result.status === 'refund'
        ? result.refundAmount
        : result.status === 'payable'
        ? result.payableAmount
        : result.finalTax;
    navigator.clipboard.writeText(String(amount || 0));
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  }, [result]);

  return (
    <div className="right-panel">
      {/* ===== Tax Result Card ===== */}
      <div className="result-card">
        <div className="result-header">
          <div className="result-header-text">
            <h3>ผลการคำนวณภาษี</h3>
            <p>จากข้อมูลที่คุณกรอกสำหรับปีภาษี 2569</p>
          </div>
        </div>

        {visible && (
          <>
            <div style={{ padding: '0 24px' }}>
              {result.taxMethod === 'flat_rate' ? (
                <div className="tax-method-badge flat-rate">
                  <TrendingUp size={13} />
                  <span>คำนวณวิธีเหมา 0.5% (ม.48(2))</span>
                </div>
              ) : (
                <div className="tax-method-badge bracket">
                  <Layers size={13} />
                  <span>คำนวณตามอัตราก้าวหน้า (ม.48(1))</span>
                </div>
              )}
            </div>

            {/* Interactive Result Highlight with One-Click Copy */}
            {result.status === 'refund' ? (
              <div className="result-highlight refund">
                <div className="refund-badge">
                  <Sparkles size={14} className="sparkle-icon" />
                  <span>ได้รับเงินคืนภาษี (Tax Refund)</span>
                </div>
                <div className="result-highlight-label">ยอดเงินที่คุณจะได้รับคืนจากกรมสรรพากร</div>
                <div className="result-highlight-amount-row">
                  <div className="result-highlight-amount">
                    <span className="amount">{fmt(result.refundAmount)}</span>
                    <span className="unit">บาท</span>
                  </div>
                  <button
                    type="button"
                    className="result-copy-btn"
                    onClick={handleCopyResult}
                    title="คัดลอกยอดเงินคืน"
                    aria-label="คัดลอกยอดเงินคืน"
                  >
                    {hasCopied ? <Check size={15} /> : <Copy size={15} />}
                    <span>{hasCopied ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                  </button>
                </div>
              </div>
            ) : result.status === 'payable' && result.withholdingTax > 0 ? (
              <div className="result-highlight payable">
                <div className="refund-badge">
                  <AlertCircle size={14} />
                  <span>ยอดภาษีที่ต้องชำระเพิ่มเติม</span>
                </div>
                <div className="result-highlight-label">ยอดภาษีที่ต้องนำส่งเพิ่มหลังหัก ณ ที่จ่ายแล้ว</div>
                <div className="result-highlight-amount-row">
                  <div className="result-highlight-amount">
                    <span className="amount">{fmt(result.payableAmount)}</span>
                    <span className="unit">บาท</span>
                  </div>
                  <button
                    type="button"
                    className="result-copy-btn"
                    onClick={handleCopyResult}
                    title="คัดลอกยอดที่ต้องชำระ"
                    aria-label="คัดลอกยอดที่ต้องชำระ"
                  >
                    {hasCopied ? <Check size={15} /> : <Copy size={15} />}
                    <span>{hasCopied ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="result-highlight standard">
                <div className="result-highlight-label">ภาษีที่ต้องชำระทั้งปี (โดยประมาณ)</div>
                <div className="result-highlight-amount-row">
                  <div className="result-highlight-amount">
                    <span className="amount">{fmt(result.finalTax ?? result.tax)}</span>
                    <span className="unit">บาท / ปี</span>
                  </div>
                  <button
                    type="button"
                    className="result-copy-btn"
                    onClick={handleCopyResult}
                    title="คัดลอกยอดภาษี"
                    aria-label="คัดลอกยอดภาษี"
                  >
                    {hasCopied ? <Check size={15} /> : <Copy size={15} />}
                    <span>{hasCopied ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Interactive Tax Bracket Progress Meter (Delightful visual touch) */}
            {result.taxMethod !== 'flat_rate' && (
              <div className="tax-meter-container">
                <div className="tax-meter-header">
                  <span>ฐานภาษีของคุณ:</span>
                  <strong className="tax-meter-rate">{Math.round((result.marginalRate || 0) * 100)}%</strong>
                </div>
                <div className="tax-meter-bar" aria-label="แถบแสดงอัตราภาษี 8 ขั้น">
                  {[0, 0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.35].map((rate, i) => {
                    const isPassed = (result.marginalRate || 0) >= rate && (result.netIncome || 0) > 0;
                    const isCurrent = (result.marginalRate || 0) === rate && (result.netIncome || 0) > 0;
                    return (
                      <div
                        key={i}
                        className={`meter-step ${isPassed ? 'passed' : ''} ${isCurrent ? 'current' : ''}`}
                        title={`ฐาน ${rate * 100}%`}
                      >
                        <span className="meter-step-label">{rate * 100}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {result.taxMethod === 'flat_rate' && (
              <div className="flat-rate-notice">
                <Info size={15} className="notice-icon" />
                <span>
                  เนื่องจากคุณมีรายได้ฟรีแลนซ์/อื่นๆ เกิน 120,000 บาท และคำนวณภาษีวิธีเหมา 0.5% ({fmt(result.flatRateTax)} บาท) ได้ยอดสูงกว่าวิธีอัตราก้าวหน้า ({fmt(result.bracketTax)} บาท) กฎหมายสรรพากรกำหนดให้เสียภาษีตามยอดที่สูงกว่า
                </span>
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
                    <span className="result-row-value text-indigo">
                      - {fmt(result.withholdingTax)} บาท
                    </span>
                  </div>
                  <div className="result-row highlight summary-net-row">
                    <span className="result-row-label" style={{ fontWeight: 700 }}>
                      {result.status === 'refund' ? 'ยอดเงินคืนภาษีสุทธิ' : 'ยอดภาษีที่ต้องชำระเพิ่ม'}
                    </span>
                    <span className={`result-row-value ${result.status === 'refund' ? 'text-emerald' : 'text-amber'}`} style={{ fontWeight: 800, fontSize: '15.5px' }}>
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
                  onClick={() => setIsBracketOpen((prev) => !prev)}
                  aria-expanded={isBracketOpen}
                >
                  <span className="accordion-toggle-title">
                    <Layers size={15} />
                    <span>แจกแจงขั้นบันไดภาษี 8 ขั้น</span>
                  </span>
                  <span className="accordion-arrow">
                    {isBracketOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </span>
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
                                {isMarginal && (
                                  <span className="marginal-star-tag">
                                    <Star size={10} fill="currentColor" />
                                    <span>สูงสุด</span>
                                  </span>
                                )}
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
                  <FileSpreadsheet size={16} />
                  <span>ดูใบสรุปเตรียมยื่นแบบ ภ.ง.ด. 90/91</span>
                </button>
              </div>
            )}

            <div className="result-note">
              <p>
                ผลการคำนวณเป็นการประมาณการตามเกณฑ์กรมสรรพากรปีภาษี 2569
                <br />
                เพื่อใช้วางแผนและนำตัวเลขไปยื่นแบบ ภ.ง.ด. 90/91 ผ่าน rd.go.th
              </p>
            </div>
          </>
        )}
      </div>

      {/* ===== Interactive Tax Saving Advisor (What-If Simulator) ===== */}
      {visible && (result.finalTax > 0 || result.netIncome > 150000) && simulation && (
        <div className="advisor-card">
          <div className="advisor-header">
            <div className="advisor-title-box">
              <span className="advisor-badge">
                <Sliders size={12} />
                <span>จำลองลดหย่อนเพิ่ม</span>
              </span>
              <h4 className="advisor-title">What-If Tax Advisor</h4>
            </div>
            <button
              type="button"
              className="advisor-toggle-btn"
              onClick={() => setIsAdvisorOpen((prev) => !prev)}
              aria-expanded={isAdvisorOpen}
            >
              {isAdvisorOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
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
                      <span className="refund-turn-highlight">
                        <Sparkles size={13} />
                        <span>พลิกเป็น <strong>ได้รับเงินคืนภาษี ฿{fmt(Math.abs(simulation.newBalance))}</strong></span>
                      </span>
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
          <Info size={16} />
          <h4>ข้อมูลที่ควรรู้</h4>
        </div>
        <div className="info-list">
          <div className="info-list-item">
            <CheckCircle2 size={14} className="check-icon" />
            <span>สามารถหักค่าลดหย่อนภาษีได้ตามสิทธิที่กฎหมายกำหนด</span>
          </div>
          <div className="info-list-item">
            <CheckCircle2 size={14} className="check-icon" />
            <span>สำหรับฟรีแลนซ์/รายได้อื่นเกิน 120,000 บ. กรมสรรพากรจะเปรียบเทียบอัตราเหมา 0.5% (ม.48(2))</span>
          </div>
          <div className="info-list-item">
            <CheckCircle2 size={14} className="check-icon" />
            <span>
              ตรวจสอบรายละเอียดเพิ่มเติมได้ที่{' '}
              <a href="https://www.rd.go.th" target="_blank" rel="noopener noreferrer">
                กรมสรรพากร (rd.go.th)
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResultPanel;
