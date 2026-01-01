import { GanttBlock } from '@/lib/scheduling-engine';
import { useMemo } from 'react';

interface GanttChartProps {
  blocks: GanttBlock[];
  currentStep?: number;
  isAnimating?: boolean;
}

export const GanttChart = ({ blocks, currentStep, isAnimating }: GanttChartProps) => {
  const maxTime = useMemo(() => {
    if (blocks.length === 0) return 10;
    return Math.max(...blocks.map(b => b.endTime));
  }, [blocks]);

  const timeMarkers = useMemo(() => {
    const markers: number[] = [];
    const step = maxTime > 20 ? Math.ceil(maxTime / 20) : 1;
    for (let i = 0; i <= maxTime; i += step) {
      markers.push(i);
    }
    // Ensure the last marker is always shown
    if (markers[markers.length - 1] !== maxTime) {
      markers.push(maxTime);
    }
    return markers;
  }, [maxTime]);

  const getBlockWidth = (block: GanttBlock) => {
    const duration = block.endTime - block.startTime;
    return `${(duration / maxTime) * 100}%`;
  };

  const getBlockLeft = (block: GanttBlock) => {
    return `${(block.startTime / maxTime) * 100}%`;
  };

  const visibleBlocks = currentStep !== undefined
    ? blocks.filter(b => b.startTime <= currentStep)
    : blocks;

  // Get unique processes for legend (excluding idle)
  const uniqueProcesses = useMemo(() => {
    const seen = new Map<string, { id: string; name: string; color: string }>();
    blocks.forEach(b => {
      if (b.processId !== 'idle' && !seen.has(b.processId)) {
        seen.set(b.processId, { id: b.processId, name: b.processName, color: b.color });
      }
    });
    return Array.from(seen.values());
  }, [blocks]);

  if (blocks.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">Run the simulation to see the Gantt chart</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">CPU Timeline (Gantt Chart)</h3>
      
      <div className="rounded-lg border border-border bg-card/50 p-6 overflow-x-auto">
        {/* Gantt chart container */}
        <div className="relative min-w-[600px]">
          {/* Gantt blocks row */}
          <div className="relative h-14 mb-1 flex">
            {visibleBlocks.map((block, index) => {
              const isIdle = block.processId === 'idle';
              const isActive = currentStep !== undefined && 
                block.startTime <= currentStep && 
                block.endTime > currentStep;
              
              const duration = block.endTime - block.startTime;
              const widthPercent = (duration / maxTime) * 100;
              
              return (
                <div
                  key={`${block.processId}-${block.startTime}-${index}`}
                  className={`
                    absolute top-0 h-full flex items-center justify-center
                    border-x border-background/50
                    transition-all duration-200
                    ${isIdle 
                      ? 'bg-muted/30 border-dashed border-muted-foreground/30' 
                      : 'shadow-lg'
                    }
                    ${isActive && !isIdle ? 'ring-2 ring-primary ring-offset-1 ring-offset-background scale-[1.02] z-10' : ''}
                  `}
                  style={{
                    left: getBlockLeft(block),
                    width: getBlockWidth(block),
                    backgroundColor: isIdle ? undefined : block.color,
                    minWidth: '24px',
                    borderRadius: '6px',
                  }}
                >
                  <span className={`
                    font-mono font-bold text-xs
                    ${isIdle 
                      ? 'text-muted-foreground italic' 
                      : 'text-black/90 drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)]'
                    }
                    ${widthPercent < 5 ? 'hidden' : ''}
                  `}>
                    {isIdle ? 'IDLE' : block.processName}
                  </span>
                  {/* Show time range for wider blocks */}
                  {widthPercent >= 8 && (
                    <span className={`
                      absolute bottom-0.5 text-[9px] font-mono
                      ${isIdle ? 'text-muted-foreground/70' : 'text-black/60'}
                    `}>
                      {block.startTime}-{block.endTime}
                    </span>
                  )}
                </div>
              );
            })}

            {/* Current time indicator */}
            {currentStep !== undefined && currentStep <= maxTime && (
              <div
                className="absolute top-0 w-0.5 h-full bg-primary z-20 transition-all duration-200"
                style={{ left: `${(currentStep / maxTime) * 100}%` }}
              >
                <div className="absolute -top-2 -left-2 w-4 h-4 bg-primary rounded-full animate-pulse shadow-lg shadow-primary/50" />
                <div className="absolute -bottom-5 -left-2 text-[10px] font-mono text-primary font-bold">
                  t={currentStep}
                </div>
              </div>
            )}
          </div>

          {/* X-axis with time markers */}
          <div className="relative h-8 border-t-2 border-foreground/20 mt-2">
            {/* Axis line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-foreground/20" />
            
            {timeMarkers.map((time) => (
              <div
                key={time}
                className="absolute top-0 flex flex-col items-center"
                style={{ left: `${(time / maxTime) * 100}%`, transform: 'translateX(-50%)' }}
              >
                {/* Tick mark */}
                <div className="w-px h-3 bg-foreground/40" />
                {/* Time label */}
                <span className="text-xs text-foreground font-mono mt-1 bg-card px-1 rounded">
                  {time}
                </span>
              </div>
            ))}
            
            {/* X-axis label */}
            <div className="absolute right-0 -bottom-1 text-xs text-muted-foreground font-medium">
              Time →
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 items-center">
        <span className="text-xs text-muted-foreground font-medium">Legend:</span>
        {uniqueProcesses.map((process) => (
          <div key={process.id} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded shadow-sm border border-black/10"
              style={{ backgroundColor: process.color }}
            />
            <span className="text-sm font-mono text-foreground">{process.name}</span>
          </div>
        ))}
        {blocks.some(b => b.processId === 'idle') && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-dashed border-muted-foreground/50 bg-muted/30" />
            <span className="text-sm font-mono text-muted-foreground italic">Idle</span>
          </div>
        )}
      </div>
    </div>
  );
};
