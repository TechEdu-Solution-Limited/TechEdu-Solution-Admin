// src/utils/pricingApi.ts  (aka "@/utils/pricingApi")
import { Pricing } from "@/lib/constants/pricing";

export const validatePricing = (pricing: Pricing): string | null => {
  if (pricing.model === "one_time") {
    if ((pricing.basePrice ?? 0) < 0)
      return "One-time price cannot be negative.";
  } else if (pricing.model === "subscription") {
    if (!pricing.subscriptionPrice || pricing.subscriptionPrice < 0)
      return "Subscription price is required.";
    if (!pricing.interval) return "Subscription interval is required.";
    if ((pricing.intervalCount ?? 1) < 1)
      return "Subscription interval count must be at least 1.";
  } else if (pricing.model === "per_unit") {
    if (pricing.tierType === "none") {
      if ((pricing.basePrice ?? 0) < 0) return "Unit price cannot be negative.";
    } else {
      if (!pricing.tiers || pricing.tiers.length === 0)
        return "Please add at least one tier.";
    }
    if ((pricing.minQty ?? 1) < 1)
      return "Minimum quantity must be at least 1.";
    if ((pricing.maxQty ?? 1) < (pricing.minQty ?? 1))
      return "Max quantity must be >= min quantity.";
  }
  return null;
};

export const pickPricingForApi = (p: Pricing) => ({
  model: p.model,
  currency: p.currency,
  basePrice: p.basePrice,
  unitName: p.unitName,
  allowQuantity: p.allowQuantity,
  minQty: p.minQty,
  maxQty: p.maxQty,
  tierType: p.tierType,
  tiers: p.tiers,
  taxInclusive: p.taxInclusive,
  vatPercentage: p.vatPercentage,
  subscriptionPrice: p.subscriptionPrice,
  interval: p.interval,
  intervalCount: p.intervalCount,
  trialDays: p.trialDays,
  setupFee: p.setupFee,
  autoRenew: p.autoRenew,
  minTermMonths: p.minTermMonths,
  proration: p.proration,
  installments: p.installments
    ? {
        enabled: true,
        count: p.installments.count,
        interval: p.installments.interval ?? "month",
        intervalCount: p.installments.intervalCount ?? 1,
        downPaymentType: p.installments.downPaymentType,
        downPaymentValue: p.installments.downPaymentValue,
        allowEarlyPayoff: p.installments.allowEarlyPayoff ?? true,
        provider: p.installments.provider ?? "in_house",
      }
    : { enabled: false },
});
