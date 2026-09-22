function DeductionSection({ formData, onToggle, onAmountChange }) {
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
    },
    {
      key: 'insurance',
      label: 'ประกันชีวิต / ประกันสุขภาพ',
    },
    {
      key: 'socialSecurity',
      label: 'ประกันสังคม',
    },
    {
      key: 'investmentFund',
      label: 'กองทุนสำรองเลี้ยงชีพ / RMF / SSF',
    },

  ]

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
                  type=""
                  id={`amount-${d.key}`}
                  value={formData[d.key].amount}
                  onChange={e => onAmountChange(d.key, Number(e.target.value) || 0)}
                  disabled={!formData[d.key].enabled}
                  placeholder="0"
                  min="0"
                  style={{
                    opacity: formData[d.key].enabled ? 1 : 0.5,
                  }}
                />
                <span className="input-suffix">บาท</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default DeductionSection
