import { useState } from 'react';
import { format, subDays, subMonths } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface DateRange {
  start: Date;
  end: Date;
}

interface DateRangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (range: DateRange) => void;
  currentRange: DateRange | null;
}

export function DateRangeDialog({ open, onOpenChange, onApply, currentRange }: DateRangeDialogProps) {
  const [startDate, setStartDate] = useState<string>(
    currentRange ? format(currentRange.start, 'yyyy-MM-dd') : ''
  );
  const [endDate, setEndDate] = useState<string>(
    currentRange ? format(currentRange.end, 'yyyy-MM-dd') : ''
  );
  const [error, setError] = useState<string | null>(null);

  const handleQuickSelect = (days: number) => {
    const end = new Date();
    const start = days <= 90 ? subDays(end, days) : subMonths(end, days / 30);
    setStartDate(format(start, 'yyyy-MM-dd'));
    setEndDate(format(end, 'yyyy-MM-dd'));
    setError(null);
  };

  const handleApply = () => {
    if (!startDate || !endDate) {
      setError('Please select both dates');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      setError('End date must be after start date');
      return;
    }

    onApply({ start, end });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Select Date Range</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Quick Select Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => handleQuickSelect(7)}>
              Last 7 days
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleQuickSelect(30)}>
              Last 30 days
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleQuickSelect(90)}>
              Last 3 months
            </Button>
          </div>

          {/* Date Inputs */}
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setError(null);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setError(null);
                }}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply}>
            Apply
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
