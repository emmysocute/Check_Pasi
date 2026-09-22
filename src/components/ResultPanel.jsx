function ResultPanel({ result, visible, onSave, user, ...props }) {
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
            <div className="result-highlight">
              <div className="result-highlight-label">ภาษีที่ต้องชำระ (โดยประมาณ)</div>
              <div className="result-highlight-amount">
                <span className="amount">{fmt(result.tax)}</span>
                <span className="unit">บาท / ปี</span>
              </div>
            </div>

            <div className="result-breakdown">
              <div className="result-row">
                <span className="result-row-label">รายได้ทั้งปี</span>
                <span className="result-row-value">
                  {fmt(result.annualIncome)} บาท
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
                <span className="result-row-label">ภาษีที่ต้องชำระ</span>
                <span className="result-row-value">
                  {fmt(result.tax)} บาท
                </span>
              </div>
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
