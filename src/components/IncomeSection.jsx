function IncomeSection({ monthlyIncome, freelanceIncome, onIncomeChange, onFreelanceChange }) {
  const blockInvalidChars = (e) => {
    if (['-', '+', 'e', 'E'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleIncomeChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      onIncomeChange(0);
      return;
    }
    const num = Math.max(0, Math.min(Number(val) || 0, 999999999));
    onIncomeChange(num);
  };

  const handleFreelanceChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      onFreelanceChange(0);
      return;
    }
    const num = Math.max(0, Math.min(Number(val) || 0, 999999999));
    onFreelanceChange(num);
  };

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
              รายได้ต่อเดือน
            </label>
            <div className="input-wrapper">
              <span className="input-prefix">฿</span>
              <input
                type="number"
                id="monthly-income"
                value={monthlyIncome === 0 ? '' : monthlyIncome}
                onChange={handleIncomeChange}
                onKeyDown={blockInvalidChars}
                placeholder="0"
                min="0"
                step="any"
              />
              <span className="input-suffix">บาท</span>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">
              รายได้ (ฟรีแลนซ์/อื่นๆ)
            </label>
            <div className="input-wrapper">
              <span className="input-prefix">฿</span>
              <input
                type="number"
                id="freelance-income"
                value={freelanceIncome === 0 ? '' : freelanceIncome}
                onChange={handleFreelanceChange}
                onKeyDown={blockInvalidChars}
                placeholder="0"
                min="0"
                step="any"
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
