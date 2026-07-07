// Renders a multi-currency totals object ({ NGN: 1500000, GBP: 2000 }) as a
// display string. Plain module — safe in both server and client components.
import { money } from "@/lib/format";

export function moneyTotals(totals, fallbackCurrency = "NGN") {
  const entries = Object.entries(totals ?? {}).filter(
    ([, amount]) => Number(amount) !== 0
  );
  if (entries.length === 0) return money(0, fallbackCurrency);
  return entries.map(([currency, amount]) => money(amount, currency)).join(" · ");
}
