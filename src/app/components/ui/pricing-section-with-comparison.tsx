"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { Button } from "./button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";
import { cn } from "./utils";

interface PricingFeature {
  name: string;
  included: boolean;
}

interface PricingTier {
  name: string;
  description: string;
  price: string;
  pricePeriod?: string;
  features: PricingFeature[];
  buttonText: string;
  buttonVariant?: "default" | "outline";
  popular?: boolean;
}

interface PricingProps {
  tiers?: PricingTier[];
}

const defaultTiers: PricingTier[] = [
  {
    name: "Starter",
    description: "Perfect for individuals and small teams",
    price: "$9",
    pricePeriod: "/month",
    features: [
      { name: "Up to 5 repositories", included: true },
      { name: "Basic analytics", included: true },
      { name: "Email support", included: true },
      { name: "Advanced analytics", included: false },
      { name: "Priority support", included: false },
      { name: "Custom integrations", included: false },
    ],
    buttonText: "Get Started",
    buttonVariant: "outline",
  },
  {
    name: "Professional",
    description: "For growing teams and businesses",
    price: "$29",
    pricePeriod: "/month",
    features: [
      { name: "Up to 20 repositories", included: true },
      { name: "Advanced analytics", included: true },
      { name: "Priority support", included: true },
      { name: "Custom integrations", included: true },
      { name: "Team collaboration", included: true },
      { name: "API access", included: false },
    ],
    buttonText: "Get Started",
    buttonVariant: "default",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "For large organizations",
    price: "Custom",
    pricePeriod: "",
    features: [
      { name: "Unlimited repositories", included: true },
      { name: "Advanced analytics", included: true },
      { name: "24/7 priority support", included: true },
      { name: "Custom integrations", included: true },
      { name: "Team collaboration", included: true },
      { name: "API access", included: true },
    ],
    buttonText: "Contact Sales",
    buttonVariant: "outline",
  },
];

export function Pricing({ tiers = defaultTiers }: PricingProps) {
  return (
    <div className="w-full py-12 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Pricing</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose the plan that's right for you
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {tiers.map((tier, index) => (
            <Card
              key={tier.name}
              className={cn(
                "relative flex flex-col",
                tier.popular && "border-primary shadow-lg scale-105"
              )}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  {tier.pricePeriod && (
                    <span className="text-muted-foreground ml-1">
                      {tier.pricePeriod}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {tier.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-start gap-2"
                    >
                      {feature.included ? (
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      ) : (
                        <div className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      )}
                      <span
                        className={cn(
                          "text-sm",
                          !feature.included && "text-muted-foreground line-through"
                        )}
                      >
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant={tier.buttonVariant || "default"}
                  className="w-full"
                >
                  {tier.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
