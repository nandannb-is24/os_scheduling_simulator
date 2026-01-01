import { Play, Pause, SkipForward, RotateCcw, FastForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface PlaybackControlsProps {
  isPlaying: boolean;
  currentStep: number;
  maxSteps: number;
  speed: number;
  readyQueue: string[];
  runningProcess: string | null;
  onPlay: () => void;
  onPause: () => void;
  onNextStep: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onStepChange: (step: number) => void;
}

export const PlaybackControls = ({
  isPlaying,
  currentStep,
  maxSteps,
  speed,
  readyQueue,
  runningProcess,
  onPlay,
  onPause,
  onNextStep,
  onReset,
  onSpeedChange,
  onStepChange,
}: PlaybackControlsProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Step-by-Step Simulation</h3>
      
      <div className="rounded-lg border border-border bg-card p-4 space-y-4">
        {/* Timeline Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Time</span>
            <span className="font-mono font-medium text-foreground">{currentStep} / {maxSteps}</span>
          </div>
          <Slider
            value={[currentStep]}
            min={0}
            max={maxSteps}
            step={1}
            onValueChange={([value]) => onStepChange(value)}
            className="w-full"
          />
        </div>

        {/* Playback Buttons */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onReset}
            className="h-10 w-10"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          
          {isPlaying ? (
            <Button
              variant="default"
              size="icon"
              onClick={onPause}
              className="h-12 w-12"
            >
              <Pause className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              variant="default"
              size="icon"
              onClick={onPlay}
              className="h-12 w-12"
            >
              <Play className="h-5 w-5 ml-0.5" />
            </Button>
          )}
          
          <Button
            variant="outline"
            size="icon"
            onClick={onNextStep}
            disabled={currentStep >= maxSteps}
            className="h-10 w-10"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Speed Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <FastForward className="h-3 w-3" />
              Speed
            </span>
            <span className="font-mono font-medium text-foreground">{speed}x</span>
          </div>
          <Slider
            value={[speed]}
            min={0.5}
            max={3}
            step={0.5}
            onValueChange={([value]) => onSpeedChange(value)}
            className="w-full"
          />
        </div>

        {/* Current State Display */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Running</p>
            <div className="h-10 rounded-md bg-muted/50 flex items-center justify-center">
              {runningProcess ? (
                <span className="font-mono font-bold text-primary animate-pulse">{runningProcess}</span>
              ) : (
                <span className="text-muted-foreground text-sm">Idle</span>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Ready Queue</p>
            <div className="h-10 rounded-md bg-muted/50 flex items-center justify-center gap-2 overflow-x-auto px-2">
              {readyQueue.length > 0 ? (
                readyQueue.map((p, i) => (
                  <span key={i} className="font-mono text-sm text-foreground bg-secondary px-2 py-0.5 rounded">
                    {p}
                  </span>
                ))
              ) : (
                <span className="text-muted-foreground text-sm">Empty</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
