function WelcomeBanner() {
  return (
    <div className="welcome-banner">
      <div className="welcome-text">
        <h2>คำนวณภาษีเงินได้</h2>
        <p>
          คำนวณภาษีเงินได้บุคคลธรรมดา ตามอัตราภาษีปี 2568
          <br />
          กรอกข้อมูลรายได้และค่าลดหย่อนเพื่อทราบจำนวนภาษีที่ต้องชำระ
        </p>
      </div>
      <div className="welcome-badge">
        <div className="welcome-badge-icon">😊</div>
        <div className="welcome-badge-text">TAX</div>
      </div>
    </div>
  )
}

export default WelcomeBanner
