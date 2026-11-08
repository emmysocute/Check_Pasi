import { useState, useMemo } from 'react';
import { blockInvalidChars, parseFormattedNumber, formatNumberWithCommas } from '../utils/numberInput';

const DEDUCTION_TABS = [
  { id: 'family', label: 'ตนเองและครอบครัว', icon: '👤' },
  { id: 'insuranceSavings', label: 'ประกันและการออม', icon: '🛡️' },
  { id: 'property', label: 'ที่อยู่อาศัย', icon: '🏠' },
  { id: 'donation', label: 'เงินบริจาค', icon: '🎗️' },
];

const ALL_DEDUCTIONS = [
  // 1. ตนเองและครอบครัว
  {
    key: 'personalAllowance',
    tab: 'family',
    label: 'ค่าลดหย่อนส่วนบุคคล (ผู้มีเงินได้)',
    hint: [
      'สิทธิลดหย่อนพื้นฐานสำหรับคนไทยทุกคนที่มีเงินได้ ตามประมวลรัษฎากร ม.47(1)(ก)',
      'ระบบจะนำยอด 60,000 บาทนี้ ไปหักลบออกจากรายได้ทั้งปีของคุณเพื่อลดภาษีโดยอัตโนมัติ',
    ],
  },
  {
    key: 'spouseAllowance',
    tab: 'family',
    label: 'คู่สมรส',
    hint: ['ลดหย่อนได้ 60,000 บาท (เฉพาะกรณีคู่สมรสจดทะเบียนถูกต้องตามกฎหมาย และไม่มีเงินได้ตลอดปีภาษี)'],
  },
  {
    key: 'childAllowance',
    tab: 'family',
    label: 'บุตร',
    hint: [
      'บุตรคนแรก / บุตรบุญธรรม: คนละ 30,000 บาท (บุตรบุญธรรมไม่เกิน 3 คน)',
      'บุตรคนที่ 2 ขึ้นไป (เกิดปี 2561 เป็นต้นไป): คนละ 60,000 บาท',
    ],
  },
  {
    key: 'parentAllowance',
    tab: 'family',
    label: 'ค่าอุปการะเลี้ยงดูบิดามารดา',
    hint: [
      'ลดหย่อนคนละ 30,000 บาท สูงสุด 4 ท่าน (ตนเอง 2 ท่าน, คู่สมรส 2 ท่าน)',
      'เกณฑ์: อายุ 60 ปีบริบูรณ์ขึ้นไป และรายได้ทั้งปีไม่เกิน 30,000 บาท',
      'บิดามารดา 1 ท่าน ใช้สิทธิลดหย่อนได้เพียง 1 คน (ห้ามใช้ซ้ำระหว่างพี่น้อง ตามแบบ ล.ย.03)',
      'บิดามารดาคู่สมรส: ใช้สิทธิได้เฉพาะกรณีคู่สมรสไม่มีเงินได้ตลอดปีภาษี',
    ],
  },

  // 2. ประกันและการออม
  {
    key: 'socialSecurity',
    tab: 'insuranceSavings',
    label: 'ประกันสังคม',
    hint: ['ผู้ประกันตน ม.33: หักตามจริงสูงสุดไม่เกิน 9,000 บาท/ปี'],
  },
  {
    key: 'insurance',
    tab: 'insuranceSavings',
    label: 'ประกันชีวิต / ประกันสุขภาพ',
    hint: [
      'ประกันชีวิตทั่วไป + สุขภาพตนเอง: รวมกันลดหย่อนได้ตามจริงไม่เกิน 100,000 บาท',
      '(ประกันสุขภาพตนเอง หักได้ไม่เกิน 25,000 บาท)',
    ],
  },
  {
    key: 'investmentFund',
    tab: 'insuranceSavings',
    label: 'กองทุนสำรองเลี้ยงชีพ / RMF / SSF',
    hint: [
      'ลดหย่อนได้สูงสุดไม่เกิน 30% ของเงินได้พึงประเมิน และเมื่อรวมกลุ่มเกษียณทั้งหมดไม่เกิน 500,000 บาท',
    ],
  },

  // 3. ที่อยู่อาศัย
  {
    key: 'homeLoanInterest',
    tab: 'property',
    label: 'ดอกเบี้ยเงินกู้ยืมเพื่อซื้อที่อยู่อาศัย (บ้าน/คอนโด)',
    hint: ['ลดหย่อนได้ตามจำนวนที่จ่ายจริง สูงสุดไม่เกิน 100,000 บาท'],
  },

  // 4. เงินบริจาค
  {
    key: 'donationEducation',
    tab: 'donation',
    label: 'เงินบริจาคเพื่อการศึกษา / กีฬา / รพ.รัฐ',
    hint: ['ลดหย่อนได้ 2 เท่าของยอดจ่ายจริง (รวมบริจาคทุกประเภทไม่เกิน 10% ของเงินได้หลังหักลดหย่อน)'],
  },
  {
    key: 'donationGeneral',
    tab: 'donation',
    label: 'เงินบริจาคทั่วไป / สาธารณกุศล',
    hint: ['ลดหย่อนได้ตามจำนวนที่จ่ายจริง (รวมบริจาคทุกประเภทไม่เกิน 10% ของเงินได้หลังหักลดหย่อน)'],
  },
];

function DeductionSection({
  formData,
  onToggle,
  onAmountChange,
  onParentToggle,
  maxDonationCap = 0,
  rawDonationClaim = 0,
  actualDonationDeduction = 0,
}) {
  const [activeTab, setActiveTab] = useState('family');

  const handleAmountChange = (key, val) => {
    onAmountChange(key, parseFormattedNumber(val));
  };

  // Calculate sum per tab for header badges (derived state - Good React #03)
  const tabTotals = useMemo(() => {
    const totals = {
      family: 0,
      insuranceSavings: 0,
      property: 0,
      donation: 0,
    };

    ALL_DEDUCTIONS.forEach((d) => {
      const item = formData[d.key];
      if (!item?.enabled) return;

      if (d.key === 'parentAllowance') {
        totals.family += Number(item.amount) || 0;
      } else if (d.key === 'personalAllowance' || d.key === 'spouseAllowance') {
        totals.family += Number(item.amount) || 60000;
      } else if (d.key === 'donationEducation') {
        totals.donation += (Number(item.amount) || 0) * 2;
      } else if (totals[d.tab] !== undefined) {
        totals[d.tab] += Number(item.amount) || 0;
      }
    });

    return totals;
  }, [formData]);

  const filteredDeductions = useMemo(() => {
    return ALL_DEDUCTIONS.filter((d) => d.tab === activeTab);
  }, [activeTab]);

  const nextTabInfo = useMemo(() => {
    const currentIndex = DEDUCTION_TABS.findIndex((t) => t.id === activeTab);
    if (currentIndex >= 0 && currentIndex < DEDUCTION_TABS.length - 1) {
      return DEDUCTION_TABS[currentIndex + 1];
    }
    return null;
  }, [activeTab]);

  return (
    <>
      <div className="section-header">
        <div className="section-number">2</div>
        <div style={{ flex: 1 }}>
          <h3 className="section-title">รายการลดหย่อนภาษี (4 หมวดสรรพากร)</h3>
          <p className="section-subtitle">เลือกเปิดสิทธิและกรอกตัวเลขในหมวดที่คุณมีสิทธิลดหย่อน</p>
        </div>
      </div>

      <div className="section-body">
        {/* ===== Accessible Tab Navigation ===== */}
        <div className="deduction-tabs-container" role="tablist" aria-label="หมวดหมู่ค่าลดหย่อน">
          {DEDUCTION_TABS.map((tab) => {
            const isSelected = activeTab === tab.id;
            const tabTotal = tabTotals[tab.id] || 0;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={isSelected}
                aria-controls={`tabpanel-${tab.id}`}
                className={`deduction-tab-btn ${isSelected ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="deduction-tab-icon" aria-hidden="true">{tab.icon}</span>
                <span className="deduction-tab-label">{tab.label}</span>
                <span className={`deduction-tab-badge ${tabTotal > 0 ? 'has-value' : ''}`}>
                  {tabTotal > 0 ? `฿${tabTotal.toLocaleString('th-TH')}` : '0 บ.'}
                </span>
              </button>
            );
          })}
        </div>

        {/* ===== Tab Content Panel ===== */}
        <div 
          role="tabpanel" 
          id={`tabpanel-${activeTab}`} 
          aria-labelledby={`tab-${activeTab}`}
          className="deduction-tab-panel"
        >
          <div className="deduction-grid">
            {filteredDeductions.map((d) => {
              const item = formData[d.key] || { enabled: false, amount: 0 };
              const isParentItem = d.key === 'parentAllowance';

              return (
                <div 
                  className={`deduction-item ${isParentItem ? 'parent-allowance-item' : ''}`} 
                  key={d.key}
                >
                  <div className="deduction-header">
                    <span className="deduction-label" id={`label-${d.key}`}>
                      {d.label}
                    </span>
                    {d.key === 'personalAllowance' ? (
                      <span className="statutory-badge">
                        ✓ ได้รับสิทธิทุกคน
                      </span>
                    ) : (
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          id={`toggle-${d.key}`}
                          aria-labelledby={`label-${d.key}`}
                          checked={Boolean(item.enabled)}
                          onChange={(e) => onToggle(d.key, e.target.checked)}
                        />
                        <span className="toggle-slider" />
                      </label>
                    )}
                  </div>

                  {d.key === 'personalAllowance' ? (
                    <div className="statutory-amount-box">
                      <span className="statutory-amount-val">60,000</span>
                      <span className="statutory-amount-suffix">บาท (หักลบรายได้อัตโนมัติ)</span>
                    </div>
                  ) : isParentItem ? (
                    item.enabled ? (
                      <div className="parent-checkbox-container">
                        <label className={`parent-check-item ${item.ownFather ? 'is-checked' : ''}`}>
                          <input
                            type="checkbox"
                            id="check-parent-own-father"
                            checked={Boolean(item.ownFather)}
                            onChange={(e) => onParentToggle && onParentToggle('ownFather', e.target.checked)}
                          />
                          <span className="parent-check-text">
                            <span>บิดาของผู้มีเงินได้</span>
                            <span className="parent-check-sub">+30,000 บ.</span>
                          </span>
                        </label>

                        <label className={`parent-check-item ${item.ownMother ? 'is-checked' : ''}`}>
                          <input
                            type="checkbox"
                            id="check-parent-own-mother"
                            checked={Boolean(item.ownMother)}
                            onChange={(e) => onParentToggle && onParentToggle('ownMother', e.target.checked)}
                          />
                          <span className="parent-check-text">
                            <span>มารดาของผู้มีเงินได้</span>
                            <span className="parent-check-sub">+30,000 บ.</span>
                          </span>
                        </label>

                        <label className={`parent-check-item ${item.spouseFather ? 'is-checked' : ''}`}>
                          <input
                            type="checkbox"
                            id="check-parent-spouse-father"
                            checked={Boolean(item.spouseFather)}
                            onChange={(e) => onParentToggle && onParentToggle('spouseFather', e.target.checked)}
                          />
                          <span className="parent-check-text">
                            <span>บิดาของคู่สมรส</span>
                            <span className="parent-check-sub">+30,000 บ. (คู่สมรสไม่มีเงินได้)</span>
                          </span>
                        </label>

                        <label className={`parent-check-item ${item.spouseMother ? 'is-checked' : ''}`}>
                          <input
                            type="checkbox"
                            id="check-parent-spouse-mother"
                            checked={Boolean(item.spouseMother)}
                            onChange={(e) => onParentToggle && onParentToggle('spouseMother', e.target.checked)}
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

                        {(item.spouseFather || item.spouseMother) && !formData.spouseAllowance?.enabled && (
                          <div className="parent-smart-tip">
                            💡 <strong>คำแนะนำสรรพากร:</strong> การลดหย่อนบิดามารดาคู่สมรสใช้ได้เฉพาะกรณีคู่สมรสไม่มีเงินได้ตลอดปีภาษี หากเข้าเกณฑ์นี้ คุณสามารถเปิดใช้สิทธิ <u>"ลดหย่อนคู่สมรส (60,000 บ.)"</u> ด้านบนเพิ่มเติมได้
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="parent-disabled-preview">
                        <span>เปิดสิทธิเพื่อเลือกบิดามารดา (คนละ 30,000 บาท สูงสุด 4 ท่าน)</span>
                      </div>
                    )
                  ) : (
                    <>
                      <div className="input-wrapper">
                        <input
                          type="text"
                          inputMode="numeric"
                          id={`amount-${d.key}`}
                          aria-labelledby={`label-${d.key}`}
                          value={formatNumberWithCommas(item.amount)}
                          onChange={(e) => handleAmountChange(d.key, e.target.value)}
                          onKeyDown={blockInvalidChars}
                          disabled={!item.enabled}
                          placeholder="0"
                          autoComplete="off"
                          style={{
                            opacity: item.enabled ? 1 : 0.5,
                          }}
                        />
                        <span className="input-suffix">บาท</span>
                      </div>

                      {d.key === 'donationEducation' && item.enabled && Number(item.amount) > 0 && (
                        <div className="donation-double-badge">
                          ✨ ได้รับสิทธิลดหย่อน 2 เท่า: {(Number(item.amount) * 2).toLocaleString('th-TH')} บาท
                        </div>
                      )}
                    </>
                  )}

                  {d.hint && (item.enabled || d.key === 'personalAllowance') && (
                    <div className="deduction-hint">
                      {d.hint.map((text, idx) => (
                        <div key={idx} className="deduction-hint-item">• {text}</div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Donation ceiling advice when viewing donation tab */}
            {activeTab === 'donation' && (Boolean(formData.donationEducation?.enabled) || Boolean(formData.donationGeneral?.enabled)) && (
              <div className="donation-ceiling-card" id="donation-ceiling-card">
                <div className="donation-ceiling-header">
                  <div className="donation-ceiling-title">
                    <span className="donation-ceiling-icon">ℹ️</span>
                    <span>
                      สิทธิลดหย่อนเงินบริจาครวมสูงสุดในปีนี้: 
                      <strong className="donation-ceiling-amount">
                        {' '}{Number(maxDonationCap).toLocaleString('th-TH')} บาท
                      </strong>
                    </span>
                  </div>
                  <span className="donation-ceiling-tag">ม.47(7) เพดาน 10%</span>
                </div>

                <div className="donation-ceiling-desc">
                  คำนวณจากเพดานไม่เกิน 10% ของเงินได้พึงประเมินหลังหักค่าใช้จ่ายและค่าลดหย่อนอื่นทั้งหมด
                </div>

                {rawDonationClaim > maxDonationCap && maxDonationCap > 0 && (
                  <div className="donation-ceiling-warning" id="donation-cap-warning">
                    <span className="warning-icon">⚠️</span>
                    <div>
                      <strong>ยอดบริจาคเกินสิทธิสูงสุด:</strong> คุณระบุยอดบริจาค (รวมสิทธิ 2 เท่า) จำนวน{' '}
                      {Number(rawDonationClaim).toLocaleString('th-TH')} บาท ซึ่งเกินเพดาน 10% — ระบบจะนำไปลดหย่อนภาษีให้ตามเพดานจริงที่{' '}
                      <strong>{Number(actualDonationDeduction).toLocaleString('th-TH')} บาท</strong>{' '}
                      <span className="donation-warning-note">(คุณยังสามารถกรอกตัวเลขตามใบเสร็จจริงได้ตามปกติ)</span>
                    </div>
                  </div>
                )}

                {maxDonationCap === 0 && rawDonationClaim > 0 && (
                  <div className="donation-ceiling-warning" id="donation-zero-cap-warning">
                    <span className="warning-icon">⚠️</span>
                    <div>
                      <strong>ยังไม่มีฐานคำนวณภาษี:</strong> เนื่องจากเงินได้หลังหักค่าใช้จ่ายและค่าลดหย่อนอื่นเป็น 0 บาท สิทธิลดหย่อนเงินบริจาคในปีนี้จึงเป็น 0 บาท
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ===== Tab Footer Navigation ===== */}
          <div className="deduction-tab-footer">
            {nextTabInfo ? (
              <button
                type="button"
                className="btn btn-secondary btn-next-tab"
                onClick={() => setActiveTab(nextTabInfo.id)}
              >
                <span>ถัดไป: หมวด{nextTabInfo.label}</span>
                <span className="next-arrow" aria-hidden="true">➡️</span>
              </button>
            ) : (
              <div className="deduction-tab-completed-note">
                <span>✅ ตรวจสอบครบทั้ง 4 หมวดแล้ว ดูสรุปผลภาษีที่การ์ดทางขวามือได้เลย</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default DeductionSection;
