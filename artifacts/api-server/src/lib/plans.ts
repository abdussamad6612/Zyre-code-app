export interface PlanConfig {
  id: string;
  name: string;
  price: number;
  interval: "month" | "week" | "year";
  stripePriceIdMonthly?: string;
  stripePriceIdYearly?: string;
  messages?: number;
  credits?: number;
}

export const PLANS: PlanConfig[] = [
  { id: "free", name: "Free", price: 0, interval: "month" },
  {
    id: "weekly_plus",
    name: "Weekly Plus",
    price: 7.99,
    interval: "week",
    stripePriceIdMonthly: process.env.STRIPE_PRICE_WEEKLY_PLUS,
    messages: 25,
  },
  {
    id: "pro",
    name: "Pro",
    price: 19.99,
    interval: "month",
    stripePriceIdMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
    stripePriceIdYearly: process.env.STRIPE_PRICE_PRO_YEARLY,
    messages: 100,
  },
  {
    id: "business",
    name: "Business",
    price: 49.99,
    interval: "month",
    stripePriceIdMonthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY,
    stripePriceIdYearly: process.env.STRIPE_PRICE_BUSINESS_YEARLY,
    messages: 300,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 199.99,
    interval: "month",
    stripePriceIdMonthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY,
    stripePriceIdYearly: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY,
    messages: 1000,
  },
];

export function getPlanConfig(planId: string): PlanConfig | undefined {
  return PLANS.find((p) => p.id === planId);
}

export function getStripePriceId(planId: string, yearly = false): string | undefined {
  const plan = getPlanConfig(planId);
  if (!plan) return undefined;
  return yearly ? plan.stripePriceIdYearly : plan.stripePriceIdMonthly;
}
