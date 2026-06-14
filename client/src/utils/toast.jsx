import { toast } from 'react-hot-toast';

// Web Audio API Sound Synthesizer
const playSound = (type) => {
  const isSoundEnabled = localStorage.getItem('rb_sound_enabled') !== 'false';
  if (!isSoundEnabled) return;
  
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    if (type === 'success') {
      // Ascending arpeggio chime (C5 -> E5 -> G5 -> C6)
      const now = audioCtx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gainNode.gain.setValueAtTime(0.06, now + idx * 0.08);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.35);
      });
    } else if (type === 'error') {
      // Lower double-beep
      const now = audioCtx.currentTime;
      [0, 0.12].forEach((delay) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now + delay);
        gainNode.gain.setValueAtTime(0.1, now + delay);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.2);
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.2);
      });
    } else if (type === 'warning') {
      // Soft medium warning chime (A4 -> F4)
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(349.23, now + 0.1);
      gainNode.gain.setValueAtTime(0.06, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } else {
      // Info: soft single chime (E5)
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now);
      gainNode.gain.setValueAtTime(0.06, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch (e) {
    console.error('AudioContext error:', e);
  }
};

// Custom premium glassmorphic toast component
const CustomToast = ({ t, message, type, icon, borderColor, progressColor, duration, action }) => {
  return (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-sm w-full bg-navy-dark/90 backdrop-blur-md shadow-2xl rounded-2xl pointer-events-auto flex flex-col overflow-hidden border ${borderColor}`}
    >
      <div className="flex items-center justify-between p-4 gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-xl shrink-0 select-none flex items-center justify-center">{icon}</span>
          <p className="text-sm font-semibold text-cream leading-snug break-words">{message}</p>
        </div>
        {action && (
          <button
            onClick={() => {
              action.onClick();
              toast.dismiss(t.id);
            }}
            className="shrink-0 bg-gradient-to-r from-sunset to-gold text-navy text-[11px] font-bold px-3 py-1.5 rounded-xl hover:opacity-90 active:scale-95 transition-all cursor-pointer"
          >
            {action.label}
          </button>
        )}
      </div>
      <div 
        className={`h-[3px] w-full animate-toast-progress ${progressColor}`} 
        style={{ animationDuration: `${duration}ms` }} 
      />
    </div>
  );
};

export const showSuccess = (message, action) => {
  playSound('success');
  const duration = 3000;
  toast.custom((t) => (
    <CustomToast
      t={t}
      message={message}
      type="success"
      icon={<span className="text-sunset font-bold">✓</span>}
      borderColor="border-orange-500/30"
      progressColor="bg-gradient-to-r from-sunset to-gold"
      duration={duration}
      action={action}
    />
  ), { duration });
};

export const showError = (message) => {
  playSound('error');
  const duration = 5000;
  toast.custom((t) => (
    <CustomToast
      t={t}
      message={message}
      type="error"
      icon={<span className="text-red-400 font-bold">✕</span>}
      borderColor="border-red-500/30"
      progressColor="bg-red-500"
      duration={duration}
    />
  ), { duration });
};

export const showWarning = (message) => {
  playSound('warning');
  const duration = 4000;
  toast.custom((t) => (
    <CustomToast
      t={t}
      message={message}
      type="warning"
      icon={<span className="text-yellow-400 font-bold">⚠</span>}
      borderColor="border-yellow-500/30"
      progressColor="bg-yellow-500"
      duration={duration}
    />
  ), { duration });
};

export const showInfo = (message, action) => {
  playSound('info');
  const duration = 4000;
  toast.custom((t) => (
    <CustomToast
      t={t}
      message={message}
      type="info"
      icon={<span className="text-blue-400 font-bold">ℹ</span>}
      borderColor="border-blue-500/30"
      progressColor="bg-blue-500"
      duration={duration}
      action={action}
    />
  ), { duration });
};

export const showLoading = (message) => {
  playSound('info');
  const toastId = toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-sm w-full bg-navy-dark/90 backdrop-blur-md shadow-2xl rounded-2xl pointer-events-auto flex flex-col overflow-hidden border border-gold/30`}
    >
      <div className="flex items-center p-4 gap-3">
        {/* Loading Spinner */}
        <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin shrink-0" />
        <p className="text-sm font-semibold text-cream leading-snug break-words">{message}</p>
      </div>
    </div>
  ), {
    duration: Infinity
  });
  return toastId;
};

export const resolveLoading = (toastId, status, message, action) => {
  toast.dismiss(toastId);
  if (status === 'success') {
    showSuccess(message, action);
  } else {
    showError(message);
  }
};

export const showConfirm = (message, onConfirm, onCancel) => {
  const event = new CustomEvent('show-confirm', {
    detail: { message, onConfirm, onCancel }
  });
  window.dispatchEvent(event);
};
