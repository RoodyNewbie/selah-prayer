import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Loader2 } from 'lucide-react';
import { useDonor } from '@/contexts/DonorContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface DonorGateProps {
  children?: React.ReactNode;
  fallback?: React.ReactNode;
  featureName?: string;
}

export function DonorGate({ children, fallback, featureName }: DonorGateProps) {
  const { isDonor, isLoading } = useDonor();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isDonor && children) {
    return <>{children}</>;
  }

  if (isDonor && !children) {
    return null;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Card className="border-dashed border-muted-foreground/30 bg-muted/30">
      <CardContent className="flex flex-col items-center justify-center p-6 text-center">
        <div className="mb-4 rounded-full bg-primary/10 p-3">
          <Heart className="h-6 w-6 text-primary" />
        </div>
        <h3 className="mb-2 font-serif text-lg font-medium text-foreground">
          Unlock {featureName || 'this feature'}
        </h3>
        <p className="mb-4 max-w-sm text-sm text-muted-foreground">
          Support Selah to unlock premium features.
        </p>
        <Button asChild variant="outline" size="sm" className="gap-2">
          <Link to="/donate">
            <Heart className="h-4 w-4" />
            Learn More
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
