import { blockInvalidChars, sanitizeNumericInput } from '../utils/numberInput';

function DeductionSection({ formData, onToggle, onAmountChange, onParentToggle }) {
  const handleAmountChange = (key, val) => {
    onAmountChange(key, sanitizeNumericInput(val));
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
    {
      key: 'homeLoanInterest',
      label: 'ดอกเบี้ยเงินกู้ยืมเพื่อซื้อที่อยู่อาศัย (บ้าน/คอนโด)',
      hint: [
        'ลดหย่อนได้ตามจำนวนที่จ่ายจริง สูงสุดไม่เกิน 100,000 บาท',
      ],
    },
    {
      key: 'parentAllowance',
      label: 'ค่าอุปการะเลี้ยงดูบิดามารดา',
      hint: [
        'ลดหย่อนคนละ 30,000 บาท สูงสุด 4 ท่าน (ตนเอง 2 ท่าน, คู่สมรส 2 ท่าน)',
        'เกณฑ์: อายุ 60 ปีบริบูรณ์ขึ้นไป และรายได้ทั้งปีไม่เกิน 30,000 บาท',
        'บิดามารดา 1 ท่าน ใช้สิทธิลดหย่อนได้เพียง 1 คน (ห้ามใช้ซ้ำระหว่างพี่น้อง ตามแบบ ล.ย.03)',
        'บิดามารดาคู่สมรส: ใช้สิทธิได้เฉพาะกรณีคู่สมรสไม่มีเงินได้ตลอดปีภาษี',
      ],
    },
    {
      key: 'donationEducation',
      label: 'เงินบริจาคเพื่อการศึกษา / กีฬา / รพ.รัฐ',
      hint: [
        'ลดหย่อนได้ 2 เท่าของยอดจ่ายจริง (รวมบริจาคทุกประเภทไม่เกิน 10% ของเงินได้หลังหักลดหย่อน)',
      ],
    },
    {
      key: 'donationGeneral',
      label: 'เงินบริจาคทั่วไป / สาธารณกุศล',
      hint: [
        'ลดหย่อนได้ตามจำนวนที่จ่ายจริง (รวมบริจาคทุกประเภทไม่เกิน 10% ของเงินได้หลังหักลดหย่อน)',
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
          {deductions.map(d => {
            const item = formData[d.key] || { enabled: false, amount: 0 };
            return (
              <div className="deduction-item" key={d.key}>
                <div className="deduction-header">
                  <span className="deduction-label">
                    {d.label}
                  </span>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      id={`toggle-${d.key}`}
                      checked={Boolean(item.enabled)}
                      onChange={e => onToggle(d.key, e.target.checked)}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>

                {d.key === 'parentAllowance' ? (
                  item.enabled ? (
                    <div className="parent-checkbox-container">
                      <label className="parent-check-item">
                        <input
                          type="checkbox"
                          id="check-parent-own-father"
                          checked={Boolean(item.ownFather)}
                          onChange={e => onParentToggle && onParentToggle('ownFather', e.target.checked)}
                        />
                        <span className="parent-check-text">
                          <span>บิดาของผู้มีเงินได้</span>
                          <span className="parent-check-sub">+30,000 บ.</span>
                        </span>
                      </label>

                      <label className="parent-check-item">
                        <input
                          type="checkbox"
                          id="check-parent-own-mother"
                          checked={Boolean(item.ownMother)}
                          onChange={e => onParentToggle && onParentToggle('ownMother', e.target.checked)}
                        />
                        <span className="parent-check-text">
                          <span>มารดาของผู้มีเงินได้</span>
                          <span className="parent-check-sub">+30,000 บ.</span>
                        </span>
                      </label>

                      <label className="parent-check-item">
                        <input
                          type="checkbox"
                          id="check-parent-spouse-father"
                          checked={Boolean(item.spouseFather)}
                          onChange={e => onParentToggle && onParentToggle('spouseFather', e.target.checked)}
                        />
                        <span className="parent-check-text">
                          <span>บิดาของคู่สมรส</span>
                          <span className="parent-check-sub">+30,000 บ. (คู่สมรสไม่มีเงินได้)</span>
                        </span>
                      </label>

                      <label className="parent-check-item">
                        <input
                          type="checkbox"
                          id="check-parent-spouse-mother"
                          checked={Boolean(item.spouseMother)}
                          onChange={e => onParentToggle && onParentToggle('spouseMother', e.target.checked)}
                        />
                        <span className="parent-check-text">
                          <span>มารดาของคู่สมรส</span>
                          <span className="parent-check-sub">+30,000 บ. (คู่สมรสไม่มีเงินได้)</span>
                        </span>
                      </label>

                      <div className="parent-total-badge">
                        <span>รวมลดหย่อนบิดามารดา:</span>
                        <strong>{(Number(item.amount) || 0).toLocaleString('th-TH')} บาท</strong>
                      </div>
                    </div>
                  ) : (
                    <div className="parent-disabled-preview">
                      <span>เปิดสิทธิเพื่อเลือกบิดามารดา (คนละ 30,000 บาท สูงสุด 4 ท่าน)</span>
                    </div>
                  )
                ) : (
                  <div className="input-wrapper">
                    <input
                      type="number"
                      id={`amount-${d.key}`}
                      value={item.amount === 0 ? '' : item.amount}
                      onChange={e => handleAmountChange(d.key, e.target.value)}
                      onKeyDown={blockInvalidChars}
                      disabled={!item.enabled}
                      placeholder="0"
                      min="0"
                      step="any"
                      style={{
                        opacity: item.enabled ? 1 : 0.5,
                      }}
                    />
                    <span className="input-suffix">บาท</span>
                  </div>
                )}

                {d.hint && item.enabled && (
                  <div className="deduction-hint">
                    {d.hint.map((text, idx) => (
                      <div key={idx} className="deduction-hint-item">• {text}</div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default DeductionSection;
