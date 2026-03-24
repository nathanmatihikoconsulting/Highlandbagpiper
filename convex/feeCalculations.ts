// Fee calculation constants
export const PLATFORM_FEE_RATE = 0.10; // 10% platform fee
export const GST_RATE = 0.15;          // 15% NZ GST

export interface FeeBreakdown {
  piperBaseFee: number;
  piperGst: number;
  piperFeeIncGst: number;
  platformFeeExGst: number;
  platformGst: number;
  platformFeeIncGst: number;
  totalCharged: number;
  piperGstRegistered: boolean;
  platformFeeRate: number;
}

/**
 * Calculates the full GST-aware fee breakdown for a booking.
 *
 * - If the piper is GST registered, their base fee is GST-exclusive and
 *   15% GST is added on top of their portion.
 * - The platform fee is always GST-inclusive (platform is GST registered).
 * - Returns all values needed for Stripe checkout and IRD record-keeping.
 */
export function calculateFees(
  piperBaseFee: number,
  piperGstRegistered: boolean
): FeeBreakdown {
  // Piper's GST: only applies if piper is GST registered
  const piperGst = piperGstRegistered ? piperBaseFee * GST_RATE : 0;
  const piperFeeIncGst = piperBaseFee + piperGst;

  // Platform fee: always GST-inclusive (Matihiko Mahi Limited is GST registered)
  const platformFeeExGst = piperBaseFee * PLATFORM_FEE_RATE;
  const platformGst = platformFeeExGst * GST_RATE;
  const platformFeeIncGst = platformFeeExGst + platformGst;

  // Total charged to the customer
  const totalCharged = piperFeeIncGst + platformFeeIncGst;

  return {
    piperBaseFee,
    piperGst,
    piperFeeIncGst,
    platformFeeExGst,
    platformGst,
    platformFeeIncGst,
    totalCharged,
    piperGstRegistered,
    platformFeeRate: PLATFORM_FEE_RATE,
  };
}
