/*************************
 * Types & Constants
 *************************/
export type Currency =
  | "usd"
  | "eur"
  | "gbp"
  | "cad"
  | "aud"
  | "jpy"
  | "inr"
  | "ngn";
export type PricingModel = "one_time" | "subscription" | "per_unit";
export type Interval = "day" | "week" | "month" | "year";
export type TierType = "none" | "volume" | "graduated" | "stairstep";
export type DownPaymentType = "percent" | "amount";

export interface Tier {
  upTo: number; // inclusive cap
  unitPrice: number; // price per unit in this tier
}

export interface InstallmentsConfig {
  enabled: boolean;
  count: number; // e.g., 3
  downPaymentType: DownPaymentType; // 'percent' | 'amount'
  downPaymentValue: number; // value (percent 0–100 or absolute)
  interval?: Interval; // e.g. "month"
  intervalCount?: number; // e.g. 1
  allowEarlyPayoff?: boolean; // e.g. true
  provider?: "in_house" | "stripe" | "other" | string; // default "in_house"
}

export interface Pricing {
  model: PricingModel;
  currency: Currency;

  // Shared helpers
  taxInclusive?: boolean; // default true
  vatPercentage?: number; // default 0
  discountPercent?: number; // NEW: global discount 0–100

  // One-time + per-unit (simple)
  basePrice?: number; // one_time total OR per-unit price when tierType === "none"

  // Per-unit extras
  unitName?: string; // UI label for quantity (default: "participant")
  allowQuantity?: boolean; // default false
  minQty?: number; // default 1
  maxQty?: number; // default 1000
  tierType?: TierType; // default "none"
  tiers?: Tier[]; // tier rows (if tiered)

  // Subscription only
  subscriptionPrice?: number; // price per billing interval
  interval?: Interval; // required for subscription
  intervalCount?: number; // default 1
  trialDays?: number; // default 0
  setupFee?: number; // default 0
  autoRenew?: boolean; // default true
  minTermMonths?: number; // default 0
  proration?: boolean; // default true

  // In-house installments (for one_time & per_unit)
  installments?: InstallmentsConfig;
}

export interface PriceBreakdown {
  model: PricingModel;
  quantity: number;
  unitPrice?: number; // for per-unit (volume) or one-time reference
  subtotal: number; // before discount & tax
  discount?: number; // NEW: discount amount
  net?: number; // NEW: after discount, before tax
  vat?: number;
  total: number;
  interval?: Interval;
  intervalCount?: number;
  setupFee?: number;
  tierType?: TierType;
  graduatedDetail?: Array<{ qty: number; unitPrice: number; line: number }>; // for graduated/stairstep
}

export const currencySymbols: Record<Currency, string> = {
  usd: "$",
  eur: "€",
  gbp: "£",
  cad: "C$",
  aud: "A$",
  jpy: "¥",
  inr: "₹",
  ngn: "₦",
};

/*************************
 * PricingForm (controlled)
 *************************/
export interface PricingFormProps {
  value: Pricing;
  onChange: (next: Pricing) => void;
  disabled?: boolean;
  showPreview?: boolean; // default true
}

export const defaultPricing: Pricing = {
  model: "one_time",
  currency: "gbp",
  taxInclusive: true,
  vatPercentage: 0,
  basePrice: 0,
  unitName: "participant",
  allowQuantity: false,
  minQty: 1,
  maxQty: 1000,
  tierType: "none",
  tiers: [],
  subscriptionPrice: undefined,
  interval: "month",
  intervalCount: 1,
  trialDays: 0,
  setupFee: 0,
  autoRenew: true,
  minTermMonths: 0,
  proration: true,
};

export function normalizePricingForApi(p: Pricing): Pricing {
  const out: Pricing = { ...p };

  // Never send installments for subscriptions
  if (out.model === "subscription") {
    delete out.installments;
    return out;
  }

  // Remove installments entirely when disabled
  if (!out.installments?.enabled) {
    delete out.installments;
  } else {
    out.installments = {
      enabled: true,
      count: Math.max(2, Number(out.installments.count || 2)),
      downPaymentType: out.installments.downPaymentType,
      downPaymentValue: Math.max(
        0,
        Number(out.installments.downPaymentValue || 0)
      ),
    };
  }

  return out;
}
