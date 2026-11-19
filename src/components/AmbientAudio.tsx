import { useState, useRef, useEffect, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export function AmbientAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);

  // Initialize Web Audio API generator for subtle highland breeze
  const initHighlandAmbience = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // 5-second buffer of pink/brownian noise for natural mountain wind
      const bufferSize = ctx.sampleRate * 4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Brownian noise approximation
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // Gain
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      noiseSourceRef.current = noise;

      // Gentle lowpass filter to emulate misty mountain altitude breeze
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, ctx.currentTime);
      filterRef.current = filter;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gainNodeRef.current = gain;

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(0);
    } catch {
      // AudioContext not allowed before user gesture
    }
  }, []);

  const toggleAudio = () => {
    if (!audioCtxRef.current) {
      initHighlandAmbience();
      setIsPlaying(true);
      return;
    }

    if ((audioCtxRef.current.state as string) === 'suspended') {
      audioCtxRef.current.resume();
      setIsPlaying(true);
    } else if (isPlaying) {
      if (gainNodeRef.current && audioCtxRef.current) {
        gainNodeRef.current.gain.setTargetAtTime(0.0001, audioCtxRef.current.currentTime, 0.2);
        setTimeout(() => {
          if (audioCtxRef.current && (audioCtxRef.current.state as string) === 'running') {
            audioCtxRef.current.suspend();
          }
        }, 300);
      }
      setIsPlaying(false);
    } else {
      if ((audioCtxRef.current.state as string) === 'suspended') {
        audioCtxRef.current.resume();
      }
      if (gainNodeRef.current && audioCtxRef.current) {
        gainNodeRef.current.gain.setTargetAtTime(0.06, audioCtxRef.current.currentTime, 0.2);
      }
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return (
    <button
      id="audio-toggle"
      type="button"
      onClick={toggleAudio}
      aria-label="Toggle ambient tea highland sounds"
      title={isPlaying ? "Highland Ambient Sound: On" : "Highland Ambient Sound: Off"}
      className={`flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-frame-scrub ${
        isPlaying
          ? 'bg-forest-green text-pure-white border-forest-green'
          : 'border-forest-green/30 text-forest-green hover:border-forest-green hover:bg-forest-green/5'
      }`}
    >
      {isPlaying ? (
        <Volume2 className="w-4 h-4 text-pure-white" />
      ) : (
        <VolumeX className="w-4 h-4 text-forest-green" />
      )}
    </button>
  );
}
