import { Button } from "@/components/ui/button";
import { Mic, MicOff, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioControlsProps {
  isRecording: boolean;
  onToggleRecording: () => void;
  onClear: () => void;
  volume: number;
}

export const AudioControls = ({
  isRecording,
  onToggleRecording,
  onClear,
  volume,
}: AudioControlsProps) => {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-lg font-semibold mb-3">Audio Capture</h2>
          
          {/* Volume indicator */}
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "absolute left-0 top-0 h-full rounded-full transition-all duration-100",
                isRecording ? "bg-gradient-primary" : "bg-muted-foreground/20"
              )}
              style={{ width: `${Math.min(volume * 100 * 2, 100)}%` }}
            />
          </div>
          
          <p className="text-xs text-muted-foreground mt-2">
            {isRecording ? 'Listening...' : 'Ready to record'}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            size="lg"
            variant={isRecording ? "destructive" : "default"}
            onClick={onToggleRecording}
            className={cn(
              "h-14 w-14 rounded-full transition-all",
              isRecording && "animate-pulse-glow"
            )}
          >
            {isRecording ? (
              <MicOff className="h-6 w-6" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={onClear}
            className="h-14 w-14 rounded-full"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
