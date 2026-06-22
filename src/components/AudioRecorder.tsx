import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Trash2, StopCircle } from 'lucide-react';
import { saveAudio, getAudio, deleteAudio } from '../db';

export function AudioRecorder({ id }: { id: string }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    loadAudio();
  }, [id]);

  const loadAudio = async () => {
    try {
      const blob = await getAudio(id);
      if (blob) {
        setAudioUrl(URL.createObjectURL(blob));
      }
    } catch (e) {
      console.error('Failed to load audio', e);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        await saveAudio(id, audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Could not start recording', err);
      alert('Veuillez autoriser l\'accès au microphone.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const deleteRecording = async () => {
    if (confirm('Supprimer cet enregistrement ?')) {
      await deleteAudio(id);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
      setIsPlaying(false);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-2" data-html2canvas-ignore="true">
      {audioUrl ? (
        <>
          <button 
            onClick={togglePlayback}
            className={`p-1.5 rounded-full transition-colors shrink-0 ${isPlaying ? 'bg-indigo-100 text-indigo-600' : 'bg-stone-50 text-stone-500 hover:bg-stone-100 border border-stone-200'}`}
          >
            {isPlaying ? <StopCircle className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button 
            onClick={deleteRecording}
            className="p-1.5 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <span className="text-[10px] text-stone-400">Votre note audio</span>
          <audio 
            ref={audioRef} 
            src={audioUrl} 
            onEnded={() => setIsPlaying(false)}
            className="hidden" 
          />
        </>
      ) : (
        <button 
          onClick={isRecording ? stopRecording : startRecording}
          className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
            isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
          }`}
        >
          {isRecording ? <Square className="w-3 h-3 fill-current" /> : <Mic className="w-3 h-3" />}
          {isRecording ? 'Arrêter' : 'Enregistrer'}
        </button>
      )}
    </div>
  );
}
