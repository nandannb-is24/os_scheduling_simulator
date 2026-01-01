import { ProcessMetrics } from '@/lib/scheduling-engine';

interface MetricsTableProps {
  metrics: ProcessMetrics[];
  avgWaitingTime: number;
  avgTurnaroundTime: number;
}

export const MetricsTable = ({ metrics, avgWaitingTime, avgTurnaroundTime }: MetricsTableProps) => {
  if (metrics.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">Run the simulation to see metrics</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Performance Metrics</h3>
      
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Process
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  AT
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  BT
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  CT
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  TAT
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  WT
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {metrics.map((m) => (
                <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: m.color }}
                      />
                      <span className="font-mono font-medium text-foreground">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-muted-foreground">{m.arrivalTime}</td>
                  <td className="px-4 py-3 text-center font-mono text-muted-foreground">{m.burstTime}</td>
                  <td className="px-4 py-3 text-center font-mono text-foreground font-medium">{m.completionTime}</td>
                  <td className="px-4 py-3 text-center font-mono text-foreground font-medium">{m.turnaroundTime}</td>
                  <td className="px-4 py-3 text-center font-mono text-foreground font-medium">{m.waitingTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Averages */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-primary/10 border border-primary/20 p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Avg. Waiting Time</p>
          <p className="text-2xl font-bold font-mono text-primary">{avgWaitingTime.toFixed(2)}</p>
        </div>
        <div className="rounded-lg bg-accent/10 border border-accent/20 p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Avg. Turnaround Time</p>
          <p className="text-2xl font-bold font-mono text-accent">{avgTurnaroundTime.toFixed(2)}</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span><strong>AT</strong> = Arrival Time</span>
        <span><strong>BT</strong> = Burst Time</span>
        <span><strong>CT</strong> = Completion Time</span>
        <span><strong>TAT</strong> = Turnaround Time (CT - AT)</span>
        <span><strong>WT</strong> = Waiting Time (TAT - BT)</span>
      </div>
    </div>
  );
};
