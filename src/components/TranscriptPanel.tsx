import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface TranscriptSegment {
  id: string;
  text: string;
  timestamp: Date;
  isFinal: boolean;
}

interface TranscriptPanelProps {
  segments: TranscriptSegment[];
}

export const TranscriptPanel = ({ segments }: TranscriptPanelProps) => {
  return (
    <div className="glass rounded-2xl p-6 h-full flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Live Transcript</h2>
      
      <ScrollArea className="flex-1">
        <div className="space-y-3">
          {segments.length === 0 ? (
            <p className="text-muted-foreground text-sm italic">
              Start recording to see transcription...
            </p>
          ) : (
            segments.map((segment) => (
              <div
                key={segment.id}
                className={cn(
                  "p-3 rounded-lg transition-all",
                  segment.isFinal
                    ? "bg-muted/50"
                    : "bg-primary/10 animate-pulse"
                )}
              >
                <p className="text-sm leading-relaxed">{segment.text}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {segment.timestamp.toLocaleTimeString()}
                </p>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
