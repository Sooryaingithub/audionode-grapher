import { useState, useRef, useCallback } from "react";
import { AudioRecorder } from "@/utils/audioRecorder";
import { EntityExtractor } from "@/utils/entityExtractor";
import { AudioControls } from "@/components/AudioControls";
import { TranscriptPanel, TranscriptSegment } from "@/components/TranscriptPanel";
import { KnowledgeGraphView } from "@/components/KnowledgeGraphView";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [volume, setVolume] = useState(0);
  const [transcriptSegments, setTranscriptSegments] = useState<TranscriptSegment[]>([]);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });

  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const entityExtractorRef = useRef(new EntityExtractor());
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  const startRecording = useCallback(async () => {
    try {
      // Check for browser support
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        toast({
          title: "Not Supported",
          description: "Speech recognition is not supported in your browser. Try Chrome or Edge.",
          variant: "destructive",
        });
        return;
      }

      // Initialize speech recognition
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      let currentSegmentId = Date.now().toString();

      recognitionRef.current.onresult = (event: any) => {
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript;
        const isFinal = event.results[last].isFinal;

        if (isFinal) {
          // Add final transcript
          setTranscriptSegments((prev) => {
            const filtered = prev.filter((s) => s.id !== currentSegmentId);
            return [
              ...filtered,
              {
                id: currentSegmentId,
                text: transcript,
                timestamp: new Date(),
                isFinal: true,
              },
            ];
          });

          // Extract entities and relationships
          const { entities, relationships } = entityExtractorRef.current.extractFromText(transcript);
          setGraphData(entityExtractorRef.current.getGraphData());

          // Generate new segment ID for next interim results
          currentSegmentId = Date.now().toString();
        } else {
          // Update interim results
          setTranscriptSegments((prev) => {
            const filtered = prev.filter((s) => s.id !== currentSegmentId);
            return [
              ...filtered,
              {
                id: currentSegmentId,
                text: transcript,
                timestamp: new Date(),
                isFinal: false,
              },
            ];
          });
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          // Silent error, don't show to user
          return;
        }
        toast({
          title: "Recognition Error",
          description: `Error: ${event.error}`,
          variant: "destructive",
        });
      };

      recognitionRef.current.start();

      // Start audio recording for volume visualization
      audioRecorderRef.current = new AudioRecorder(
        () => {}, // We're not processing raw audio for now
        setVolume
      );
      await audioRecorderRef.current.start();

      setIsRecording(true);
      toast({
        title: "Recording Started",
        description: "Speak naturally. Entities and relationships will be extracted automatically.",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Error",
        description: "Failed to start recording. Please check microphone permissions.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    if (audioRecorderRef.current) {
      audioRecorderRef.current.stop();
      audioRecorderRef.current = null;
    }

    setIsRecording(false);
    setVolume(0);
    
    toast({
      title: "Recording Stopped",
      description: "Processing complete.",
    });
  }, [toast]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const handleClear = useCallback(() => {
    setTranscriptSegments([]);
    setGraphData({ nodes: [], links: [] });
    entityExtractorRef.current.clear();
    
    toast({
      title: "Cleared",
      description: "All data has been cleared.",
    });
  }, [toast]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <header className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Audio Knowledge Graph
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Real-time speech-to-text with automatic entity and relationship extraction.
            Watch as your words transform into an interactive knowledge graph.
          </p>
        </header>

        {/* Controls */}
        <AudioControls
          isRecording={isRecording}
          onToggleRecording={toggleRecording}
          onClear={handleClear}
          volume={volume}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-300px)] min-h-[600px]">
          {/* Transcript Panel */}
          <div className="lg:col-span-1">
            <TranscriptPanel segments={transcriptSegments} />
          </div>

          {/* Knowledge Graph */}
          <div className="lg:col-span-2">
            <KnowledgeGraphView data={graphData} />
          </div>
        </div>

        {/* Tech Stack Info */}
        <footer className="text-center text-xs text-muted-foreground">
          <p>
            Built with Web Speech API • React Force Graph • Real-time NLP •{" "}
            <span className="text-primary">All processing happens on-device</span>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
