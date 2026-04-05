import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Volume2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const VOICES = [
  { id: "nova", label: "Nova", desc: "Féminine, chaleureuse et naturelle" },
  { id: "shimmer", label: "Shimmer", desc: "Féminine, expressive et claire" },
  { id: "alloy", label: "Alloy", desc: "Neutre, moderne et naturel" },
  { id: "fable", label: "Fable (actuelle)", desc: "Narrative, accent européen" },
];

const TEST_TEXT = "Bonjour, je suis Marianne, votre conseillère pour vous aider dans vos démarches en France. Comment puis-je vous aider aujourd'hui ?";

export default function VoiceTest() {
  const [playing, setPlaying] = useState<string | null>(null);

  const playVoice = async (voiceId: string) => {
    setPlaying(voiceId);
    try {
      const { data, error } = await supabase.functions.invoke("openai-tts", {
        body: { text: TEST_TEXT, language: "fr", speed: 0.9, voice: voiceId },
      });
      if (error || !data?.audio_base64) {
        console.error("TTS error", error);
        setPlaying(null);
        return;
      }
      const binaryString = atob(data.audio_base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => { setPlaying(null); URL.revokeObjectURL(url); };
      audio.onerror = () => { setPlaying(null); URL.revokeObjectURL(url); };
      await audio.play();
    } catch {
      setPlaying(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        <h1 className="text-2xl font-bold text-center text-foreground">Test des voix Marianne</h1>
        <p className="text-sm text-muted-foreground text-center">Cliquez pour écouter chaque voix</p>
        {VOICES.map((v) => (
          <Card key={v.id} className="border-border/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">{v.label}</p>
                <p className="text-xs text-muted-foreground">{v.desc}</p>
              </div>
              <Button
                size="icon"
                variant={playing === v.id ? "default" : "outline"}
                onClick={() => playVoice(v.id)}
                disabled={playing !== null}
              >
                {playing === v.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
