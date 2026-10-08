function ResultPanel({ result, visible }) {
  const fmt = (n) => n.toLocaleString('th-TH')

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
            <span>• หากมีรายได้มากกว่า 2,000,000 บาท อาจต้องยื่นแบบภาษี</span>
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
  )
}

export default ResultPanel
