import { useState } from 'react';
import { Plus, Trash2, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Process, PROCESS_COLORS } from '@/lib/scheduling-engine';

interface ProcessInputProps {
  processes: Process[];
  onProcessesChange: (processes: Process[]) => void;
  showPriority: boolean;
}

export const ProcessInput = ({ processes, onProcessesChange, showPriority }: ProcessInputProps) => {
  const addProcess = () => {
    const id = `P${processes.length + 1}`;
    const newProcess: Process = {
      id,
      name: id,
      arrivalTime: 0,
      burstTime: 1,
      priority: 1,
      color: PROCESS_COLORS[processes.length % PROCESS_COLORS.length],
    };
    onProcessesChange([...processes, newProcess]);
  };

  const removeProcess = (id: string) => {
    if (processes.length > 1) {
      const updated = processes.filter(p => p.id !== id);
      onProcessesChange(updated);
    }
  };

  const updateProcess = (id: string, field: keyof Process, value: number) => {
    const updated = processes.map(p =>
      p.id === id ? { ...p, [field]: Math.max(0, value) } : p
    );
    onProcessesChange(updated);
  };

  const generateRandom = () => {
    const count = Math.floor(Math.random() * 4) + 3; // 3-6 processes
    const newProcesses: Process[] = [];
    for (let i = 0; i < count; i++) {
      newProcesses.push({
        id: `P${i + 1}`,
        name: `P${i + 1}`,
        arrivalTime: Math.floor(Math.random() * 8),
        burstTime: Math.floor(Math.random() * 8) + 1,
        priority: Math.floor(Math.random() * 5) + 1,
        color: PROCESS_COLORS[i % PROCESS_COLORS.length],
      });
    }
    onProcessesChange(newProcesses);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Process Queue</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={generateRandom}
            className="gap-2"
          >
            <Shuffle className="h-4 w-4" />
            Random
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={addProcess}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Process
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Process
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Arrival Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Burst Time
                </th>
                {showPriority && (
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Priority
                  </th>
                )}
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {processes.map((process) => (
                <tr key={process.id} className="group hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full ring-2 ring-offset-2 ring-offset-card"
                        style={{ backgroundColor: process.color, boxShadow: `0 0 10px ${process.color}` }}
                      />
                      <span className="font-mono font-medium text-foreground">{process.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      type="number"
                      min={0}
                      value={process.arrivalTime}
                      onChange={(e) => updateProcess(process.id, 'arrivalTime', parseInt(e.target.value) || 0)}
                      className="w-20 font-mono bg-background"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      type="number"
                      min={1}
                      value={process.burstTime}
                      onChange={(e) => updateProcess(process.id, 'burstTime', Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 font-mono bg-background"
                    />
                  </td>
                  {showPriority && (
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        min={1}
                        value={process.priority}
                        onChange={(e) => updateProcess(process.id, 'priority', Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20 font-mono bg-background"
                      />
                    </td>
                  )}
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeProcess(process.id)}
                      disabled={processes.length <= 1}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {showPriority ? '* Lower priority number = Higher priority' : ''}
      </p>
    </div>
  );
};
