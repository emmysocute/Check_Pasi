import { useState, useMemo } from 'react';
import {
  Users,
  ShieldCheck,
  Home,
  HeartHandshake,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Check,
  Minus,
  Plus,
  Lock,
} from 'lucide-react';
import { blockInvalidChars, parseFormattedNumber, formatNumberWithCommas } from '../utils/numberInput';

const DEDUCTION_TABS = [
  { id: 'family', label: 'ตนเองและครอบครัว', icon: Users },
  { id: 'insuranceSavings', label: 'ประกันและการออม', icon: ShieldCheck },
  { id: 'property', label: 'ที่อยู่อาศัย', icon: Home },
  { id: 'donation', label: 'เงินบริจาค', icon: HeartHandshake },
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
      'บุตรชอบด้วยกฎหมาย (ลูกแท้ ๆ): หักลดหย่อนได้ "ไม่จำกัดจำนวนคน"',
      'บุตรคนแรก: คนละ 30,000 บาท',
      'บุตรคนที่ 2 ขึ้นไป (ที่เกิดปี 2561 เป็นต้นไป): ได้รับสิทธิเพิ่มเป็นคนละ 60,000 บาท',
      'บุตรบุญธรรม: คนละ 30,000 บาท (สูงสุดรวมกันได้ไม่เกิน 3 คน)',
      'เกณฑ์: อายุไม่เกิน 20 ปี หรืออายุไม่เกิน 25 ปีและกำลังศึกษาอยู่ระดับมหาวิทยาลัย และมีรายได้ไม่เกิน 30,000 บาท/ปี',
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
      'ประกันชีวิตทั่วไป + ประกันสุขภาพตนเอง รวมกันลดหย่อนได้สูงสุดไม่เกิน 100,000 บาท',
      'เฉพาะประกันสุขภาพตนเอง ลดหย่อนตามจริงไม่เกิน 25,000 บาท',
      'เงื่อนไข: กรมธรรม์อายุ 10 ปีขึ้นไป กับบริษัทประกันในประเทศไทย',
    ],
  },
  {
    key: 'investmentFund',
    tab: 'insuranceSavings',
    label: 'กองทุนรวมเพื่อการออม / สำรองเลี้ยงชีพ / กบข.',
    hint: [
      'SSF: ลดหย่อนได้สูงสุด 30% ของเงินได้ แต่ไม่เกิน 200,000 บาท (ถือครอง 10 ปีเต็ม)',
      'RMF: ลดหย่อนได้สูงสุด 30% ของเงินได้ แต่ไม่เกิน 500,000 บาท (ลงทุนถึงอายุ 55 ปี)',
      'กองทุนสำรองเลี้ยงชีพ / กบข. / กอช. / ประกันบำนาญ: เมื่อรวมกับกลุ่มเกษียณทั้งหมดแล้วต้องไม่เกิน 500,000 บาท',
    ],
  },

  // 3. ที่อยู่อาศัย
  {
    key: 'homeLoanInterest',
    tab: 'property',
    label: 'ดอกเบี้ยเงินกู้ยืมเพื่อซื้อหรือสร้างที่อยู่อาศัย',
    hint: [
      'หักลดหย่อนได้ตามที่จ่ายจริง สูงสุดไม่เกิน 100,000 บาท',
      'กรณีกู้ร่วม จะเฉลี่ยค่าลดหย่อนตามจำนวนผู้กู้ร่วมทุกคน',
      'ต้องมีหนังสือรับรองการชำระดอกเบี้ยจากสถาบันการเงินในไทย',
    ],
  },

  // 4. เงินบริจาค
  {
    key: 'donationEducation',
    tab: 'donation',
    label: 'เงินบริจาคเพื่อการศึกษา / กีฬา / โรงพยาบาลรัฐ (ลดหย่อนได้ 2 เท่า)',
    hint: [
      'ได้รับสิทธิหักลดหย่อน 2 เท่าของจำนวนเงินที่จ่ายจริง',
      'เพดานสิทธิ: เมื่อรวมกับเงินบริจาคทั่วไปแล้ว ต้องไม่เกิน 10% ของเงินได้หลังหักค่าใช้จ่ายและค่าลดหย่อนอื่นทั้งหมด',
      'แนะนำบริจาคผ่านระบบ e-Donation เพื่อความสะดวกในการตรวจสอบของสรรพากร',
    ],
  },
  {
    key: 'donationGeneral',
    tab: 'donation',
    label: 'เงินบริจาคทั่วไป / องค์กรสาธารณกุศล',
    hint: [
      'หักลดหย่อนได้ตามที่จ่ายจริง (1 เท่า)',
      'เพดานสิทธิ: เมื่อรวมกับเงินบริจาคเพื่อการศึกษาแล้ว ต้องไม่เกิน 10% ของเงินได้หลังหักค่าใช้จ่ายและค่าลดหย่อนอื่นทั้งหมด',
      'ต้องเป็นมูลนิธิหรือองค์กรสาธารณกุศลตามประกาศกระทรวงการคลัง',
    ],
  },
];

function DeductionSection({ 
  formData, 
  onToggle, 
  onChange, 
  onAmountChange,
  onParentToggle,
  onChildCountChange,
  parentBreakdown,
  itemizedDeductions,
  rawDonationClaim = 0,
  maxDonationCap = Infinity,
  actualDonationDeduction = 0,
}) {
  const [activeTab, setActiveTab] = useState('family');

  const handleAmountChange = onChange || onAmountChange || (() => {});

  const effectiveParentBreakdown = useMemo(() => {
    if (parentBreakdown) return parentBreakdown;
    const p = formData?.parentAllowance;
    if (!p) return { count: 0, total: 0 };
    const count = (p.ownFather ? 1 : 0) + (p.ownMother ? 1 : 0) + (p.spouseFather ? 1 : 0) + (p.spouseMother ? 1 : 0);
    return { count, total: count * 30000 };
  }, [parentBreakdown, formData?.parentAllowance]);

  const tabTotals = useMemo(() => {
    if (itemizedDeductions) {
      return {
        family: (itemizedDeductions.personal || 0) + 
                (itemizedDeductions.spouse || 0) + 
                (itemizedDeductions.child || 0) + 
                (itemizedDeductions.parentAllowance || 0),
        insuranceSavings: (itemizedDeductions.insurance || 0) + 
                          (itemizedDeductions.socialSecurity || 0) + 
                          (itemizedDeductions.investmentFund || 0),
        property: itemizedDeductions.homeLoanInterest || 0,
        donation: itemizedDeductions.donation || 0,
      };
    }

    const totals = {
      family: 0,
      insuranceSavings: 0,
      property: 0,
      donation: 0,
    };

    ALL_DEDUCTIONS.forEach((d) => {
      const item = formData[d.key];
      if (item && item.enabled) {
        if (d.key === 'parentAllowance') {
          totals.family += effectiveParentBreakdown.total;
        } else if (d.key === 'personalAllowance' || d.key === 'spouseAllowance') {
          totals.family += 60000;
        } else if (d.key === 'childAllowance') {
          const b = Number(item.countBefore2561) || 0;
          const a = Number(item.countAfter2561) || 0;
          const ad = Number(item.countAdopted) || 0;
          const computedChild = (b * 30000) + (a * 60000) + (ad * 30000);
          totals.family += computedChild || Number(item.amount) || 0;
        } else if (d.tab === 'donation') {
          // Handled via actualDonationDeduction passed from parent engine
        } else {
          totals[d.tab] += Number(item.amount) || 0;
        }
      }
    });

    totals.donation = actualDonationDeduction || 0;
    return totals;
  }, [itemizedDeductions, formData, effectiveParentBreakdown, actualDonationDeduction]);

  const filteredDeductions = useMemo(() => {
    return ALL_DEDUCTIONS.filter((d) => d.tab === activeTab);
  }, [activeTab]);

  const currentTabIndex = DEDUCTION_TABS.findIndex((t) => t.id === activeTab);
  const prevTabInfo = currentTabIndex > 0 ? DEDUCTION_TABS[currentTabIndex - 1] : null;
  const nextTabInfo = currentTabIndex < DEDUCTION_TABS.length - 1 ? DEDUCTION_TABS[currentTabIndex + 1] : null;

  return (
    <>
      <div className="section-header">
        <div className="section-number">2</div>
        <div>
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
            const TabIcon = tab.icon;
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
                <span className="deduction-tab-icon" aria-hidden="true">
                  <TabIcon size={16} strokeWidth={isSelected ? 2.2 : 1.75} />
                </span>
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
                        <CheckCircle2 size={13} />
                        <span>ได้รับสิทธิทุกคน</span>
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
                  ) : d.key === 'spouseAllowance' ? (
                    item.enabled ? (
                      <div className="statutory-amount-box">
                        <span className="statutory-amount-val">60,000</span>
                        <span className="statutory-amount-suffix">บาท (สิทธิเหมาจ่ายตามกฎหมาย ม.47(1)(ข))</span>
                      </div>
                    ) : (
                      <div className="input-wrapper disabled">
                        <span className="input-prefix" aria-hidden="true">฿</span>
                        <input
                          type="text"
                          value="0"
                          disabled
                          readOnly
                          aria-label="ลดหย่อนคู่สมรส ปิดการใช้งาน"
                        />
                        <span className="input-suffix">บาท</span>
                      </div>
                    )
                  ) : d.key === 'childAllowance' ? (
                    item.enabled ? (
                      <div className="child-stepper-container">
                        {/* 1. บุตรคนแรก / เกิดก่อนปี 2561 */}
                        <div className="child-stepper-row">
                          <div className="child-stepper-info">
                            <span className="child-stepper-title">
                              บุตรคนแรก หรือเกิดก่อนปี 2561
                            </span>
                            <span className="child-stepper-rate">
                              ลดหย่อน 30,000 บาท / คน
                            </span>
                          </div>
                          <div className="child-stepper-controls">
                            <button
                              type="button"
                              className="stepper-btn"
                              disabled={!item.countBefore2561 || item.countBefore2561 <= 0}
                              onClick={() => onChildCountChange && onChildCountChange('countBefore2561', Math.max(0, (item.countBefore2561 || 0) - 1))}
                              aria-label="ลดจำนวนบุตรคนแรกหรือเกิดก่อนปี 2561"
                            >
                              <Minus size={14} />
                            </button>
                            <div className="stepper-display">
                              <span className="stepper-value">{item.countBefore2561 || 0}</span>
                              <span className="stepper-unit">คน</span>
                            </div>
                            <button
                              type="button"
                              className="stepper-btn"
                              onClick={() => onChildCountChange && onChildCountChange('countBefore2561', (item.countBefore2561 || 0) + 1)}
                              aria-label="เพิ่มจำนวนบุตรคนแรกหรือเกิดก่อนปี 2561"
                            >
                              <Plus size={14} />
                            </button>
                            <span className="child-subtotal-badge">
                              ฿{((item.countBefore2561 || 0) * 30000).toLocaleString('th-TH')}
                            </span>
                          </div>
                        </div>

                        {/* 2. บุตรคนที่ 2 เป็นต้นไป (เกิดปี 2561 ขึ้นไป) */}
                        <div className="child-stepper-row">
                          <div className="child-stepper-info">
                            <span className="child-stepper-title">
                              บุตรคนที่ 2 เป็นต้นไป (เกิดปี 2561 ขึ้นไป)
                            </span>
                            <span className="child-stepper-rate">
                              ลดหย่อน 60,000 บาท / คน (ตาม ม.47(1)(ค))
                            </span>
                          </div>
                          <div className="child-stepper-controls">
                            <button
                              type="button"
                              className="stepper-btn"
                              disabled={!item.countAfter2561 || item.countAfter2561 <= 0}
                              onClick={() => onChildCountChange && onChildCountChange('countAfter2561', Math.max(0, (item.countAfter2561 || 0) - 1))}
                              aria-label="ลดจำนวนบุตรคนที่ 2 ขึ้นไปเกิดปี 2561 ขึ้นไป"
                            >
                              <Minus size={14} />
                            </button>
                            <div className="stepper-display">
                              <span className="stepper-value">{item.countAfter2561 || 0}</span>
                              <span className="stepper-unit">คน</span>
                            </div>
                            <button
                              type="button"
                              className="stepper-btn"
                              onClick={() => onChildCountChange && onChildCountChange('countAfter2561', (item.countAfter2561 || 0) + 1)}
                              aria-label="เพิ่มจำนวนบุตรคนที่ 2 ขึ้นไปเกิดปี 2561 ขึ้นไป"
                            >
                              <Plus size={14} />
                            </button>
                            <span className="child-subtotal-badge">
                              ฿{((item.countAfter2561 || 0) * 60000).toLocaleString('th-TH')}
                            </span>
                          </div>
                        </div>

                        {/* 3. บุตรบุญธรรม */}
                        <div className="child-stepper-row">
                          <div className="child-stepper-info">
                            <span className="child-stepper-title">
                              บุตรบุญธรรม
                            </span>
                            <span className="child-stepper-rate">
                              ลดหย่อน 30,000 บาท / คน (สูงสุดไม่เกิน 3 คน)
                            </span>
                          </div>
                          <div className="child-stepper-controls">
                            <button
                              type="button"
                              className="stepper-btn"
                              disabled={!item.countAdopted || item.countAdopted <= 0}
                              onClick={() => onChildCountChange && onChildCountChange('countAdopted', Math.max(0, (item.countAdopted || 0) - 1))}
                              aria-label="ลดจำนวนบุตรบุญธรรม"
                            >
                              <Minus size={14} />
                            </button>
                            <div className="stepper-display">
                              <span className="stepper-value">{item.countAdopted || 0}</span>
                              <span className="stepper-unit">คน</span>
                            </div>
                            <button
                              type="button"
                              className="stepper-btn"
                              disabled={(item.countAdopted || 0) >= Math.max(0, 3 - ((item.countBefore2561 || 0) + (item.countAfter2561 || 0)))}
                              onClick={() => onChildCountChange && onChildCountChange('countAdopted', (item.countAdopted || 0) + 1)}
                              aria-label="เพิ่มจำนวนบุตรบุญธรรม"
                            >
                              <Plus size={14} />
                            </button>
                            <span className="child-subtotal-badge">
                              ฿{((item.countAdopted || 0) * 30000).toLocaleString('th-TH')}
                            </span>
                          </div>
                        </div>

                        {((item.countBefore2561 || 0) + (item.countAfter2561 || 0)) >= 3 && (
                          <div className="child-warning-note">
                            ⚠️ มีบุตรชอบด้วยกฎหมายตั้งแต่ 3 คนขึ้นไปแล้ว จึงไม่สามารถนำบุตรบุญธรรมมาใช้สิทธิลดหย่อนได้ตามประมวลรัษฎากร
                          </div>
                        )}

                        {/* Read-only summary card */}
                        <div className="child-summary-card">
                          <div className="child-summary-left">
                            <div className="child-summary-label">
                              <Lock size={13} />
                              <span>ยอดรวมลดหย่อนบุตร (คำนวณอัตโนมัติ)</span>
                            </div>
                            <div className="child-summary-details">
                              รวม {((item.countBefore2561 || 0) + (item.countAfter2561 || 0) + (item.countAdopted || 0))} คน 
                              (บุตรชอบด้วยกฎหมาย {((item.countBefore2561 || 0) + (item.countAfter2561 || 0))} คน, บุตรบุญธรรม {item.countAdopted || 0} คน)
                            </div>
                          </div>
                          <div className="child-summary-amount">
                            ฿{(((item.countBefore2561 || 0) * 30000) + ((item.countAfter2561 || 0) * 60000) + ((item.countAdopted || 0) * 30000)).toLocaleString('th-TH')} บาท
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="input-wrapper disabled">
                        <span className="input-prefix" aria-hidden="true">฿</span>
                        <input
                          type="text"
                          value="0"
                          disabled
                          readOnly
                          aria-label="ลดหย่อนบุตร ปิดการใช้งาน"
                        />
                        <span className="input-suffix">บาท</span>
                      </div>
                    )
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
                            <span className="parent-check-sub">+30,000 บ.</span>
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
                            <span className="parent-check-sub">+30,000 บ.</span>
                          </span>
                        </label>
                      </div>
                    ) : (
                      <div className="input-wrapper disabled">
                        <input
                          type="text"
                          value="0"
                          disabled
                          readOnly
                          aria-label="ค่าอุปการะเลี้ยงดูบิดามารดา ปิดการใช้งาน"
                        />
                        <span className="input-suffix">บาท</span>
                      </div>
                    )
                  ) : (
                    <>
                      <div className={`input-wrapper ${!item.enabled ? 'disabled' : ''}`}>
                        <span className="input-prefix" aria-hidden="true">฿</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          id={`input-${d.key}`}
                          value={formatNumberWithCommas(item.amount)}
                          onChange={(e) => handleAmountChange(d.key, parseFormattedNumber(e.target.value))}
                          onKeyDown={blockInvalidChars}
                          disabled={!item.enabled}
                          placeholder="0"
                          autoComplete="off"
                          aria-label={`จำนวนเงิน ${d.label}`}
                        />
                        <span className="input-suffix">บาท</span>
                      </div>

                      {d.key === 'socialSecurity' && item.enabled && Number(item.amount) > 9000 && (
                        <div className="statutory-cap-pill">
                          💡 <strong>จำกัดตามกฎหมาย:</strong> ผู้ประกันตน ม.33 หักได้สูงสุดไม่เกิน 9,000 บาท/ปี (ระบบใช้สิทธิ 9,000 บ. ในการคำนวณ)
                        </div>
                      )}
                      {d.key === 'insurance' && item.enabled && Number(item.amount) > 100000 && (
                        <div className="statutory-cap-pill">
                          💡 <strong>จำกัดตามกฎหมาย:</strong> เบี้ยประกันชีวิตและสุขภาพตนเองหักได้สูงสุดไม่เกิน 100,000 บาท (ระบบใช้สิทธิ 100,000 บ. ในการคำนวณ)
                        </div>
                      )}
                      {d.key === 'homeLoanInterest' && item.enabled && Number(item.amount) > 100000 && (
                        <div className="statutory-cap-pill">
                          💡 <strong>จำกัดตามกฎหมาย:</strong> ดอกเบี้ยเงินกู้ยืมเพื่อที่อยู่อาศัยหักได้สูงสุดไม่เกิน 100,000 บาท (ระบบใช้สิทธิ 100,000 บ. ในการคำนวณ)
                        </div>
                      )}
                      {d.key === 'investmentFund' && item.enabled && Number(item.amount) > 500000 && (
                        <div className="statutory-cap-pill">
                          💡 <strong>จำกัดตามกฎหมาย:</strong> กองทุนเกษียณรวมกันหักได้สูงสุดไม่เกิน 500,000 บาท (ระบบใช้สิทธิ 500,000 บ. ในการคำนวณ)
                        </div>
                      )}
                    </>
                  )}

                  {isParentItem && item.enabled && effectiveParentBreakdown.count > 0 && (
                    <div className="parent-summary-bar">
                      <span>รวมสิทธิบิดามารดา ({effectiveParentBreakdown.count} ท่าน):</span>
                      <strong>{effectiveParentBreakdown.total.toLocaleString('th-TH')} บาท</strong>
                    </div>
                  )}

                  {d.hint && (
                    <div className="deduction-hints">
                      {d.hint.map((h, i) => (
                        <div key={i} className="hint-line">
                          <span className="hint-bullet">•</span>
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Donation Ceiling Callout inside donation tab */}
            {activeTab === 'donation' && (
              <div className="donation-status-card">
                <div className="donation-status-header">
                  <div className="donation-cap-label">
                    <span>เพดานบริจาคสูงสุด 10% ของเงินได้สุทธิขั้นต้น:</span>
                    <strong>{maxDonationCap === Infinity ? 'รอการคำนวณ' : `${Number(maxDonationCap).toLocaleString('th-TH')} บาท`}</strong>
                  </div>
                  <div className="donation-actual-label">
                    <span>ยอดหักลดหย่อนที่ใช้ได้จริง:</span>
                    <strong className="text-emerald">{Number(actualDonationDeduction).toLocaleString('th-TH')} บาท</strong>
                  </div>
                </div>
                <div className="donation-status-note">
                  คำนวณจากเพดานไม่เกิน 10% ของเงินได้พึงประเมินหลังหักค่าใช้จ่ายและค่าลดหย่อนอื่นทั้งหมด
                </div>

                {maxDonationCap === 0 && (
                  <div className="donation-status-note" style={{ color: '#64748b', marginTop: '6px' }}>
                    💡 <em>หมายเหตุ: เพดานบริจาคจะคำนวณจาก 10% ของเงินได้สุทธิขั้นต้น หากยังไม่ได้ระบุรายได้ในส่วนที่ 1 เพดานจะเป็น 0 บาท เมื่อกรอกเงินได้แล้ว ระบบจะคำนวณสิทธิให้อัตโนมัติ</em>
                  </div>
                )}

                {rawDonationClaim > maxDonationCap && maxDonationCap > 0 && (
                  <div className="donation-ceiling-warning" id="donation-cap-warning">
                    <AlertCircle size={16} className="warning-icon" />
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
                    <AlertCircle size={16} className="warning-icon" />
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
            {prevTabInfo ? (
              <button
                type="button"
                className="btn btn-outline btn-prev-tab"
                onClick={() => setActiveTab(prevTabInfo.id)}
              >
                <ArrowLeft size={15} className="prev-arrow" aria-hidden="true" />
                <span>ย้อนกลับ: หมวด{prevTabInfo.label}</span>
              </button>
            ) : (
              <div />
            )}

            {nextTabInfo ? (
              <button
                type="button"
                className="btn btn-secondary btn-next-tab"
                onClick={() => setActiveTab(nextTabInfo.id)}
              >
                <span>ถัดไป: หมวด{nextTabInfo.label}</span>
                <ArrowRight size={15} className="next-arrow" aria-hidden="true" />
              </button>
            ) : (
              <div className="deduction-tab-completed-note">
                <Check size={16} className="text-emerald" />
                <span>ตรวจสอบครบทั้ง 4 หมวดแล้ว ดูสรุปผลภาษีที่การ์ดทางขวามือได้เลย</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default DeductionSection;
