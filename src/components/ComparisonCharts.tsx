import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Process, SchedulingEngine, AlgorithmType, ALGORITHM_INFO } from '@/lib/scheduling-engine';

interface ComparisonChartsProps {
  processes: Process[];
  timeQuantum: number;
}

const algorithmKeys: AlgorithmType[] = ['fcfs', 'sjf', 'srtf', 'rr', 'priority-np', 'priority-p'];

export const ComparisonCharts = ({ processes, timeQuantum }: ComparisonChartsProps) => {
  const comparisonData = useMemo(() => {
    if (processes.length === 0) return [];

    return algorithmKeys.map((algo) => {
      const engine = new SchedulingEngine(processes, timeQuantum);
      const result = engine.run(algo);
      
      return {
        name: ALGORITHM_INFO[algo].name.split('(')[0].trim().replace(' Scheduling', ''),
        'Avg WT': parseFloat(result.avgWaitingTime.toFixed(2)),
        'Avg TAT': parseFloat(result.avgTurnaroundTime.toFixed(2)),
      };
    });
  }, [processes, timeQuantum]);

  if (processes.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">Add processes to see algorithm comparison</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Algorithm Comparison</h3>
      
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Average Waiting Time Chart */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h4 className="text-sm font-medium text-muted-foreground mb-4">Average Waiting Time</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} 
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar 
                  dataKey="Avg WT" 
                  fill="hsl(var(--primary))" 
                  radius={[0, 4, 4, 0]}
                  name="Avg Waiting Time"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Average Turnaround Time Chart */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h4 className="text-sm font-medium text-muted-foreground mb-4">Average Turnaround Time</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} 
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar 
                  dataKey="Avg TAT" 
                  fill="hsl(var(--accent))" 
                  radius={[0, 4, 4, 0]}
                  name="Avg Turnaround Time"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Algorithm
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Avg Waiting Time
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Avg Turnaround Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {comparisonData.map((row) => (
                <tr key={row.name} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{row.name}</td>
                  <td className="px-4 py-3 text-center font-mono text-primary">{row['Avg WT']}</td>
                  <td className="px-4 py-3 text-center font-mono text-accent">{row['Avg TAT']}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
