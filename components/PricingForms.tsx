"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import {
  Currency,
  currencySymbols,
  DownPaymentType,
  InstallmentsConfig,
  Interval,
  PriceBreakdown,
  Pricing,
  PricingModel,
  Tier,
  TierType,
} from "@/lib/constants/pricing";

/*************************
 * Money & Helpers
 *************************/
const toCents = (n: number) => Math.round((Number(n) || 0) * 100);
const fromCents = (c: number) => c / 100;
const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));
const pct = (baseC: number, p: number) =>
  Math.round((baseC * (Number(p) || 0)) / 100);

export function formatMoney(amount: number, currency: Currency) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    // Fallback
    return `${currencySymbols[currency]}${Number(amount).toLocaleString()}`;
  }
}

/*************************
 * Installments calculator
 *************************/
export function computeInstallments(total: number, cfg?: InstallmentsConfig) {
  if (!cfg?.enabled) return null;

  // N = number of installments AFTER down payment. Backend minimum is 2.
  const count = Math.max(2, Number(cfg.count || 0));

  const totalC = toCents(total);
  const rawDownC =
    cfg.downPaymentType === "percent"
      ? pct(totalC, clamp(cfg.downPaymentValue ?? 0, 0, 100))
      : toCents(cfg.downPaymentValue ?? 0);

  // Cap down payment at total
  const downC = Math.min(Math.max(0, rawDownC), totalC);
  const remainderC = Math.max(0, totalC - downC);

  // Split remainder into N equal installments
  const each = Math.floor(remainderC / count);
  const planC = Array.from({ length: count }, () => each);
  // Fix rounding on the last installment
  planC[planC.length - 1] += remainderC - each * count;

  return {
    downPayment: fromCents(downC),
    plan: planC.map(fromCents),
  };
}

/*************************
 * Price computation (client-side preview)
 *************************/
export function computePrice(pricing: Pricing, quantity = 1): PriceBreakdown {
  const taxInclusive = pricing.taxInclusive ?? true;
  const vatPct = pricing.vatPercentage ?? 0;
  const discountPct = clamp(pricing.discountPercent ?? 0, 0, 100);

  if (pricing.model === "one_time") {
    const subtotalC = toCents(pricing.basePrice ?? 0);
    const discountC = pct(subtotalC, discountPct);
    const netC = subtotalC - discountC;
    const vatC = taxInclusive ? 0 : pct(netC, vatPct);
    const totalC = netC + vatC;

    return {
      model: "one_time",
      quantity: 1,
      unitPrice: fromCents(subtotalC),
      subtotal: fromCents(subtotalC),
      discount: fromCents(discountC),
      net: fromCents(netC),
      vat: fromCents(vatC),
      total: fromCents(totalC),
    };
  }

  if (pricing.model === "subscription") {
    const priceC = toCents(pricing.subscriptionPrice ?? 0);
    const setupC = toCents(pricing.setupFee ?? 0);
    const subtotalC = priceC + setupC;
    const discountC = pct(subtotalC, discountPct); // optional: discount applied to first invoice preview
    const netC = subtotalC - discountC;
    const vatC = taxInclusive ? 0 : pct(netC, vatPct);
    const totalC = netC + vatC;

    return {
      model: "subscription",
      quantity: 1,
      unitPrice: fromCents(priceC),
      setupFee: fromCents(setupC),
      interval: pricing.interval || "month",
      intervalCount: pricing.intervalCount || 1,
      subtotal: fromCents(subtotalC),
      discount: fromCents(discountC),
      net: fromCents(netC),
      vat: fromCents(vatC),
      total: fromCents(totalC),
    };
  }

  // per_unit
  const qMin = Math.max(pricing.minQty ?? 1, 1);
  const qMax = Math.max(pricing.maxQty ?? 1000, qMin);
  const q = clamp(quantity || qMin, qMin, qMax);
  const tierType: TierType = pricing.tierType || "none";

  if (tierType === "none") {
    const unitC = toCents(pricing.basePrice ?? 0);
    const subtotalC = unitC * q;
    const discountC = pct(subtotalC, discountPct);
    const netC = subtotalC - discountC;
    const vatC = taxInclusive ? 0 : pct(netC, vatPct);
    const totalC = netC + vatC;

    return {
      model: "per_unit",
      quantity: q,
      unitPrice: fromCents(unitC),
      subtotal: fromCents(subtotalC),
      discount: fromCents(discountC),
      net: fromCents(netC),
      vat: fromCents(vatC),
      total: fromCents(totalC),
      tierType,
    };
  }

  // volume / graduated / stairstep
  const tiers = (pricing.tiers || []).slice().sort((a, b) => a.upTo - b.upTo);

  if (tiers.length === 0) {
    return {
      model: "per_unit",
      quantity: q,
      subtotal: 0,
      discount: 0,
      net: 0,
      vat: 0,
      total: 0,
      tierType,
    };
  }

  if (tierType === "volume") {
    let unit = tiers[tiers.length - 1].unitPrice;
    for (const t of tiers) {
      if (q <= t.upTo) {
        unit = t.unitPrice;
        break;
      }
    }
    const unitC = toCents(unit);
    const subtotalC = unitC * q;
    const discountC = pct(subtotalC, discountPct);
    const netC = subtotalC - discountC;
    const vatC = taxInclusive ? 0 : pct(netC, vatPct);
    const totalC = netC + vatC;

    return {
      model: "per_unit",
      quantity: q,
      unitPrice: fromCents(unitC),
      subtotal: fromCents(subtotalC),
      discount: fromCents(discountC),
      net: fromCents(netC),
      vat: fromCents(vatC),
      total: fromCents(totalC),
      tierType,
    };
  }

  // graduated / stairstep (treated similarly for preview)
  let remaining = q;
  let lastCap = 0;
  let subtotalC = 0;
  const graduatedDetail: Array<{
    qty: number;
    unitPrice: number;
    line: number;
  }> = [];
  for (const t of tiers) {
    const span = Math.max(Math.min(remaining, t.upTo - lastCap), 0);
    if (span > 0) {
      const unitC = toCents(t.unitPrice);
      const lineC = unitC * span;
      subtotalC += lineC;
      graduatedDetail.push({
        qty: span,
        unitPrice: t.unitPrice,
        line: fromCents(lineC),
      });
      remaining -= span;
      lastCap = t.upTo;
    }
    if (remaining <= 0) break;
  }
  if (remaining > 0) {
    const last = tiers[tiers.length - 1];
    const unitC = toCents(last.unitPrice);
    const lineC = unitC * remaining;
    subtotalC += lineC;
    graduatedDetail.push({
      qty: remaining,
      unitPrice: last.unitPrice,
      line: fromCents(lineC),
    });
  }

  const discountC = pct(subtotalC, discountPct);
  const netC = subtotalC - discountC;
  const vatC = taxInclusive ? 0 : pct(netC, vatPct);
  const totalC = netC + vatC;

  return {
    model: "per_unit",
    quantity: q,
    subtotal: fromCents(subtotalC),
    discount: fromCents(discountC),
    net: fromCents(netC),
    vat: fromCents(vatC),
    total: fromCents(totalC),
    tierType,
    graduatedDetail,
  };
}

/*************************
 * TierEditor
 *************************/
export interface TierEditorProps {
  tierType: TierType;
  tiers: Tier[];
  onChange: (tiers: Tier[]) => void;
  disabled?: boolean;
}

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

export function TierEditor({
  tierType,
  tiers,
  onChange,
  disabled,
}: TierEditorProps) {
  if (tierType === "none") return null;

  const sorted = useMemo(
    () => (tiers || []).slice().sort((a, b) => a.upTo - b.upTo),
    [tiers]
  );

  const addRow = () => {
    const upTo =
      sorted.length > 0 ? Math.max(...sorted.map((t) => t.upTo)) + 1 : 10;
    const next = [...sorted, { upTo, unitPrice: 0 }];
    onChange(next);
  };

  const removeRow = (idx: number) => {
    const next = sorted.filter((_, i) => i !== idx);
    onChange(next);
  };

  const updateCell = (idx: number, key: keyof Tier, value: number) => {
    const next = sorted.map((row, i) =>
      i === idx ? { ...row, [key]: value } : row
    );
    onChange(next);
  };

  return (
    <Card className="border rounded-2xl">
      <CardHeader>
        <CardTitle className="text-base">Tier Table</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[160px]">Up to (qty)</TableHead>
                <TableHead className="w-[160px]">Unit price</TableHead>
                <TableHead className="w-[80px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Input
                      type="number"
                      min={1}
                      value={row.upTo}
                      disabled={disabled}
                      onChange={(e) =>
                        updateCell(idx, "upTo", Number(e.target.value || 0))
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={row.unitPrice}
                      disabled={disabled}
                      onChange={(e) =>
                        updateCell(
                          idx,
                          "unitPrice",
                          Number(e.target.value || 0)
                        )
                      }
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRow(idx)}
                      disabled={disabled}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-3">
          <Button
            type="button"
            onClick={addRow}
            disabled={disabled}
            className="gap-2"
          >
            <Plus className="w-4 h-4" /> Add tier
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/*************************
 * PricePreviewCard
 *************************/
export interface PricePreviewCardProps {
  pricing: Pricing;
  quantity?: number;
}

export function PricePreviewCard({
  pricing,
  quantity = 1,
}: PricePreviewCardProps) {
  const breakdown = useMemo(
    () => computePrice(pricing, quantity),
    [pricing, quantity]
  );
  const label = pricing.unitName || "participant";
  const money = (n: number) => formatMoney(n, pricing.currency);

  return (
    <Card className="border rounded-2xl">
      <CardHeader>
        <CardTitle className="text-base">Price Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {pricing.model === "subscription" ? (
          <div className="space-y-1">
            <div>
              <span className="font-medium">Recurring:</span>{" "}
              {money(Number(pricing.subscriptionPrice || 0))} /{" "}
              {pricing.intervalCount || 1} {pricing.interval || "month"}
            </div>
            {pricing.setupFee ? (
              <div>
                <span className="font-medium">Setup fee:</span>{" "}
                {money(Number(pricing.setupFee))}
              </div>
            ) : null}
            {pricing.trialDays ? (
              <div>
                <span className="font-medium">Trial:</span> {pricing.trialDays}{" "}
                days
              </div>
            ) : null}
            <div className="pt-2">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>{money(breakdown.subtotal)}</span>
              </div>
              {typeof breakdown.discount === "number" &&
                breakdown.discount > 0 && (
                  <div className="flex items-center justify-between">
                    <span>Discount ({pricing.discountPercent ?? 0}%)</span>
                    <span>-{money(breakdown.discount)}</span>
                  </div>
                )}
              {typeof breakdown.net === "number" && (
                <div className="flex items-center justify-between">
                  <span>Net</span>
                  <span>{money(breakdown.net)}</span>
                </div>
              )}
              {!pricing.taxInclusive && (
                <div className="flex items-center justify-between">
                  <span>VAT ({pricing.vatPercentage ?? 0}%)</span>
                  <span>{money(breakdown.vat || 0)}</span>
                </div>
              )}
              <div className="flex items-center justify-between font-semibold border-t pt-2 mt-1">
                <span>Total due now</span>
                <span>{money(breakdown.total)}</span>
              </div>
            </div>
          </div>
        ) : pricing.model === "one_time" ? (
          <div className="space-y-1">
            <div>
              <span className="font-medium">One-time:</span>{" "}
              {money(Number(pricing.basePrice || 0))}
            </div>
            <div className="pt-2">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>{money(breakdown.subtotal)}</span>
              </div>
              {typeof breakdown.discount === "number" &&
                breakdown.discount > 0 && (
                  <div className="flex items-center justify-between">
                    <span>Discount ({pricing.discountPercent ?? 0}%)</span>
                    <span>-{money(breakdown.discount)}</span>
                  </div>
                )}
              {typeof breakdown.net === "number" && (
                <div className="flex items-center justify-between">
                  <span>Net</span>
                  <span>{money(breakdown.net)}</span>
                </div>
              )}
              {!pricing.taxInclusive && (
                <div className="flex items-center justify-between">
                  <span>VAT ({pricing.vatPercentage ?? 0}%)</span>
                  <span>{money(breakdown.vat || 0)}</span>
                </div>
              )}
              <div className="flex items-center justify-between font-semibold border-t pt-2 mt-1">
                <span>Total</span>
                <span>{money(breakdown.total)}</span>
              </div>
            </div>

            {/* Installments for one-time */}
            {pricing.installments?.enabled && (
              <div className="rounded-xl border p-2 mt-3 bg-muted/30">
                <div className="text-xs font-medium mb-1">Installments</div>
                {(() => {
                  const plan = computeInstallments(
                    breakdown.total,
                    pricing.installments
                  );
                  if (!plan) return null;
                  return (
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span>Down payment</span>
                        <span>{money(plan.downPayment)}</span>
                      </div>
                      {plan.plan.map((amt, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between"
                        >
                          <span>Installment {i + 1}</span>
                          <span>{money(amt)}</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium capitalize">Per {label}</span>
              {breakdown.unitPrice !== undefined ? (
                <span>{money(breakdown.unitPrice || 0)}</span>
              ) : (
                <span className="text-muted-foreground">tiered</span>
              )}
            </div>

            {breakdown.graduatedDetail &&
              breakdown.graduatedDetail.length > 0 && (
                <div className="rounded-xl border p-2 bg-muted/30">
                  <div className="text-xs font-medium mb-1">Tier breakdown</div>
                  <div className="space-y-1 text-xs">
                    {breakdown.graduatedDetail.map((row, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between"
                      >
                        <span>
                          {row.qty} × {money(row.unitPrice)}
                        </span>
                        <span>{money(row.line)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            <div className="pt-1">
              <div className="flex items-center justify-between">
                <span>
                  Subtotal ({breakdown.quantity} {label}
                  {breakdown.quantity > 1 ? "s" : ""})
                </span>
                <span>{money(breakdown.subtotal)}</span>
              </div>
              {typeof breakdown.discount === "number" &&
                breakdown.discount > 0 && (
                  <div className="flex items-center justify-between">
                    <span>Discount ({pricing.discountPercent ?? 0}%)</span>
                    <span>-{money(breakdown.discount)}</span>
                  </div>
                )}
              {typeof breakdown.net === "number" && (
                <div className="flex items-center justify-between">
                  <span>Net</span>
                  <span>{money(breakdown.net)}</span>
                </div>
              )}
              {!pricing.taxInclusive && (
                <div className="flex items-center justify-between">
                  <span>VAT ({pricing.vatPercentage ?? 0}%)</span>
                  <span>{money(breakdown.vat || 0)}</span>
                </div>
              )}
              <div className="flex items-center justify-between font-semibold border-t pt-2 mt-1">
                <span>Total</span>
                <span>{money(breakdown.total)}</span>
              </div>
            </div>

            {/* Installments for per-unit */}
            {pricing.installments?.enabled && (
              <div className="rounded-xl border p-2 mt-3 bg-muted/30">
                <div className="text-xs font-medium mb-1">Installments</div>
                {(() => {
                  const plan = computeInstallments(
                    breakdown.total,
                    pricing.installments
                  );
                  if (!plan) return null;
                  return (
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span>Down payment</span>
                        <span>{money(plan.downPayment)}</span>
                      </div>
                      {plan.plan.map((amt, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between"
                        >
                          <span>Installment {i + 1}</span>
                          <span>{money(amt)}</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/*************************
 * PricingForm (controlled)
 *************************/
export interface PricingFormProps {
  value: Pricing;
  onChange: (next: Pricing) => void;
  disabled?: boolean;
  showPreview?: boolean; // default true
}

const defaultPricing: Pricing = {
  model: "one_time",
  currency: "gbp",
  taxInclusive: true,
  vatPercentage: 0,
  discountPercent: 0,
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
  installments: undefined,
};

export function PricingForm({
  value,
  onChange,
  disabled,
  showPreview = true,
}: PricingFormProps) {
  const [qtyPreview, setQtyPreview] = useState<number>(value.minQty ?? 1);

  const v: Pricing = { ...defaultPricing, ...value };

  const apply = (patch: Partial<Pricing>) => {
    const next: Pricing = { ...v, ...patch };
    // model-specific hygiene
    if (patch.model) {
      if (patch.model === "one_time") {
        next.tierType = "none";
        next.tiers = [];
        next.allowQuantity = false;
        next.subscriptionPrice = undefined;
        next.interval = "month";
        next.intervalCount = 1;
      } else if (patch.model === "subscription") {
        next.tierType = "none";
        next.tiers = [];
        next.allowQuantity = false;
        next.basePrice = undefined;
      } else if (patch.model === "per_unit") {
        // keep basePrice as unit price if no tiers
        next.subscriptionPrice = undefined;
        next.interval = "month";
        next.intervalCount = 1;
      }
    }
    onChange(next);
  };

  const CurrencySelect = (
    <Select
      value={v.currency}
      onValueChange={(val: Currency) => apply({ currency: val })}
      disabled={disabled}
    >
      <SelectTrigger className="w-[160px] rounded-[10px]">
        <SelectValue placeholder="Currency" />
      </SelectTrigger>
      <SelectContent className="bg-white rounded-[10px]">
        <SelectGroup>
          <SelectLabel>Currency</SelectLabel>
          {(
            [
              "usd",
              "eur",
              "gbp",
              "cad",
              "aud",
              "jpy",
              "inr",
              "ngn",
            ] as Currency[]
          ).map((c) => (
            <SelectItem key={c} value={c} className="capitalize">
              {c} ({currencySymbols[c]})
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );

  return (
    <>
      {/* Pricing Model */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Pricing Model</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            className="grid grid-cols-1 sm:grid-cols-3 gap-2"
            value={v.model}
            onValueChange={(val: PricingModel) => apply({ model: val })}
            disabled={disabled}
          >
            <Label className="flex items-center gap-2 border rounded-xl p-3 cursor-pointer">
              <RadioGroupItem value="one_time" /> One-time
            </Label>
            <Label className="flex items-center gap-2 border rounded-xl p-3 cursor-pointer">
              <RadioGroupItem value="subscription" /> Subscription
            </Label>
            <Label className="flex items-center gap-2 border rounded-xl p-3 cursor-pointer">
              <RadioGroupItem value="per_unit" /> Per-person
            </Label>
          </RadioGroup>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          {/* One-time */}
          {v.model === "one_time" && (
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-base">One-time Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 flex-wrap">
                  {CurrencySelect}
                  <div className="space-y-1">
                    <Label>Price</Label>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={v.basePrice ?? 0}
                      disabled={disabled}
                      onChange={(e) =>
                        apply({ basePrice: Number(e.target.value || 0) })
                      }
                      className="w-[220px] rounded-[10px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Discount %</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step="0.1"
                      value={v.discountPercent ?? 0}
                      onChange={(e) =>
                        apply({ discountPercent: Number(e.target.value || 0) })
                      }
                      disabled={disabled}
                      className="w-[140px] rounded-[10px]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={v.taxInclusive}
                      onCheckedChange={(checked) =>
                        apply({ taxInclusive: checked })
                      }
                      disabled={disabled}
                    />
                    <Label>Tax inclusive</Label>
                  </div>
                  {!v.taxInclusive && (
                    <div className="space-y-1">
                      <Label>VAT %</Label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step="0.1"
                        value={v.vatPercentage ?? 0}
                        onChange={(e) =>
                          apply({ vatPercentage: Number(e.target.value || 0) })
                        }
                        disabled={disabled}
                        className="w-[140px] rounded-[10px]"
                      />
                    </div>
                  )}
                </div>

                {/* Installments */}
                <div className="flex items-center gap-6 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={!!v.installments?.enabled}
                      onCheckedChange={(checked) =>
                        apply({
                          installments: checked
                            ? v.installments ?? {
                                enabled: true,
                                count: 2, // minimum required by backend
                                downPaymentType: "percent",
                                downPaymentValue: 20,
                              }
                            : undefined, // <— do NOT send installments at all when disabled
                        })
                      }
                      disabled={disabled}
                    />
                    <Label>Installments (in-house)</Label>
                  </div>

                  {v.installments?.enabled && (
                    <>
                      <div className="space-y-1">
                        <Label>Count</Label>
                        <Input
                          type="number"
                          min={2}
                          value={v.installments.count}
                          onChange={(e) =>
                            apply({
                              installments: {
                                ...v.installments!,
                                count: Math.max(2, Number(e.target.value || 2)),
                              },
                            })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Down payment type</Label>
                        <Select
                          value={v.installments.downPaymentType}
                          onValueChange={(val: DownPaymentType) =>
                            apply({
                              installments: {
                                ...v.installments!,
                                downPaymentType: val,
                              },
                            })
                          }
                          disabled={disabled}
                        >
                          <SelectTrigger className="w-[160px] rounded-[10px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white rounded-[10px]">
                            <SelectItem value="percent">percent</SelectItem>
                            <SelectItem value="amount">amount</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label>
                          {v.installments.downPaymentType === "percent"
                            ? "Down payment (%)"
                            : "Down payment amount"}
                        </Label>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          value={v.installments.downPaymentValue}
                          onChange={(e) =>
                            apply({
                              installments: {
                                ...v.installments!,
                                downPaymentValue: Number(e.target.value || 0),
                              },
                            })
                          }
                          disabled={disabled}
                          className="w-[160px] rounded-[10px]"
                        />
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Subscription */}
          {v.model === "subscription" && (
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-base">
                  Subscription Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 flex-wrap">
                  {CurrencySelect}
                  <div className="space-y-1">
                    <Label>Price per interval</Label>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={v.subscriptionPrice ?? 0}
                      onChange={(e) =>
                        apply({
                          subscriptionPrice: Number(e.target.value || 0),
                        })
                      }
                      disabled={disabled}
                      className="w-[220px] rounded-[10px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Every</Label>
                    <Input
                      type="number"
                      min={1}
                      value={v.intervalCount ?? 1}
                      onChange={(e) =>
                        apply({ intervalCount: Number(e.target.value || 1) })
                      }
                      disabled={disabled}
                      className="w-[100px] rounded-[10px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Interval</Label>
                    <Select
                      value={v.interval}
                      onValueChange={(val: Interval) =>
                        apply({ interval: val })
                      }
                      disabled={disabled}
                    >
                      <SelectTrigger className="w-[160px] rounded-[10px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white rounded-[10px]">
                        <SelectItem value="day">day</SelectItem>
                        <SelectItem value="week">week</SelectItem>
                        <SelectItem value="month">month</SelectItem>
                        <SelectItem value="year">year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Discount %</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step="0.1"
                      value={v.discountPercent ?? 0}
                      onChange={(e) =>
                        apply({ discountPercent: Number(e.target.value || 0) })
                      }
                      disabled={disabled}
                      className="w-[140px] rounded-[10px]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                  <div className="space-y-1">
                    <Label>Setup fee</Label>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={v.setupFee ?? 0}
                      onChange={(e) =>
                        apply({ setupFee: Number(e.target.value || 0) })
                      }
                      disabled={disabled}
                      className="w-[160px] rounded-[10px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Trial days</Label>
                    <Input
                      type="number"
                      min={0}
                      value={v.trialDays ?? 0}
                      onChange={(e) =>
                        apply({ trialDays: Number(e.target.value || 0) })
                      }
                      disabled={disabled}
                      className="w-[140px] rounded-[10px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Minimum term (months)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={v.minTermMonths ?? 0}
                      onChange={(e) =>
                        apply({ minTermMonths: Number(e.target.value || 0) })
                      }
                      disabled={disabled}
                      className="w-[180px] rounded-[10px]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={v.autoRenew}
                      onCheckedChange={(checked) =>
                        apply({ autoRenew: checked })
                      }
                      disabled={disabled}
                    />
                    <Label>Auto-renew</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={v.proration}
                      onCheckedChange={(checked) =>
                        apply({ proration: checked })
                      }
                      disabled={disabled}
                    />
                    <Label>Prorate changes</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={v.taxInclusive}
                      onCheckedChange={(checked) =>
                        apply({ taxInclusive: checked })
                      }
                      disabled={disabled}
                    />
                    <Label>Tax inclusive</Label>
                  </div>
                  {!v.taxInclusive && (
                    <div className="space-y-1">
                      <Label>VAT %</Label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step="0.1"
                        value={v.vatPercentage ?? 0}
                        onChange={(e) =>
                          apply({ vatPercentage: Number(e.target.value || 0) })
                        }
                        disabled={disabled}
                        className="w-[140px] rounded-[10px]"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Per-person */}
          {v.model === "per_unit" && (
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-base">Per-person Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 flex-wrap">
                  {CurrencySelect}
                  <div className="space-y-1">
                    <Label>Unit label</Label>
                    <Input
                      value={v.unitName || "participant"}
                      onChange={(e) =>
                        apply({ unitName: e.target.value || "participant" })
                      }
                      disabled={disabled}
                      className="w-[220px] rounded-[10px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Allow quantity</Label>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={!!v.allowQuantity}
                        onCheckedChange={(checked) =>
                          apply({ allowQuantity: checked })
                        }
                        disabled={disabled}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Min qty</Label>
                    <Input
                      type="number"
                      min={1}
                      value={v.minQty ?? 1}
                      onChange={(e) =>
                        apply({ minQty: Number(e.target.value || 1) })
                      }
                      disabled={disabled}
                      className="w-[120px] rounded-[10px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Max qty</Label>
                    <Input
                      type="number"
                      min={v.minQty ?? 1}
                      value={v.maxQty ?? 1000}
                      onChange={(e) =>
                        apply({
                          maxQty: Number(e.target.value || v.minQty || 1),
                        })
                      }
                      disabled={disabled}
                      className="w-[120px] rounded-[10px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Discount %</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step="0.1"
                      value={v.discountPercent ?? 0}
                      onChange={(e) =>
                        apply({ discountPercent: Number(e.target.value || 0) })
                      }
                      disabled={disabled}
                      className="w-[140px] rounded-[10px]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                  <div className="space-y-1">
                    <Label>Tier type</Label>
                    <Select
                      value={v.tierType}
                      onValueChange={(val: TierType) =>
                        apply({ tierType: val })
                      }
                      disabled={disabled}
                    >
                      <SelectTrigger className="w-[200px] rounded-[10px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white rounded-[10px]">
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="volume">Volume</SelectItem>
                        <SelectItem value="graduated">Graduated</SelectItem>
                        <SelectItem value="stairstep">Stairstep</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {v.tierType === "none" && (
                    <div className="space-y-1">
                      <Label>Unit price</Label>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={v.basePrice ?? 0}
                        onChange={(e) =>
                          apply({ basePrice: Number(e.target.value || 0) })
                        }
                        disabled={disabled}
                        className="w-[200px] rounded-[10px]"
                      />
                    </div>
                  )}
                </div>

                {v.tierType !== "none" && (
                  <TierEditor
                    tierType={v.tierType as TierType}
                    tiers={v.tiers || []}
                    onChange={(next) => apply({ tiers: next })}
                    disabled={disabled}
                  />
                )}

                <div className="flex items-center gap-6 pt-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={v.taxInclusive}
                      onCheckedChange={(checked) =>
                        apply({ taxInclusive: checked })
                      }
                      disabled={disabled}
                    />
                    <Label>Tax inclusive</Label>
                  </div>
                  {!v.taxInclusive && (
                    <div className="space-y-1">
                      <Label>VAT %</Label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step="0.1"
                        value={v.vatPercentage ?? 0}
                        onChange={(e) =>
                          apply({ vatPercentage: Number(e.target.value || 0) })
                        }
                        disabled={disabled}
                        className="w-[140px] rounded-[10px]"
                      />
                    </div>
                  )}
                </div>

                {/* Installments */}
                <div className="flex items-center gap-6 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={!!v.installments?.enabled}
                      onCheckedChange={(checked) =>
                        apply({
                          installments: checked
                            ? v.installments ?? {
                                enabled: true,
                                count: 3,
                                downPaymentType: "percent",
                                downPaymentValue: 20,
                              }
                            : {
                                enabled: false,
                                count: 0,
                                downPaymentType: "percent",
                                downPaymentValue: 0,
                              },
                        })
                      }
                      disabled={disabled}
                    />
                    <Label>Installments (in-house)</Label>
                  </div>

                  {v.installments?.enabled && (
                    <>
                      <div className="space-y-1">
                        <Label>Count</Label>
                        <Input
                          type="number"
                          min={1}
                          value={v.installments.count}
                          onChange={(e) =>
                            apply({
                              installments: {
                                ...v.installments!,
                                count: Number(e.target.value || 1),
                              },
                            })
                          }
                          disabled={disabled}
                          className="w-[120px] rounded-[10px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Down payment type</Label>
                        <Select
                          value={v.installments.downPaymentType}
                          onValueChange={(val: DownPaymentType) =>
                            apply({
                              installments: {
                                ...v.installments!,
                                downPaymentType: val,
                              },
                            })
                          }
                          disabled={disabled}
                        >
                          <SelectTrigger className="w-[160px] rounded-[10px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white rounded-[10px]">
                            <SelectItem value="percent">percent</SelectItem>
                            <SelectItem value="amount">amount</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label>
                          {v.installments.downPaymentType === "percent"
                            ? "Down payment (%)"
                            : "Down payment amount"}
                        </Label>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          value={v.installments.downPaymentValue}
                          onChange={(e) =>
                            apply({
                              installments: {
                                ...v.installments!,
                                downPaymentValue: Number(e.target.value || 0),
                              },
                            })
                          }
                          disabled={disabled}
                          className="w-[160px] rounded-[10px]"
                        />
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Preview side */}
        <div className="lg:col-span-5 space-y-4">
          {showPreview && (
            <div className="space-y-3">
              {v.model === "per_unit" && v.allowQuantity && (
                <div className="space-y-1">
                  <Label>
                    Quantity ({v.unitName || "participant"}) — min{" "}
                    {v.minQty ?? 1}
                  </Label>
                  <Input
                    type="number"
                    min={v.minQty ?? 1}
                    max={v.maxQty ?? 1000}
                    value={qtyPreview}
                    onChange={(e) =>
                      setQtyPreview(Number(e.target.value || v.minQty || 1))
                    }
                    className="w-full"
                  />
                </div>
              )}
              <PricePreviewCard
                pricing={v}
                quantity={v.model === "per_unit" ? qtyPreview : 1}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/*************************
 * Example usage (commented)
 *************************/
// const [pricing, setPricing] = useState<Pricing>({
//   model: 'per_unit',
//   currency: 'gbp',
//   taxInclusive: false,
//   vatPercentage: 20,
//   unitName: 'participant',
//   allowQuantity: true,
//   minQty: 5,
//   maxQty: 100,
//   tierType: 'volume',
//   tiers: [
//     { upTo: 10, unitPrice: 150 },
//     { upTo: 50, unitPrice: 135 },
//     { upTo: 100, unitPrice: 120 },
//   ],
//   discountPercent: 10,
//   installments: { enabled: true, count: 3, downPaymentType: 'percent', downPaymentValue: 20 },
// });
// <PricingForm value={pricing} onChange={setPricing} />

export default PricingForm;
