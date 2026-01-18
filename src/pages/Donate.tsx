import { Link } from "react-router-dom";
import { ArrowLeft, Heart, Check, Sparkles, History, Palette, Music, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const premiumFeatures = [
  { icon: Sparkles, label: "Custom prayer structure builder" },
  { icon: History, label: "Unlimited session history" },
  { icon: Palette, label: "Custom color themes" },
  { icon: Music, label: "Upload your own ambient audio" },
  { icon: Timer, label: "Meditation timer" },
];

export default function Donate() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-2xl px-4 py-8">
        {/* Back button */}
        <Link 
          to="/" 
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 inline-flex rounded-full bg-primary/10 p-4">
            <Heart className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            Support Selah
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Help keep Selah free and growing
          </p>
        </div>

        {/* Main content */}
        <Card className="mb-8 border-muted-foreground/20">
          <CardContent className="p-6 md:p-8">
            <p className="mb-6 text-center text-muted-foreground leading-relaxed">
              A one-time donation of $8-10 unlocks premium features and helps cover 
              hosting costs. No subscriptions, no recurring charges — just a simple 
              thank you for your support.
            </p>

            {/* Features list */}
            <div className="mb-8">
              <h2 className="mb-4 text-center font-serif text-lg font-medium text-foreground">
                Premium Features Included
              </h2>
              <ul className="space-y-3">
                {premiumFeatures.map((feature) => (
                  <li 
                    key={feature.label} 
                    className="flex items-center gap-3 text-foreground"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <feature.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm md:text-base">{feature.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Placeholder button */}
            <Button 
              disabled 
              className="w-full gap-2"
              size="lg"
            >
              <Heart className="h-4 w-4" />
              Donation System Coming Soon
            </Button>
          </CardContent>
        </Card>

        {/* Footer note */}
        <p className="text-center text-sm text-muted-foreground">
          Selah will always have a fully functional free tier. Your donation 
          unlocks extras, not essentials.
        </p>
      </div>
    </div>
  );
}
