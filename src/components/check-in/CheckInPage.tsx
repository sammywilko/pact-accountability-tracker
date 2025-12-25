import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, RefreshCw, CheckCircle2, X, ShieldCheck } from 'lucide-react';
import { useGoalsStore } from '../../stores/goalsStore';
import { useAuthStore } from '../../stores/authStore';
import { analyzeCheckIn } from '../../services/aiService';
import { uploadImage, base64ToBlob } from '../../lib/supabase';
import { Button, Card, Spinner } from '../ui';

interface CameraCaptureProps { onCapture: (activityImg: string, selfieImg: string) => void; onClose: () => void; }

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const [step, setStep] = useState<'activity' | 'selfie' | 'review'>('activity');
  const [activityImg, setActivityImg] = useState<string | null>(null);
  const [selfieImg, setSelfieImg] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: step === 'activity' ? 'environment' : 'user', width: { ideal: 1280 }, height: { ideal: 720 } } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) { console.error('Camera access denied:', err); }
  }, [step]);

  useEffect(() => { if (step !== 'review') startCamera(); return () => { if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop()); }; }, [step, startCamera]);

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        const data = canvasRef.current.toDataURL('image/jpeg', 0.8);
        if (step === 'activity') { setActivityImg(data); setStep('selfie'); }
        else { setSelfieImg(data); setStep('review'); }
      }
    }
  };

  const reset = () => { setActivityImg(null); setSelfieImg(null); setStep('activity'); };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-between p-6 safe-area-inset">
      <div className="w-full flex justify-between items-center text-white">
        <h2 className="text-xl font-bold">{step === 'activity' ? 'Capture Proof' : step === 'selfie' ? "Proof it's You" : 'Review PACT'}</h2>
        <button onClick={onClose} className="p-2 bg-zinc-800 rounded-full"><X size={24} /></button>
      </div>
      <div className="relative w-full max-w-sm aspect-[3/4] bg-zinc-900 rounded-2xl overflow-hidden border-2 border-zinc-700 shadow-2xl">
        {step !== 'review' ? <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${step === 'selfie' ? 'scale-x-[-1]' : ''}`} /> : (
          <div className="relative w-full h-full"><img src={activityImg!} className="w-full h-full object-cover" alt="Activity" /><div className="absolute bottom-3 right-3 w-20 h-20 rounded-xl overflow-hidden border-2 border-black shadow-lg"><img src={selfieImg!} className="w-full h-full object-cover" alt="Selfie" /></div></div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
      <div className="w-full max-w-sm flex flex-col gap-4 items-center">
        {step === 'review' ? (
          <div className="flex gap-4 w-full">
            <button onClick={reset} className="flex-1 py-4 bg-zinc-800 text-white rounded-xl font-bold flex items-center justify-center gap-2"><RefreshCw size={20} /> Retake</button>
            <button onClick={() => onCapture(activityImg!, selfieImg!)} className="flex-1 py-4 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"><CheckCircle2 size={20} /> Submit</button>
          </div>
        ) : <button onClick={capture} className="w-20 h-20 bg-white rounded-full border-8 border-zinc-700 flex items-center justify-center active:scale-95 transition-transform"><div className="w-14 h-14 bg-white border-2 border-zinc-900 rounded-full" /></button>}
        <p className="text-zinc-400 text-sm text-center">{step === 'activity' ? 'Step 1: Capture your proof of work' : step === 'selfie' ? 'Step 2: Quick selfie to verify' : 'Looking good! Ready to submit?'}</p>
      </div>
    </div>
  );
};

const VerificationScreen: React.FC = () => (
  <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-12 text-center space-y-10 z-[60]">
    <div className="relative"><ShieldCheck size={80} className="text-emerald-500 animate-pulse" /><div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full animate-ping" /></div>
    <div className="space-y-4"><h2 className="text-3xl font-black italic uppercase tracking-tighter">AI Verification...</h2><p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.3em]">Neural analysis in progress</p></div>
  </div>
);

export const CheckInPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { goals, fetchGoals, createCheckIn } = useGoalsStore();
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => { fetchGoals(); }, [fetchGoals]);
  useEffect(() => { if (goals.length > 0 && !selectedGoalId) setSelectedGoalId(goals[0].id); }, [goals, selectedGoalId]);

  const handleCapture = async (activityImg: string, selfieImg: string) => {
    if (!selectedGoalId || !profile) return;
    const selectedGoal = goals.find((g) => g.id === selectedGoalId);
    if (!selectedGoal) return;
    setIsCapturing(false); setIsVerifying(true);
    try {
      const aiResult = await analyzeCheckIn(activityImg, selectedGoal.title, selectedGoal.definition_of_done || '');
      const [photoUrl, selfieUrl] = await Promise.all([uploadImage(base64ToBlob(activityImg), 'activity', profile.id), uploadImage(base64ToBlob(selfieImg), 'selfie', profile.id)]);
      await createCheckIn({ goal_id: selectedGoalId, photo_url: photoUrl || undefined, selfie_url: selfieUrl || undefined, note: note || undefined, ai_analysis: aiResult.verdict, confidence_score: aiResult.confidence, is_fake: aiResult.isFake });
      navigate('/');
    } catch (error) { console.error('Check-in error:', error); setIsVerifying(false); }
  };

  if (isVerifying) return <VerificationScreen />;
  if (isCapturing) return <CameraCapture onCapture={handleCapture} onClose={() => setIsCapturing(false)} />;

  return (
    <div className="px-5 py-8 space-y-10 pb-36">
      <header className="flex items-center gap-4"><button onClick={() => navigate(-1)} className="p-4 bg-zinc-900 rounded-[1.5rem] active:scale-90 transition-transform"><ArrowLeft size={24} /></button><h2 className="text-3xl font-black italic uppercase tracking-tighter">Duty Proof</h2></header>
      <div className="space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 ml-3">Select Active PACT</p>
        {goals.length === 0 ? <Card className="text-center py-8"><p className="text-zinc-500 font-medium">No goals yet</p><Button variant="outline" size="sm" onClick={() => navigate('/new-goal')} className="mt-4">Create Goal First</Button></Card> : (
          goals.map((goal) => <button key={goal.id} onClick={() => setSelectedGoalId(goal.id)} className={`w-full p-8 rounded-[3rem] border-2 text-left transition-all ${selectedGoalId === goal.id ? 'bg-emerald-500 text-black border-emerald-500 shadow-xl' : 'bg-zinc-950 border-zinc-900 text-zinc-600'}`}><p className="text-2xl font-black italic">{goal.title}</p><p className={`text-[9px] font-black uppercase tracking-widest mt-2 ${selectedGoalId === goal.id ? 'text-black/60' : 'text-zinc-800'}`}>{goal.category} • {goal.streak} day streak</p></button>)
        )}
      </div>
      <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-3">Add a Note (Optional)</label><textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="How did it go?" className="w-full bg-zinc-900 border border-zinc-800 rounded-3xl px-6 py-5 text-white font-medium resize-none placeholder:text-zinc-600 h-24" /></div>
      <Button onClick={() => setIsCapturing(true)} disabled={!selectedGoalId} className="w-full py-7"><Camera size={20} /> Start Proof Capture</Button>
    </div>
  );
};