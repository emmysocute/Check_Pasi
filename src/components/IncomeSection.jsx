function IncomeSection({ 
  monthlyIncome, 
  freelanceIncome, 
  withholdingTax = 0,
  onIncomeChange, 
  onFreelanceChange,
  onWithholdingChange 
}) {
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

  const handleWithholdingChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      onWithholdingChange(0);
      return;
    }
    const num = Math.max(0, Math.min(Number(val) || 0, 999999999));
    onWithholdingChange(num);
  };

  const formatPreview = (num) => {
    if (!num || num <= 0) return null;
    return `(${Number(num).toLocaleString('th-TH')} บาท)`;
  };

  return (
    <>
      <div className="section-header">
        <div className="section-number">1</div>
        <h3 className="section-title">ข้อมูลรายได้ & ภาษีหัก ณ ที่จ่าย</h3>
      </div>
      <div className="section-body">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              รายได้ต่อเดือน {formatPreview(monthlyIncome) && <span style={{ fontSize: '11px', color: 'var(--primary-600)', fontWeight: 500 }}>{formatPreview(monthlyIncome)}</span>}
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
              รายได้ (ฟรีแลนซ์/อื่นๆ) {formatPreview(freelanceIncome) && <span style={{ fontSize: '11px', color: 'var(--primary-600)', fontWeight: 500 }}>{formatPreview(freelanceIncome)}</span>}
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

        <div className="form-row" style={{ marginTop: '12px' }}>
          <div className="form-group" style={{ width: '100%' }}>
            <label className="form-label">
              ภาษีหัก ณ ที่จ่ายสะสม (ถ้ามี) {formatPreview(withholdingTax) && <span style={{ fontSize: '11px', color: 'var(--primary-600)', fontWeight: 500 }}>{formatPreview(withholdingTax)}</span>}
            </label>
            <div className="input-wrapper">
              <span className="input-prefix">฿</span>
              <input
                type="number"
                id="withholding-tax"
                value={withholdingTax === 0 ? '' : withholdingTax}
                onChange={handleWithholdingChange}
                onKeyDown={blockInvalidChars}
                placeholder="0"
                min="0"
                step="any"
              />
              <span className="input-suffix">บาท</span>
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--gray-500)', marginTop: '4px' }}>
              ℹ️ ภาษีที่ถูกหักไว้ล่วงหน้าระหว่างปี เช่น ตามหนังสือรับรองการหักภาษี ณ ที่จ่าย (ใบ 50 ทวิ)
            </div>
          </div>
        </div>

        <div className="info-note">
          <span>หมายเหตุ: รายได้ต่อเดือนจะถูกคำนวณเป็นรายปี (x12 เดือน)</span>
        </div>
      </div>
    </>
  );
}

export default IncomeSection
