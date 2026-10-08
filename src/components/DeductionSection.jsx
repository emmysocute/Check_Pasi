function DeductionSection({ formData, onToggle, onAmountChange }) {
  const blockInvalidChars = (e) => {
    if (['-', '+', 'e', 'E'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleAmountChange = (key, val) => {
    if (val === '') {
      onAmountChange(key, 0);
      return;
    }
    const num = Math.max(0, Math.min(Number(val) || 0, 999999999));
    onAmountChange(key, num);
  };

  const deductions = [
    {
      key: 'personalAllowance',
      label: 'ผู้มีเงินได้ (ส่วนตัว)',
    },
    {
      key: 'spouseAllowance',
      label: 'คู่สมรส',
    },
    {
      key: 'childAllowance',
      label: 'บุตร',
      hint: [
        'บุตรคนแรก / บุตรบุญธรรม: คนละ 30,000 บาท (บุตรบุญธรรมไม่เกิน 3 คน)',
        'บุตรคนที่ 2 ขึ้นไป (เกิดปี 2561 เป็นต้นไป): คนละ 60,000 บาท',
      ],
    },
    {
      key: 'insurance',
      label: 'ประกันชีวิต / ประกันสุขภาพ',
      hint: [
        'ประกันชีวิตทั่วไป + สุขภาพตนเอง: รวมกันลดหย่อนได้ตามจริงไม่เกิน 100,000 บาท',
        '(ประกันสุขภาพตนเอง หักได้ไม่เกิน 25,000 บาท)',
      ],
    },
    {
      key: 'socialSecurity',
      label: 'ประกันสังคม',
      hint: [
        'ผู้ประกันตน ม.33: หักตามจริงสูงสุดไม่เกิน 9,000 บาท/ปี',
      ],
    },
    {
      key: 'investmentFund',
      label: 'กองทุนสำรองเลี้ยงชีพ / RMF',
      hint: [
        'ลดหย่อนได้สูงสุดไม่เกิน 30% ของเงินได้พึงประเมิน และไม่เกิน 500,000 บาท',
      ],
    },
  ];

  return (
    <>
      <div className="section-header">
        <div className="section-number">2</div>
        <h3 className="section-title">รายการลดหย่อน (ถ้ามี)</h3>
      </div>
      <div className="section-body">
        <div className="deduction-grid">
          {deductions.map(d => (
            <div className="deduction-item" key={d.key}>
              <div className="deduction-header">
                <span className="deduction-label">
                  {d.label}
                </span>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    id={`toggle-${d.key}`}
                    checked={formData[d.key].enabled}
                    onChange={e => onToggle(d.key, e.target.checked)}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>
              <div className="input-wrapper">
                <input
                  type="number"
                  id={`amount-${d.key}`}
                  value={formData[d.key].amount === 0 ? '' : formData[d.key].amount}
                  onChange={e => handleAmountChange(d.key, e.target.value)}
                  onKeyDown={blockInvalidChars}
                  disabled={!formData[d.key].enabled}
                  placeholder="0"
                  min="0"
                  step="any"
                  style={{
                    opacity: formData[d.key].enabled ? 1 : 0.5,
                  }}
                />
                <span className="input-suffix">บาท</span>
              </div>
              {d.hint && formData[d.key].enabled && (
                <div className="deduction-hint">
                  {d.hint.map((text, idx) => (
                    <div key={idx} className="deduction-hint-item">• {text}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default DeductionSection
