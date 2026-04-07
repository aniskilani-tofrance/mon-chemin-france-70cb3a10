import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Upload, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface AudioSubmitButtonProps {
  exerciseId: string;
  moduleId: string;
}

export function AudioSubmitButton({ exerciseId, moduleId }: AudioSubmitButtonProps) {
  const { user } = useAuth();
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setRecording(true);
    } catch {
      toast.error("Impossible d'accéder au microphone");
    }
  }, []);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!audioBlob || !user) return;
    setUploading(true);

    try {
      const fileName = `${user.id}/${moduleId}/${exerciseId}_${Date.now()}.webm`;
      const { error: uploadError } = await supabase.storage
        .from("audio-submissions")
        .upload(fileName, audioBlob, { contentType: "audio/webm" });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("audio-submissions")
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from("audio_submissions")
        .insert({
          learner_id: user.id,
          module_id: moduleId,
          exercise_id: exerciseId,
          audio_url: urlData.publicUrl,
          status: "pending",
        });

      if (insertError) throw insertError;

      setSubmitted(true);
      toast.success("Audio envoyé à votre formateur !");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'envoi");
    } finally {
      setUploading(false);
    }
  }, [audioBlob, user, moduleId, exerciseId]);

  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2">
        <CheckCircle2 className="h-4 w-4" />
        Soumis au formateur
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 border border-dashed border-muted-foreground/30 rounded-xl p-4">
      <p className="text-xs text-muted-foreground">📤 Soumettre au formateur pour évaluation</p>
      <div className="flex items-center gap-2">
        {!recording && !audioBlob && (
          <Button size="sm" variant="outline" onClick={startRecording} className="gap-2">
            <Mic className="h-4 w-4" /> Enregistrer
          </Button>
        )}
        {recording && (
          <Button size="sm" variant="destructive" onClick={stopRecording} className="gap-2 animate-pulse">
            <Square className="h-4 w-4" /> Arrêter
          </Button>
        )}
        {audioBlob && !recording && (
          <>
            <audio controls src={audioUrl!} className="h-8" />
            <Button size="sm" onClick={handleSubmit} disabled={uploading} className="gap-2">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Envoyer
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setAudioBlob(null); setAudioUrl(null); }}>
              Refaire
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
