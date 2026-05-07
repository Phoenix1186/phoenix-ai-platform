"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Badge } from "@phoenix/ui";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "₦0",
    description: "Perfect for trying out Phoenix",
    features: [
      "1,000 API calls/month",
      "Access to all LLM models",
      "Community support",
      "Basic analytics",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "₦29,000",
    period: "/month",
    description: "For serious developers and teams",
    features: [
      "50,000 API calls/month",
      "Priority model access",
      "Email support",
      "Advanced analytics",
      "Custom model fine-tuning",
    ],
    cta: "Upgrade to Pro",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations",
    features: [
      "Unlimited API calls",
      "Dedicated infrastructure",
      "SLA guarantees",
      "24/7 priority support",
      "Custom model deployment",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Start free, scale as you grow. Pay with Paystack in Naira.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${plan.popular ? "border-orange-500 shadow-lg" : "border-slate-200"}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                  {plan.period && <span className="text-slate-500">{plan.period}</span>}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
