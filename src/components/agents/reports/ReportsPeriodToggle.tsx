import { Button } from '@/components/ui/button';
import { REPORTS_PERIOD_OPTIONS, type ReportsPeriod } from '@/lib/agents/reports/period';
import { setReportsPeriod, useReportsPeriod } from '@/lib/agents/reports/period-store';
import { track } from '@/lib/agents/reports/analytics';

export function ReportsPeriodToggle({ eventName }: { eventName: string }) {
  const period = useReportsPeriod();

  return (
    <div className="flex gap-2">
      {REPORTS_PERIOD_OPTIONS.map((opt) => (
        <Button
          key={opt.value}
          size="sm"
          variant={period === opt.value ? 'default' : 'outline'}
          onClick={() => {
            const from: ReportsPeriod = period;
            const to: ReportsPeriod = opt.value;
            if (from === to) return;
            setReportsPeriod(to);
            track(eventName, { from, to });
          }}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  );
}
