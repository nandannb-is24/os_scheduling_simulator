import { AlgorithmType, ALGORITHM_INFO } from '@/lib/scheduling-engine';
import { ChevronRight, Clock, Zap, Timer, RotateCcw, Shield, ShieldAlert, CheckCircle, XCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AlgorithmSidebarProps {
  selectedAlgorithm: AlgorithmType;
  onAlgorithmChange: (algorithm: AlgorithmType) => void;
  timeQuantum: number;
  onTimeQuantumChange: (value: number) => void;
}

const algorithmOptions: { value: AlgorithmType; label: string; icon: React.ReactNode }[] = [
  { value: 'fcfs', label: 'First-Come, First-Served', icon: <Clock className="h-4 w-4" /> },
  { value: 'sjf', label: 'Shortest Job First', icon: <Zap className="h-4 w-4" /> },
  { value: 'srtf', label: 'Shortest Remaining Time', icon: <Timer className="h-4 w-4" /> },
  { value: 'rr', label: 'Round Robin', icon: <RotateCcw className="h-4 w-4" /> },
  { value: 'priority-np', label: 'Priority (Non-Preemptive)', icon: <Shield className="h-4 w-4" /> },
  { value: 'priority-p', label: 'Priority (Preemptive)', icon: <ShieldAlert className="h-4 w-4" /> },
];

export const AlgorithmSidebar = ({
  selectedAlgorithm,
  onAlgorithmChange,
  timeQuantum,
  onTimeQuantumChange,
}: AlgorithmSidebarProps) => {
  const currentInfo = ALGORITHM_INFO[selectedAlgorithm];

  return (
    <div className="h-full flex flex-col bg-sidebar">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="text-lg font-bold text-sidebar-foreground flex items-center gap-2">
          <Info className="h-5 w-5 text-sidebar-primary" />
          Algorithms
        </h2>
        <p className="text-xs text-muted-foreground mt-1">Select an algorithm to learn and simulate</p>
      </div>

      {/* Algorithm List */}
      <div className="p-2 space-y-1 border-b border-sidebar-border">
        {algorithmOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onAlgorithmChange(option.value)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-all text-sm",
              selectedAlgorithm === option.value
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent"
            )}
          >
            {option.icon}
            <span className="flex-1 truncate">{option.label}</span>
            {selectedAlgorithm === option.value && (
              <ChevronRight className="h-4 w-4 flex-shrink-0" />
            )}
          </button>
        ))}
      </div>

      {/* Time Quantum for RR */}
      {selectedAlgorithm === 'rr' && (
        <div className="p-4 border-b border-sidebar-border">
          <Label htmlFor="quantum" className="text-sm text-sidebar-foreground">Time Quantum</Label>
          <Input
            id="quantum"
            type="number"
            min={1}
            max={10}
            value={timeQuantum}
            onChange={(e) => onTimeQuantumChange(Math.max(1, parseInt(e.target.value) || 1))}
            className="mt-2 font-mono bg-sidebar-accent"
          />
        </div>
      )}

      {/* Algorithm Info */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <h3 className="font-semibold text-sidebar-foreground mb-2">{currentInfo.name}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{currentInfo.description}</p>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-sidebar-foreground flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Advantages
          </h4>
          <ul className="space-y-1">
            {currentInfo.advantages.map((adv, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                {adv}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-sidebar-foreground flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-400" />
            Disadvantages
          </h4>
          <ul className="space-y-1">
            {currentInfo.disadvantages.map((dis, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-red-400 mt-0.5">•</span>
                {dis}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
