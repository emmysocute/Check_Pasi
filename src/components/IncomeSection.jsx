import { Info } from 'lucide-react';
import { blockInvalidChars, parseFormattedNumber, formatNumberWithCommas } from '../utils/numberInput';

function IncomeSection({ 
  monthlyIncome, 
  freelanceIncome, 
  withholdingTax = 0,
  onIncomeChange, 
  onFreelanceChange,
  onWithholdingChange 
}) {
  const handleIncomeChange = (e) => {
    onIncomeChange(parseFormattedNumber(e.target.value));
  };

  const handleFreelanceChange = (e) => {
    onFreelanceChange(parseFormattedNumber(e.target.value));
  };

  const handleWithholdingChange = (e) => {
    onWithholdingChange(parseFormattedNumber(e.target.value));
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
            <label className="form-label" htmlFor="monthly-income">
              รายได้ต่อเดือน (เงินเดือนประจำ)
            </label>
            <div className="input-wrapper">
              <span className="input-prefix" aria-hidden="true">฿</span>
              <input
                type="text"
                inputMode="numeric"
                id="monthly-income"
                value={formatNumberWithCommas(monthlyIncome)}
                onChange={handleIncomeChange}
                onKeyDown={blockInvalidChars}
                placeholder="0"
                autoComplete="off"
              />
              <span className="input-suffix">บาท</span>
            </div>
            <div className="input-hint-text">
              สำหรับเงินเดือนประจำ (ระบบจะนำไปคำนวณ x12 เดือนให้อัตโนมัติ)
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="freelance-income">
              รายได้ทั้งปี (ฟรีแลนซ์ / ยอดสะสมรายเดือน)
            </label>
            <div className="input-wrapper">
              <span className="input-prefix" aria-hidden="true">฿</span>
              <input
                type="text"
                inputMode="numeric"
                id="freelance-income"
                value={formatNumberWithCommas(freelanceIncome)}
                onChange={handleFreelanceChange}
                onKeyDown={blockInvalidChars}
                placeholder="0"
                autoComplete="off"
              />
              <span className="input-suffix">บาท</span>
            </div>
            <div className="input-hint-text">
              ยอดรวมทั้งปี (ไม่ต้องคูณ 12) เช่น รายได้ฟรีแลนซ์ หรือยอดจากระบบบันทึกรายเดือน
            </div>
          </div>
        </div>

        <div className="form-row" style={{ marginTop: '14px' }}>
          <div className="form-group" style={{ width: '100%' }}>
            <label className="form-label" htmlFor="withholding-tax">
              ภาษีหัก ณ ที่จ่ายสะสม (ถ้ามี)
            </label>
            <div className="input-wrapper">
              <span className="input-prefix" aria-hidden="true">฿</span>
              <input
                type="text"
                inputMode="numeric"
                id="withholding-tax"
                value={formatNumberWithCommas(withholdingTax)}
                onChange={handleWithholdingChange}
                onKeyDown={blockInvalidChars}
                placeholder="0"
                autoComplete="off"
              />
              <span className="input-suffix">บาท</span>
            </div>
            <div className="input-hint-text">
              <Info size={13} className="inline-hint-icon" />
              <span>ภาษีที่ถูกหักไว้ล่วงหน้าระหว่างปี เช่น ตามหนังสือรับรองการหักภาษี ณ ที่จ่าย (ใบ 50 ทวิ)</span>
            </div>
          </div>
        </div>

        <div className="info-note">
          <span>หมายเหตุ: รายได้ต่อเดือนจะถูกคำนวณเป็นรายปี (x12 เดือน) รวมกับรายได้ทั้งปี/ฟรีแลนซ์</span>
        </div>
      </div>
    </>
  );
}

export default IncomeSection;
