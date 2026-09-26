/**
 * Email tariff lines — must match nirwanastays/Frontend AccommodationBookingPage.tsx:
 *   total_amount  = calculateTotalAmount() (gross, before coupon)
 *   discount      = totalAmount - finalAmount (rupees off)
 *   advance_amount = ~30% of finalAmount (net after coupon)
 *
 * Email / PDF display:
 *   Full Amount     = gross (total_amount)
 *   Total Amount    = gross - discount (net payable)
 *   Remaining       = net - advance
 */
require("dotenv").config();

/**
 * @param {{ total_amount: unknown, Discount?: unknown, advance_amount?: unknown }} row
 */
function computeEmailTariffLines(row) {
  const gross = parseFloat(row.total_amount) || 0;
  const discount = parseFloat(row.Discount ?? 0) || 0;
  const advance = parseFloat(row.advance_amount ?? 0) || 0;
  const netPayable = gross - discount;

  return {
    fullAmountDisplay: gross.toFixed(2),
    netPayableFormatted: netPayable.toFixed(2),
    remainingAmount: (netPayable - advance).toFixed(2),
    discountFormatted: discount.toFixed(2),
  };
}

module.exports = {
  computeEmailTariffLines,
};
