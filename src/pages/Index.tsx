import { useState, useEffect, useCallback, useMemo } from 'react';
import { Cpu, PlayCircle, BarChart3, BookOpen, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProcessInput } from '@/components/ProcessInput';
import { GanttChart } from '@/components/GanttChart';
import { MetricsTable } from '@/components/MetricsTable';
import { PlaybackControls } from '@/components/PlaybackControls';
import { AlgorithmSidebar } from '@/components/AlgorithmSidebar';
import { ComparisonCharts } from '@/components/ComparisonCharts';
import {
  Process,
  AlgorithmType,
  SchedulingEngine,
  SimulationResult,
  SimulationStep,
  PROCESS_COLORS,
} from '@/lib/scheduling-engine';

const defaultProcesses: Process[] = [
  { id: 'P1', name: 'P1', arrivalTime: 0, burstTime: 5, priority: 2, color: PROCESS_COLORS[0] },
  { id: 'P2', name: 'P2', arrivalTime: 1, burstTime: 3, priority: 1, color: PROCESS_COLORS[1] },
  { id: 'P3', name: 'P3', arrivalTime: 2, burstTime: 8, priority: 4, color: PROCESS_COLORS[2] },
  { id: 'P4', name: 'P4', arrivalTime: 3, burstTime: 2, priority: 3, color: PROCESS_COLORS[3] },
];

const Index = () => {
  const [processes, setProcesses] = useState<Process[]>(defaultProcesses);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>('fcfs');
  const [timeQuantum, setTimeQuantum] = useState(2);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [steps, setSteps] = useState<SimulationStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('simulation');

  const showPriority = selectedAlgorithm === 'priority-np' || selectedAlgorithm === 'priority-p';

  const runSimulation = useCallback(() => {
    const engine = new SchedulingEngine(processes, timeQuantum);
    const simResult = engine.run(selectedAlgorithm);
    const simSteps = engine.generateSteps(selectedAlgorithm);
    
    setResult(simResult);
    setSteps(simSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [processes, selectedAlgorithm, timeQuantum]);

  // Auto-run simulation when parameters change
  useEffect(() => {
    if (processes.length > 0) {
      runSimulation();
    }
  }, [processes, selectedAlgorithm, timeQuantum, runSimulation]);

  // Playback animation
  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length - 1) {
      if (currentStep >= steps.length - 1) setIsPlaying(false);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000 / speed);

    return () => clearInterval(interval);
  }, [isPlaying, currentStep, steps.length, speed]);

  const currentStepData = steps[currentStep] || {
    readyQueue: [],
    runningProcess: null,
    ganttChart: [],
    metrics: [],
  };

  return (
    <div className="min-h-screen bg-background dark">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4 gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 border border-primary/20">
              <Cpu className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">OS Scheduler</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">CPU Scheduling Simulator</p>
            </div>
          </div>

          <div className="flex-1" />

          <Button onClick={runSimulation} className="gap-2">
            <PlayCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Run Simulation</span>
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-14 z-40 h-[calc(100vh-3.5rem)] w-72 shrink-0 border-r border-border transition-transform lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <AlgorithmSidebar
            selectedAlgorithm={selectedAlgorithm}
            onAlgorithmChange={setSelectedAlgorithm}
            timeQuantum={timeQuantum}
            onTimeQuantumChange={setTimeQuantum}
          />
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-4 lg:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="simulation" className="gap-2">
                <Cpu className="h-4 w-4" />
                Simulation
              </TabsTrigger>
              <TabsTrigger value="comparison" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Compare
              </TabsTrigger>
            </TabsList>

            <TabsContent value="simulation" className="space-y-6">
              {/* Process Input */}
              <ProcessInput
                processes={processes}
                onProcessesChange={setProcesses}
                showPriority={showPriority}
              />

              {/* Gantt Chart */}
              <GanttChart
                blocks={result?.ganttChart || []}
                currentStep={isPlaying ? currentStep : undefined}
              />

              {/* Playback Controls & Metrics Grid */}
              <div className="grid gap-6 lg:grid-cols-2">
                <PlaybackControls
                  isPlaying={isPlaying}
                  currentStep={currentStep}
                  maxSteps={steps.length - 1}
                  speed={speed}
                  readyQueue={currentStepData.readyQueue}
                  runningProcess={currentStepData.runningProcess}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onNextStep={() => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))}
                  onReset={() => {
                    setCurrentStep(0);
                    setIsPlaying(false);
                  }}
                  onSpeedChange={setSpeed}
                  onStepChange={setCurrentStep}
                />

                <MetricsTable
                  metrics={result?.metrics || []}
                  avgWaitingTime={result?.avgWaitingTime || 0}
                  avgTurnaroundTime={result?.avgTurnaroundTime || 0}
                />
              </div>
            </TabsContent>

            <TabsContent value="comparison">
              <ComparisonCharts processes={processes} timeQuantum={timeQuantum} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Index;
