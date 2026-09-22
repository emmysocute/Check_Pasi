function IncomeSection({ monthlyIncome, freelanceIncome, employmentType, onIncomeChange, onFreelanceChange, onTypeChange }) {
  return (
    <>
      <div className="section-header">
        <div className="section-number">1</div>
        <h3 className="section-title">ข้อมูลรายได้</h3>
      </div>
      <div className="section-body">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              รายได้ต่อเดือน ()
            </label>
            <div className="input-wrapper">
              <span className="input-prefix">฿</span>
              <input
                type=""
                id="monthly-income"
                value={monthlyIncome}
                onChange={e => onIncomeChange(Number(e.target.value) || 0)}
                placeholder="0"
                min="0"
              />
              <span className="input-suffix">บาท</span>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">
              รายได้(ฟรีแลนซ์/อื่นๆ)
            </label>
            <div className="input-wrapper">
              <span className="input-prefix">฿</span>
              <input
                type=""
                id="freelance-income"
                value={freelanceIncome}
                onChange={e => onFreelanceChange(Number(e.target.value) || 0)}
                placeholder="0"
                min="0"
              />
              <span className="input-suffix">บาท</span>
            </div>
          </div>
        </div>
        <div className="info-note">
          <span>หมายเหตุ: รายได้ต่อเดือนจะถูกคำนวณเป็นรายปี (x12 เดือน)</span>
        </div>
      </div>
    </>
  )
}

export default IncomeSection
