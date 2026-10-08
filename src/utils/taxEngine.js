/**
 * Pure Domain Tax Engine for Thai Personal Income Tax (PIT / ภ.ง.ด. 90/91)
 * Compliant with Revenue Code Regulations
 */

export const TAX_BRACKETS = [
  { min: 0, max: 150000, rate: 0, label: '0 - 150,000' },
  { min: 150000, max: 300000, rate: 0.05, label: '150,001 - 300,000' },
  { min: 300000, max: 500000, rate: 0.10, label: '300,001 - 500,000' },
  { min: 500000, max: 750000, rate: 0.15, label: '500,001 - 750,000' },
  { min: 750000, max: 1000000, rate: 0.20, label: '750,001 - 1,000,000' },
  { min: 1000000, max: 2000000, rate: 0.25, label: '1,000,001 - 2,000,000' },
  { min: 2000000, max: 5000000, rate: 0.30, label: '2,000,001 - 5,000,000' },
  { min: 5000000, max: Infinity, rate: 0.35, label: '5,000,001 ขึ้นไป' },
];

const sanitizeNumber = (val, max = 999999999) => {
  const num = Number(val);
  if (isNaN(num) || num < 0) return 0;
  return Math.min(num, max);
};

/**
 * Calculates Thai PIT based on itemized parameters.
 * @param {Object} params
 * @returns {Object} Full tax breakdown result
 */
export function calculateTax(params = {}) {
  const monthlySalary = sanitizeNumber(params.monthlyIncome);
  const freelance = sanitizeNumber(params.freelanceIncome);
  const withholdingTax = sanitizeNumber(params.withholdingTax);

  const annualSalary = monthlySalary * 12;
  const sumIncome = annualSalary + freelance;

  // 1. Standard Expense Deduction: 50% capped at 100,000 THB (Sections 40(1) and 40(2))
  const expenseDeduction = Math.min(sumIncome * 0.5, 100000);

  // 2. Personal and Family Allowances
  const personal = sanitizeNumber(params.personalAllowance, 60000);
  const spouse = sanitizeNumber(params.spouseAllowance, 60000);
  const child = sanitizeNumber(params.childAllowance);

  // 3. Insurance & Social Security
  // Life & Health Insurance combined cap: 100,000 THB
  const rawInsurance = sanitizeNumber(params.insurance);
  const insurance = Math.min(rawInsurance, 100000);

  // Social Security Section 33 statutory cap: 9,000 THB/year
  const rawSSO = sanitizeNumber(params.socialSecurity);
  const socialSecurity = Math.min(rawSSO, 9000);

  // 4. Investment Funds (RMF / Provident Fund): 30% of income, capped at 500,000 THB
  const rawInvestment = sanitizeNumber(params.investmentFund);
  const maxInvestmentAllowed = Math.min(sumIncome * 0.3, 500000);
  const investmentFund = Math.min(rawInvestment, maxInvestmentAllowed);

  // 5. Extended Deductions (Home loan, Parent, Donations)
  const homeLoanInterest = Math.min(sanitizeNumber(params.homeLoanInterest), 100000);
  const parentAllowance = Math.min(sanitizeNumber(params.parentAllowance), 120000);

  // Pre-donation total deduction
  let preDonationDeduction = personal + spouse + child + insurance + socialSecurity +
    investmentFund + homeLoanInterest + parentAllowance;

  // Donations: capped at 10% of (sumIncome - expenseDeduction - preDonationDeduction)
  const remainingBeforeDonation = Math.max(0, sumIncome - expenseDeduction - preDonationDeduction);
  const maxDonationCap = remainingBeforeDonation * 0.10;

  const rawEducationDonation = sanitizeNumber(params.donationEducation); // 2x
  const rawGeneralDonation = sanitizeNumber(params.donationGeneral); // 1x
  const totalEligibleDonation = (rawEducationDonation * 2) + rawGeneralDonation;
  const donation = Math.min(totalEligibleDonation, maxDonationCap);

  const totalDeduction = preDonationDeduction + donation;

  // 6. Net Taxable Income
  const netIncome = Math.max(0, sumIncome - expenseDeduction - totalDeduction);

  // 7. Progressive Tax Calculation (Method 1)
  let bracketTax = 0;
  let remainingNet = netIncome;
  let marginalRate = 0;

  const brackets = TAX_BRACKETS.map(bracket => {
    let taxableInBracket = 0;
    let taxInBracket = 0;

    if (remainingNet > 0) {
      const bracketRange = bracket.max - bracket.min;
      taxableInBracket = Math.min(remainingNet, bracketRange);
      taxInBracket = taxableInBracket * bracket.rate;
      bracketTax += taxInBracket;
      remainingNet -= taxableInBracket;

      if (taxableInBracket > 0 && bracket.rate > marginalRate) {
        marginalRate = bracket.rate;
      }
    }

    return {
      min: bracket.min,
      max: bracket.max,
      rate: bracket.rate,
      label: bracket.label,
      taxable: Math.round(taxableInBracket),
      tax: Math.round(taxInBracket),
    };
  });

  const roundedBracketTax = Math.round(bracketTax);

  // 8. Section 48(2) Flat Rate Tax (Method 2)
  // For non-salary income (freelance) exceeding 120,000 THB: 0.5% flat rate
  let flatRateTax = 0;
  let taxMethod = 'bracket';

  if (freelance > 120000) {
    flatRateTax = Math.round(freelance * 0.005);
    // If flat tax exceeds 5,000 THB and exceeds progressive tax, apply flat rate
    if (flatRateTax > 5000 && flatRateTax > roundedBracketTax) {
      taxMethod = 'flat_rate';
    }
  }

  const finalTax = taxMethod === 'flat_rate' ? flatRateTax : roundedBracketTax;

  // 9. Withholding Tax Balance & Refund Calculation
  const netBalance = finalTax - withholdingTax;
  let status = 'zero';
  let refundAmount = 0;
  let payableAmount = 0;

  if (netBalance < 0) {
    status = 'refund';
    refundAmount = Math.abs(netBalance);
  } else if (netBalance > 0) {
    status = 'payable';
    payableAmount = netBalance;
  }

  return {
    annualSalary,
    freelanceIncome: freelance,
    sumIncome,
    expenseDeduction,
    itemizedDeductions: {
      personal,
      spouse,
      child,
      insurance,
      socialSecurity,
      investmentFund,
      homeLoanInterest,
      parentAllowance,
      donation,
    },
    totalDeduction,
    netIncome,
    bracketTax: roundedBracketTax,
    flatRateTax,
    taxMethod,
    finalTax,
    tax: finalTax, // backwards compatibility
    withholdingTax,
    netBalance,
    status,
    refundAmount,
    payableAmount,
    marginalRate,
    brackets,
  };
}

/**
 * Adapter for existing React component formData format.
 */
export function calculateTaxFromFormData(formData = {}) {
  const p = formData.parentAllowance;
  let parentAllowance = 0;
  if (p?.enabled) {
    if (p.ownFather || p.ownMother || p.spouseFather || p.spouseMother) {
      const count = (p.ownFather ? 1 : 0) + (p.ownMother ? 1 : 0) + (p.spouseFather ? 1 : 0) + (p.spouseMother ? 1 : 0);
      parentAllowance = count * 30000;
    } else {
      parentAllowance = Number(p.amount) || 0;
    }
  }

  const params = {
    monthlyIncome: formData.monthlyIncome || 0,
    freelanceIncome: formData.freelanceIncome || 0,
    withholdingTax: formData.withholdingTax || 0,
    personalAllowance: formData.personalAllowance?.enabled ? formData.personalAllowance.amount : 0,
    spouseAllowance: formData.spouseAllowance?.enabled ? formData.spouseAllowance.amount : 0,
    childAllowance: formData.childAllowance?.enabled ? formData.childAllowance.amount : 0,
    insurance: formData.insurance?.enabled ? formData.insurance.amount : 0,
    socialSecurity: formData.socialSecurity?.enabled ? formData.socialSecurity.amount : 0,
    investmentFund: formData.investmentFund?.enabled ? formData.investmentFund.amount : 0,
    homeLoanInterest: formData.homeLoanInterest?.enabled ? formData.homeLoanInterest.amount : 0,
    parentAllowance,
    donationEducation: formData.donationEducation?.enabled ? formData.donationEducation.amount : 0,
    donationGeneral: formData.donationGeneral?.enabled ? formData.donationGeneral.amount : 0,
  };

  return calculateTax(params);
}
