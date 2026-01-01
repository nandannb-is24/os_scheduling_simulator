// Object-Oriented Scheduling Engine for Mathematical Accuracy

export interface Process {
  id: string;
  name: string;
  arrivalTime: number;
  burstTime: number;
  priority: number;
  color: string;
}

export interface ProcessMetrics extends Process {
  completionTime: number;
  turnaroundTime: number;
  waitingTime: number;
  remainingTime: number;
}

export interface GanttBlock {
  processId: string;
  processName: string;
  startTime: number;
  endTime: number;
  color: string;
}

export interface SimulationResult {
  ganttChart: GanttBlock[];
  metrics: ProcessMetrics[];
  avgWaitingTime: number;
  avgTurnaroundTime: number;
}

export interface SimulationStep {
  currentTime: number;
  runningProcess: string | null;
  readyQueue: string[];
  ganttChart: GanttBlock[];
  metrics: ProcessMetrics[];
}

export type AlgorithmType = 'fcfs' | 'sjf' | 'srtf' | 'rr' | 'priority-np' | 'priority-p';

export const PROCESS_COLORS = [
  'hsl(180, 100%, 50%)',  // Cyan
  'hsl(320, 100%, 60%)',  // Magenta
  'hsl(45, 100%, 50%)',   // Yellow
  'hsl(120, 100%, 45%)',  // Green
  'hsl(30, 100%, 55%)',   // Orange
  'hsl(200, 100%, 60%)',  // Light Blue
  'hsl(280, 100%, 65%)',  // Purple
  'hsl(0, 100%, 60%)',    // Red
];

export class SchedulingEngine {
  private processes: Process[];
  private timeQuantum: number;

  constructor(processes: Process[], timeQuantum: number = 2) {
    this.processes = [...processes];
    this.timeQuantum = timeQuantum;
  }

  private initMetrics(): ProcessMetrics[] {
    return this.processes.map(p => ({
      ...p,
      completionTime: 0,
      turnaroundTime: 0,
      waitingTime: 0,
      remainingTime: p.burstTime,
    }));
  }

  private calculateAverages(metrics: ProcessMetrics[]): { avgWaitingTime: number; avgTurnaroundTime: number } {
    const n = metrics.length;
    if (n === 0) return { avgWaitingTime: 0, avgTurnaroundTime: 0 };
    
    const avgWaitingTime = metrics.reduce((sum, m) => sum + m.waitingTime, 0) / n;
    const avgTurnaroundTime = metrics.reduce((sum, m) => sum + m.turnaroundTime, 0) / n;
    
    return { avgWaitingTime, avgTurnaroundTime };
  }

  // First-Come, First-Served
  fcfs(): SimulationResult {
    const metrics = this.initMetrics();
    const ganttChart: GanttBlock[] = [];
    
    // Sort by arrival time
    const sorted = [...metrics].sort((a, b) => a.arrivalTime - b.arrivalTime);
    let currentTime = 0;

    for (const process of sorted) {
      // Add idle time if there's a gap
      if (currentTime < process.arrivalTime) {
        ganttChart.push({
          processId: 'idle',
          processName: 'Idle',
          startTime: currentTime,
          endTime: process.arrivalTime,
          color: 'transparent',
        });
        currentTime = process.arrivalTime;
      }

      const startTime = currentTime;
      const endTime = currentTime + process.burstTime;

      ganttChart.push({
        processId: process.id,
        processName: process.name,
        startTime,
        endTime,
        color: process.color,
      });

      const idx = metrics.findIndex(m => m.id === process.id);
      metrics[idx].completionTime = endTime;
      metrics[idx].turnaroundTime = endTime - process.arrivalTime;
      metrics[idx].waitingTime = metrics[idx].turnaroundTime - process.burstTime;

      currentTime = endTime;
    }

    return { ganttChart, metrics, ...this.calculateAverages(metrics) };
  }

  // Shortest Job First (Non-Preemptive)
  sjf(): SimulationResult {
    const metrics = this.initMetrics();
    const ganttChart: GanttBlock[] = [];
    const completed: Set<string> = new Set();
    let currentTime = 0;

    while (completed.size < metrics.length) {
      // Get available processes
      const available = metrics.filter(
        m => m.arrivalTime <= currentTime && !completed.has(m.id)
      );

      if (available.length === 0) {
        // Add idle block for this time unit
        const lastBlock = ganttChart[ganttChart.length - 1];
        if (lastBlock && lastBlock.processId === 'idle') {
          lastBlock.endTime = currentTime + 1;
        } else {
          ganttChart.push({
            processId: 'idle',
            processName: 'Idle',
            startTime: currentTime,
            endTime: currentTime + 1,
            color: 'transparent',
          });
        }
        currentTime++;
        continue;
      }

      // Select shortest job
      const shortest = available.reduce((min, p) => 
        p.burstTime < min.burstTime ? p : min
      );

      const startTime = currentTime;
      const endTime = currentTime + shortest.burstTime;

      ganttChart.push({
        processId: shortest.id,
        processName: shortest.name,
        startTime,
        endTime,
        color: shortest.color,
      });

      const idx = metrics.findIndex(m => m.id === shortest.id);
      metrics[idx].completionTime = endTime;
      metrics[idx].turnaroundTime = endTime - shortest.arrivalTime;
      metrics[idx].waitingTime = metrics[idx].turnaroundTime - shortest.burstTime;

      completed.add(shortest.id);
      currentTime = endTime;
    }

    return { ganttChart, metrics, ...this.calculateAverages(metrics) };
  }

  // Shortest Remaining Time First (Preemptive)
  srtf(): SimulationResult {
    const metrics = this.initMetrics();
    const ganttChart: GanttBlock[] = [];
    let currentTime = 0;
    let lastProcessId: string | null = null;
    let lastStartTime = 0;

    const maxTime = Math.max(...metrics.map(m => m.arrivalTime)) + 
                   metrics.reduce((sum, m) => sum + m.burstTime, 0);

    while (metrics.some(m => m.remainingTime > 0) && currentTime <= maxTime) {
      const available = metrics.filter(
        m => m.arrivalTime <= currentTime && m.remainingTime > 0
      );

      if (available.length === 0) {
        if (lastProcessId !== null) {
          ganttChart.push({
            processId: lastProcessId,
            processName: metrics.find(m => m.id === lastProcessId)!.name,
            startTime: lastStartTime,
            endTime: currentTime,
            color: metrics.find(m => m.id === lastProcessId)!.color,
          });
          lastProcessId = null;
        }
        // Add idle block
        const lastBlock = ganttChart[ganttChart.length - 1];
        if (lastBlock && lastBlock.processId === 'idle') {
          lastBlock.endTime = currentTime + 1;
        } else {
          ganttChart.push({
            processId: 'idle',
            processName: 'Idle',
            startTime: currentTime,
            endTime: currentTime + 1,
            color: 'transparent',
          });
        }
        currentTime++;
        continue;
      }

      const shortest = available.reduce((min, p) =>
        p.remainingTime < min.remainingTime ? p : min
      );

      if (lastProcessId !== shortest.id) {
        if (lastProcessId !== null) {
          ganttChart.push({
            processId: lastProcessId,
            processName: metrics.find(m => m.id === lastProcessId)!.name,
            startTime: lastStartTime,
            endTime: currentTime,
            color: metrics.find(m => m.id === lastProcessId)!.color,
          });
        }
        lastProcessId = shortest.id;
        lastStartTime = currentTime;
      }

      const idx = metrics.findIndex(m => m.id === shortest.id);
      metrics[idx].remainingTime--;
      currentTime++;

      if (metrics[idx].remainingTime === 0) {
        metrics[idx].completionTime = currentTime;
        metrics[idx].turnaroundTime = currentTime - metrics[idx].arrivalTime;
        metrics[idx].waitingTime = metrics[idx].turnaroundTime - metrics[idx].burstTime;
        
        ganttChart.push({
          processId: shortest.id,
          processName: shortest.name,
          startTime: lastStartTime,
          endTime: currentTime,
          color: shortest.color,
        });
        lastProcessId = null;
      }
    }

    return { ganttChart, metrics, ...this.calculateAverages(metrics) };
  }

  // Round Robin
  roundRobin(): SimulationResult {
    const metrics = this.initMetrics();
    const ganttChart: GanttBlock[] = [];
    const queue: string[] = [];
    let currentTime = 0;

    // Sort by arrival time initially
    const sorted = [...metrics].sort((a, b) => a.arrivalTime - b.arrivalTime);
    let nextArrival = 0;

    // Add initially arrived processes
    while (nextArrival < sorted.length && sorted[nextArrival].arrivalTime <= currentTime) {
      queue.push(sorted[nextArrival].id);
      nextArrival++;
    }

    while (queue.length > 0 || nextArrival < sorted.length) {
      if (queue.length === 0) {
        // Add idle time until next process arrives
        const nextArrivalTime = sorted[nextArrival].arrivalTime;
        if (currentTime < nextArrivalTime) {
          ganttChart.push({
            processId: 'idle',
            processName: 'Idle',
            startTime: currentTime,
            endTime: nextArrivalTime,
            color: 'transparent',
          });
        }
        currentTime = nextArrivalTime;
        while (nextArrival < sorted.length && sorted[nextArrival].arrivalTime <= currentTime) {
          queue.push(sorted[nextArrival].id);
          nextArrival++;
        }
      }

      const processId = queue.shift()!;
      const idx = metrics.findIndex(m => m.id === processId);
      const process = metrics[idx];

      const executeTime = Math.min(this.timeQuantum, process.remainingTime);
      const startTime = currentTime;
      const endTime = currentTime + executeTime;

      ganttChart.push({
        processId: process.id,
        processName: process.name,
        startTime,
        endTime,
        color: process.color,
      });

      metrics[idx].remainingTime -= executeTime;
      currentTime = endTime;

      // Add newly arrived processes
      while (nextArrival < sorted.length && sorted[nextArrival].arrivalTime <= currentTime) {
        queue.push(sorted[nextArrival].id);
        nextArrival++;
      }

      // If process not finished, add back to queue
      if (metrics[idx].remainingTime > 0) {
        queue.push(processId);
      } else {
        metrics[idx].completionTime = currentTime;
        metrics[idx].turnaroundTime = currentTime - process.arrivalTime;
        metrics[idx].waitingTime = metrics[idx].turnaroundTime - process.burstTime;
      }
    }

    return { ganttChart, metrics, ...this.calculateAverages(metrics) };
  }

  // Priority Scheduling (Non-Preemptive)
  priorityNonPreemptive(): SimulationResult {
    const metrics = this.initMetrics();
    const ganttChart: GanttBlock[] = [];
    const completed: Set<string> = new Set();
    let currentTime = 0;

    while (completed.size < metrics.length) {
      const available = metrics.filter(
        m => m.arrivalTime <= currentTime && !completed.has(m.id)
      );

      if (available.length === 0) {
        // Add idle block for this time unit
        const lastBlock = ganttChart[ganttChart.length - 1];
        if (lastBlock && lastBlock.processId === 'idle') {
          lastBlock.endTime = currentTime + 1;
        } else {
          ganttChart.push({
            processId: 'idle',
            processName: 'Idle',
            startTime: currentTime,
            endTime: currentTime + 1,
            color: 'transparent',
          });
        }
        currentTime++;
        continue;
      }

      // Lower number = higher priority
      const highest = available.reduce((max, p) =>
        p.priority < max.priority ? p : max
      );

      const startTime = currentTime;
      const endTime = currentTime + highest.burstTime;

      ganttChart.push({
        processId: highest.id,
        processName: highest.name,
        startTime,
        endTime,
        color: highest.color,
      });

      const idx = metrics.findIndex(m => m.id === highest.id);
      metrics[idx].completionTime = endTime;
      metrics[idx].turnaroundTime = endTime - highest.arrivalTime;
      metrics[idx].waitingTime = metrics[idx].turnaroundTime - highest.burstTime;

      completed.add(highest.id);
      currentTime = endTime;
    }

    return { ganttChart, metrics, ...this.calculateAverages(metrics) };
  }

  // Priority Scheduling (Preemptive)
  priorityPreemptive(): SimulationResult {
    const metrics = this.initMetrics();
    const ganttChart: GanttBlock[] = [];
    let currentTime = 0;
    let lastProcessId: string | null = null;
    let lastStartTime = 0;

    const maxTime = Math.max(...metrics.map(m => m.arrivalTime)) +
                   metrics.reduce((sum, m) => sum + m.burstTime, 0);

    while (metrics.some(m => m.remainingTime > 0) && currentTime <= maxTime) {
      const available = metrics.filter(
        m => m.arrivalTime <= currentTime && m.remainingTime > 0
      );

      if (available.length === 0) {
        if (lastProcessId !== null) {
          ganttChart.push({
            processId: lastProcessId,
            processName: metrics.find(m => m.id === lastProcessId)!.name,
            startTime: lastStartTime,
            endTime: currentTime,
            color: metrics.find(m => m.id === lastProcessId)!.color,
          });
          lastProcessId = null;
        }
        // Add idle block
        const lastBlock = ganttChart[ganttChart.length - 1];
        if (lastBlock && lastBlock.processId === 'idle') {
          lastBlock.endTime = currentTime + 1;
        } else {
          ganttChart.push({
            processId: 'idle',
            processName: 'Idle',
            startTime: currentTime,
            endTime: currentTime + 1,
            color: 'transparent',
          });
        }
        currentTime++;
        continue;
      }

      const highest = available.reduce((max, p) =>
        p.priority < max.priority ? p : max
      );

      if (lastProcessId !== highest.id) {
        if (lastProcessId !== null) {
          ganttChart.push({
            processId: lastProcessId,
            processName: metrics.find(m => m.id === lastProcessId)!.name,
            startTime: lastStartTime,
            endTime: currentTime,
            color: metrics.find(m => m.id === lastProcessId)!.color,
          });
        }
        lastProcessId = highest.id;
        lastStartTime = currentTime;
      }

      const idx = metrics.findIndex(m => m.id === highest.id);
      metrics[idx].remainingTime--;
      currentTime++;

      if (metrics[idx].remainingTime === 0) {
        metrics[idx].completionTime = currentTime;
        metrics[idx].turnaroundTime = currentTime - metrics[idx].arrivalTime;
        metrics[idx].waitingTime = metrics[idx].turnaroundTime - metrics[idx].burstTime;

        ganttChart.push({
          processId: highest.id,
          processName: highest.name,
          startTime: lastStartTime,
          endTime: currentTime,
          color: highest.color,
        });
        lastProcessId = null;
      }
    }

    return { ganttChart, metrics, ...this.calculateAverages(metrics) };
  }

  run(algorithm: AlgorithmType): SimulationResult {
    switch (algorithm) {
      case 'fcfs':
        return this.fcfs();
      case 'sjf':
        return this.sjf();
      case 'srtf':
        return this.srtf();
      case 'rr':
        return this.roundRobin();
      case 'priority-np':
        return this.priorityNonPreemptive();
      case 'priority-p':
        return this.priorityPreemptive();
      default:
        return this.fcfs();
    }
  }

  // Generate step-by-step simulation
  generateSteps(algorithm: AlgorithmType): SimulationStep[] {
    const result = this.run(algorithm);
    const steps: SimulationStep[] = [];
    const maxTime = result.ganttChart.length > 0 
      ? result.ganttChart[result.ganttChart.length - 1].endTime 
      : 0;

    for (let t = 0; t <= maxTime; t++) {
      const currentBlock = result.ganttChart.find(
        b => b.startTime <= t && b.endTime > t
      );
      
      const readyQueue = this.processes
        .filter(p => {
          const metrics = result.metrics.find(m => m.id === p.id);
          return p.arrivalTime <= t && 
                 metrics && 
                 (metrics.completionTime === 0 || metrics.completionTime > t) &&
                 currentBlock?.processId !== p.id;
        })
        .map(p => p.name);

      const ganttUpToNow = result.ganttChart.filter(b => b.startTime <= t);

      steps.push({
        currentTime: t,
        runningProcess: currentBlock?.processName || null,
        readyQueue,
        ganttChart: ganttUpToNow,
        metrics: result.metrics,
      });
    }

    return steps;
  }
}

export const ALGORITHM_INFO: Record<AlgorithmType, {
  name: string;
  description: string;
  advantages: string[];
  disadvantages: string[];
}> = {
  fcfs: {
    name: 'First-Come, First-Served (FCFS)',
    description: 'Processes are executed in the order they arrive in the ready queue. The first process to request the CPU gets it first.',
    advantages: [
      'Simple to understand and implement',
      'No starvation - every process gets executed',
      'Fair in terms of arrival order',
    ],
    disadvantages: [
      'Convoy Effect - short processes wait for long ones',
      'High average waiting time',
      'Non-preemptive - no priority handling',
    ],
  },
  sjf: {
    name: 'Shortest Job First (SJF)',
    description: 'Selects the process with the smallest burst time. Non-preemptive version runs the selected process to completion.',
    advantages: [
      'Optimal average waiting time for non-preemptive',
      'Reduces average turnaround time',
      'Efficient for batch systems',
    ],
    disadvantages: [
      'Starvation possible for long processes',
      'Requires knowing burst time in advance',
      'Not suitable for interactive systems',
    ],
  },
  srtf: {
    name: 'Shortest Remaining Time First (SRTF)',
    description: 'Preemptive version of SJF. The process with the shortest remaining time is always selected. New arrivals can preempt the running process.',
    advantages: [
      'Optimal average waiting time',
      'Better response time than SJF',
      'Efficient CPU utilization',
    ],
    disadvantages: [
      'High overhead due to frequent context switches',
      'Starvation for longer processes',
      'Requires continuous burst time monitoring',
    ],
  },
  rr: {
    name: 'Round Robin (RR)',
    description: 'Each process gets a fixed time quantum. After the quantum expires, the process is moved to the back of the queue.',
    advantages: [
      'Fair - all processes get equal CPU time',
      'Good response time for short processes',
      'No starvation',
    ],
    disadvantages: [
      'Performance depends on time quantum size',
      'Higher average waiting time than SJF',
      'Context switch overhead',
    ],
  },
  'priority-np': {
    name: 'Priority Scheduling (Non-Preemptive)',
    description: 'Each process has a priority. The highest priority process (lowest number) is selected. Once started, it runs to completion.',
    advantages: [
      'Important processes run first',
      'Good for real-time systems',
      'Flexible priority assignment',
    ],
    disadvantages: [
      'Starvation for low-priority processes',
      'Priority inversion problems',
      'No guarantee for response time',
    ],
  },
  'priority-p': {
    name: 'Priority Scheduling (Preemptive)',
    description: 'Like non-preemptive, but a higher priority process can preempt the current running process.',
    advantages: [
      'Immediate response for high-priority processes',
      'Better for real-time systems',
      'Dynamic priority adjustment possible',
    ],
    disadvantages: [
      'More context switches',
      'Starvation for low-priority processes',
      'Complex implementation',
    ],
  },
};
