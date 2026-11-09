import { useEffect } from 'react';
import {
  FileSpreadsheet,
  Printer,
  X,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

/**
 * ภ.ง.ด. 90/91 Pre-Filing Cheat Sheet Modal & Clean Print Sheet
 * Maps calculated parameters to official Revenue Department statutory tax forms.
 */
function PreFilingSheetModal({ result, onClose }) {
  const fmt = (n) => (n ?? 0).toLocaleString('th-TH');

  // Handle keyboard ESC to dismiss
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!result) return null;

  const isPnd91Only = (result.freelanceIncome || 0) === 0;
  const formType = isPnd91Only ? 'ภ.ง.ด. 91 (เฉพาะเงินเดือน 40(1))' : 'ภ.ง.ด. 90 (เงินเดือนและรายได้อื่น 40(1)-(8))';

  const handlePrint = () => {
    window.print();
  };

  const remainingAfterExpense = Math.max(0, (result.sumIncome || 0) - (result.expenseDeduction || 0));

  return (
    <div className="prefiling-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="prefiling-modal-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="prefiling-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Toolbar (hidden during print) */}
        <div className="prefiling-toolbar no-print">
          <div className="prefiling-toolbar-title">
            <FileSpreadsheet size={18} className="text-emerald" />
            <span>ใบสรุปเตรียมยื่นแบบ ภ.ง.ด. 90/91 (Cheat Sheet)</span>
          </div>
          <div className="prefiling-toolbar-actions">
            <button
              type="button"
              className="btn btn-primary btn-sm prefiling-print-btn"
              onClick={handlePrint}
            >
              <Printer size={15} />
              <span>พิมพ์ / บันทึก PDF (A4)</span>
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={onClose}
              aria-label="ปิดหน้าต่าง"
            >
              <X size={15} />
              <span>ปิด</span>
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="prefiling-sheet-content">
          {/* Header */}
          <header className="prefiling-header">
            <div className="prefiling-brand">
              <span className="prefiling-brand-badge">
                <ShieldCheck size={13} />
                <span>TaxMe — แผ่นเตรียมยื่นภาษี</span>
              </span>
              <h2 id="prefiling-modal-title" className="prefiling-title">
                สรุปข้อมูลเตรียมยื่นแบบภาษีเงินได้บุคคลธรรมดา
              </h2>
              <p className="prefiling-subtitle">
                แบบแสดงรายการ: <strong>{formType}</strong> | ปีภาษี <strong>2569</strong> (ยื่นแบบ ม.ค. - 8 เม.ย. 2570 ผ่าน rd.go.th)
              </p>
            </div>
            <div className="prefiling-header-stamp">
              <div className="stamp-box">
                <span className="stamp-label">สถานะการชำระ</span>
                <span className={`stamp-value ${result.status}`}>
                  {result.status === 'refund' ? 'ขอคืนภาษี' : result.status === 'payable' ? 'ชำระเพิ่มเติม' : 'ไม่ต้องชำระเพิ่ม'}
                </span>
              </div>
            </div>
          </header>

          <div className="prefiling-grid">
            {/* ตอนที่ 1: รายได้และค่าใช้จ่าย */}
            <section className="prefiling-section" aria-labelledby="section-income-title">
              <div className="prefiling-section-header">
                <span className="prefiling-part-badge">ตอนที่ 1</span>
                <h3 id="section-income-title">รายการเงินได้พึงประเมินและค่าใช้จ่าย</h3>
              </div>
              <table className="prefiling-table">
                <tbody>
                  <tr>
                    <td className="field-name">
                      <span className="rd-box-tag">ช่อง 40(1)</span> เงินเดือน ค่าจ้าง โบนัส (ทั้งปี)
                    </td>
                    <td className="field-value">{fmt(result.annualSalary)} บาท</td>
                  </tr>
                  <tr>
                    <td className="field-name">
                      <span className="rd-box-tag">ช่อง 40(2)</span> ค่าจ้างฟรีแลนซ์ / รับทำงานให้ (ทั้งปี)
                    </td>
                    <td className="field-value">{fmt(result.freelanceIncome)} บาท</td>
                  </tr>
                  <tr className="subtotal-row">
                    <td className="field-name">รวมเงินได้พึงประเมินทั้งสิ้น</td>
                    <td className="field-value">{fmt(result.sumIncome)} บาท</td>
                  </tr>
                  <tr>
                    <td className="field-name">
                      <span className="rd-box-tag">ม.42 ทวิ</span> หักค่าใช้จ่ายมาตรฐาน (50% ไม่เกิน 100,000 บ.)
                    </td>
                    <td className="field-value negative">- {fmt(result.expenseDeduction)} บาท</td>
                  </tr>
                  <tr className="balance-row">
                    <td className="field-name">เงินได้คงเหลือหลังหักค่าใช้จ่าย</td>
                    <td className="field-value">{fmt(remainingAfterExpense)} บาท</td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* ตอนที่ 2: ค่าลดหย่อน 4 หมวดสรรพากร */}
            <section className="prefiling-section" aria-labelledby="section-deductions-title">
              <div className="prefiling-section-header">
                <span className="prefiling-part-badge">ตอนที่ 2</span>
                <h3 id="section-deductions-title">รายการหักลดหย่อนภาษี 4 หมวด (ภ.ง.ด. 90/91)</h3>
              </div>
              <table className="prefiling-table">
                <tbody>
                  {/* หมวด 1 */}
                  <tr className="group-header-row">
                    <td colSpan="2">หมวด 1: ตนเองและครอบครัว</td>
                  </tr>
                  <tr>
                    <td className="field-name indent">
                      <span className="rd-box-tag">ม.47(1)(ก)</span> ผู้มีเงินได้ (ส่วนบุคคล ได้รับอัตโนมัติทุกคน)
                    </td>
                    <td className="field-value">{fmt(result.itemizedDeductions?.personal || 60000)} บาท</td>
                  </tr>
                  {(result.itemizedDeductions?.spouse || 0) > 0 && (
                    <tr>
                      <td className="field-name indent">
                        <span className="rd-box-tag">ม.47(1)(ข)</span> คู่สมรส (ไม่มีเงินได้)
                      </td>
                      <td className="field-value">{fmt(result.itemizedDeductions.spouse)} บาท</td>
                    </tr>
                  )}
                  {(result.itemizedDeductions?.child || 0) > 0 && (
                    <tr>
                      <td className="field-name indent">
                        <span className="rd-box-tag">ม.47(1)(ค)</span> ค่าลดหย่อนบุตร
                      </td>
                      <td className="field-value">{fmt(result.itemizedDeductions.child)} บาท</td>
                    </tr>
                  )}
                  {(result.itemizedDeductions?.parentAllowance || 0) > 0 && (
                    <tr>
                      <td className="field-name indent">
                        <span className="rd-box-tag">ม.47(1)(ช)</span> ค่าอุปการะเลี้ยงดูบิดามารดา
                      </td>
                      <td className="field-value">{fmt(result.itemizedDeductions.parentAllowance)} บาท</td>
                    </tr>
                  )}

                  {/* หมวด 2 */}
                  <tr className="group-header-row">
                    <td colSpan="2">หมวด 2: ประกันและการออม</td>
                  </tr>
                  <tr>
                    <td className="field-name indent">เบี้ยประกันชีวิตและสุขภาพ (เพดาน 100,000 บ.)</td>
                    <td className="field-value">{fmt(result.itemizedDeductions?.insurance || 0)} บาท</td>
                  </tr>
                  <tr>
                    <td className="field-name indent">เงินสมทบกองทุนประกันสังคม (เพดาน 9,000 บ.)</td>
                    <td className="field-value">{fmt(result.itemizedDeductions?.socialSecurity || 0)} บาท</td>
                  </tr>
                  <tr>
                    <td className="field-name indent">กองทุนรวมเพื่อการออม / RMF / กองทุนสำรองเลี้ยงชีพ</td>
                    <td className="field-value">{fmt(result.itemizedDeductions?.investmentFund || 0)} บาท</td>
                  </tr>

                  {/* หมวด 3 */}
                  <tr className="group-header-row">
                    <td colSpan="2">หมวด 3: ที่อยู่อาศัย</td>
                  </tr>
                  <tr>
                    <td className="field-name indent">ดอกเบี้ยเงินกู้ยืมเพื่อซื้อหรือสร้างที่อยู่อาศัย</td>
                    <td className="field-value">{fmt(result.itemizedDeductions?.homeLoanInterest || 0)} บาท</td>
                  </tr>

                  {/* หมวด 4 */}
                  <tr className="group-header-row">
                    <td colSpan="2">หมวด 4: เงินบริจาค</td>
                  </tr>
                  <tr>
                    <td className="field-name indent">เงินบริจาคเพื่อการศึกษา/กีฬา (2 เท่า) และเงินบริจาคทั่วไป</td>
                    <td className="field-value">{fmt(result.itemizedDeductions?.donation || 0)} บาท</td>
                  </tr>

                  <tr className="subtotal-row">
                    <td className="field-name">รวมค่าลดหย่อนภาษีทั้งสิ้น</td>
                    <td className="field-value negative">- {fmt(result.totalDeduction)} บาท</td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* ตอนที่ 3: สรุปยอดภาษีสุทธิและเครดิตภาษี */}
            <section className="prefiling-section highlight-box" aria-labelledby="section-summary-title">
              <div className="prefiling-section-header">
                <span className="prefiling-part-badge">ตอนที่ 3</span>
                <h3 id="section-summary-title">การคำนวณภาษีสุทธิและภาษีหัก ณ ที่จ่าย</h3>
              </div>
              <table className="prefiling-table">
                <tbody>
                  <tr>
                    <td className="field-name bold">เงินได้สุทธิ (Net Taxable Income)</td>
                    <td className="field-value bold">{fmt(result.netIncome)} บาท</td>
                  </tr>
                  <tr>
                    <td className="field-name">
                      ภาษีที่คำนวณได้ทั้งปี ({result.taxMethod === 'flat_rate' ? 'วิธีเหมา 0.5%' : `อัตราก้าวหน้า ฐานสูงสุด ${Math.round((result.marginalRate || 0) * 100)}%`})
                    </td>
                    <td className="field-value">{fmt(result.finalTax)} บาท</td>
                  </tr>
                  <tr>
                    <td className="field-name">
                      <span className="rd-box-tag">ใบ 50 ทวิ</span> หัก ภาษีเงินได้หัก ณ ที่จ่ายสะสม
                    </td>
                    <td className="field-value negative">- {fmt(result.withholdingTax)} บาท</td>
                  </tr>
                  <tr className={`final-summary-row ${result.status}`}>
                    <td className="field-name summary-title">
                      {result.status === 'refund' ? (
                        <span className="summary-status-tag">
                          <Sparkles size={14} />
                          <span>ภาษีที่ชำระไว้เกิน (ยอดเงินคืนที่ได้รับจากสรรพากร)</span>
                        </span>
                      ) : result.status === 'payable' ? (
                        <span className="summary-status-tag">
                          <AlertCircle size={14} />
                          <span>ยอดภาษีที่ต้องชำระเพิ่มเติม</span>
                        </span>
                      ) : (
                        <span className="summary-status-tag">
                          <CheckCircle2 size={14} />
                          <span>ยอดภาษีสุทธิพอดี (ไม่ต้องชำระเพิ่ม)</span>
                        </span>
                      )}
                    </td>
                    <td className="field-value summary-amount">
                      {result.status === 'refund'
                        ? `+ ${fmt(result.refundAmount)} บาท`
                        : result.status === 'payable'
                        ? `${fmt(result.payableAmount)} บาท`
                        : '0 บาท'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>
          </div>

          {/* Footer Legal & Instructions */}
          <footer className="prefiling-footer">
            <div className="prefiling-tip">
              <strong>คำแนะนำในการยื่นแบบ:</strong> ล็อกอินเข้าสู่ระบบ{' '}
              <a href="https://efiling.rd.go.th" target="_blank" rel="noopener noreferrer">
                efiling.rd.go.th
                <ExternalLink size={12} className="inline-ext-icon" />
              </a>{' '}
              ด้วย Digital ID หรือเลขประจำตัวประชาชน และนำตัวเลขแต่ละช่องที่สรุปไว้ในเอกสารนี้ไปกรอกตามหมวด จะช่วยให้ยื่นแบบได้รวดเร็ว แม่นยำ และไม่ตกหล่น
            </div>
            <div className="prefiling-print-meta">
              <span>จัดทำโดยระบบ TaxMe | วันที่พิมพ์: {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default PreFilingSheetModal;
