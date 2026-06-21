import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import trafficAsset from "../assets/traffic.jpg.asset.json";
import roadAsset from "../assets/road.jpg.asset.json";
import trafficVideoUrl from "../assets/traffic.mp4";
import roadVideoAsset from "../assets/road.mp4.asset.json";
import syrosVideoAsset from "../assets/syros.mp4.asset.json";
import trafficAudioUrl from "../assets/traffic.mp3";
import kiaSyrosImgUrl from "../assets/kia-syros.png";
import kiaSyrosDriveUrl from "../assets/kia-syros-drive.mp4";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Syros EV — Sound vs Silence" },
      { name: "description", content: "Less Noise. More Journey. The silent power of Syros EV." },
      { property: "og:title", content: "Syros EV — Sound vs Silence" },
      { property: "og:description", content: "Less Noise. More Journey. The silent power of Syros EV." },
    ],
  }),
  component: Index,
});

const TRAFFIC_IMG = trafficAsset.url;
const ROAD_IMG = roadAsset.url;
const TRAFFIC_VIDEO = trafficVideoUrl;
const ROAD_VIDEO = kiaSyrosDriveUrl;
// keep generated peaceful road clip available; unused now that the Kia Syros shot replaces it
void roadVideoAsset;
void syrosVideoAsset;
const TRAFFIC_AUDIO = trafficAudioUrl;
const KIA_SYROS_IMG = kiaSyrosImgUrl;

type WaveProps = {
  count: number;
  amplitude: number;
  speed: number;
  color: string;
  opacity: number;
  width: number;
  height: number;
  chaotic?: boolean;
};

function SoundWave({
  count,
  amplitude,
  speed,
  color,
  opacity,
  width,
  height,
  chaotic = false,
}: WaveProps) {
  const buildPath = (phase: number, freq: number, amp: number) => {
    const steps = 80;
    const pts: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * width;
      const y =
        height / 2 +
        Math.sin((i / steps) * Math.PI * 2 * freq + phase) * amp +
        (chaotic ? Math.sin((i / steps) * Math.PI * 2 * freq * 2.3 + phase) * amp * 0.35 : 0);
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return pts.join(" ");
  };

  const lines = Array.from({ length: count }, (_, i) => {
    const freq = chaotic ? 3 + i * 0.7 : 1 + i * 0.3;
    const amp = amplitude * (1 - i / (count * 2));
    const phase = i * 0.9;
    const dur = speed + (chaotic ? i * 0.15 : i * 0.6);
    return { phase, freq, amp, dur, idx: i };
  });

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ opacity, display: "block" }}
      preserveAspectRatio="none"
    >
      {lines.map((l) => {
        const animName = chaotic ? "sv-wave-chaos" : "sv-wave-calm";
        return (
          <polyline
            key={l.idx}
            fill="none"
            stroke={color}
            strokeWidth={chaotic ? 1.6 : 1.4}
            strokeLinecap="round"
            points={buildPath(l.phase, l.freq, l.amp)}
            style={{
              transformOrigin: "center",
              animation: `${animName} ${l.dur}s ease-in-out infinite`,
              animationDelay: `${l.idx * 0.12}s`,
            }}
          />
        );
      })}
    </svg>
  );
}

function Index() {
  const [currentState, setCurrentState] = useState<number>(1);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupZooming, setPopupZooming] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [heroTextVisible, setHeroTextVisible] = useState(false);
  const [heroTextExiting, setHeroTextExiting] = useState(false);

  const audioRef = useRef<{
    ctx: AudioContext;
    chaosGain: GainNode;
    peaceGain: GainNode;
    masterGain: GainNode;
    nodes: AudioNode[];
    trafficEl: HTMLAudioElement;
  } | null>(null);

  useEffect(() => {
    const t1 = setTimeout(() => setCurrentState(2), 3000);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    const a = ensureAudio();
    const resume = () => {
      if (a.ctx.state === "suspended") {
        a.ctx.resume().then(() => a.trafficEl.play().catch(() => {}));
      } else {
        a.trafficEl.play().catch(() => {});
      }
    };
    resume();
    document.addEventListener("click", resume, { once: true });
    document.addEventListener("touchstart", resume, { once: true });
    return () => {
      document.removeEventListener("click", resume);
      document.removeEventListener("touchstart", resume);
    };
  }, []);

  useEffect(() => {
    if (currentState === 2) {
      const t = setTimeout(() => setPopupVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, [currentState]);

  useEffect(() => {
    if (currentState === 2) {
      const tShow = setTimeout(() => setHeroTextVisible(true), 800);
      return () => clearTimeout(tShow);
    } else {
      setHeroTextVisible(false);
      setHeroTextExiting(false);
    }
  }, [currentState]);

  useEffect(() => {
    if (!heroTextVisible || currentState !== 2) return;
    const tExit = setTimeout(() => setHeroTextExiting(true), 4000);
    return () => clearTimeout(tExit);
  }, [heroTextVisible, currentState]);

  // Auto-transition: 5s after popup appears, zoom popup to fullscreen, then go to state 3
  useEffect(() => {
    if (!popupVisible || currentState !== 2) return;
    const tZoom = setTimeout(() => setPopupZooming(true), 5000);
    const tState = setTimeout(() => {
      setPopupZooming(false);
      setPopupVisible(false);
      setCurrentState(3);
    }, 6200);
    return () => {
      clearTimeout(tZoom);
      clearTimeout(tState);
    };
  }, [popupVisible, currentState]);

  const leftWidth =
    currentState === 1 ? 50 : currentState === 2 ? 75 : 0;
  const rightWidth = 100 - leftWidth;

  const goState3 = () => {
    setPopupZooming(true);
    setTimeout(() => {
      setPopupZooming(false);
      setPopupVisible(false);
      setCurrentState(3);
    }, 1200);
  };

  // Build the audio graph once
  const ensureAudio = () => {
    if (audioRef.current) return audioRef.current;
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AC();

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.0;
    masterGain.connect(ctx.destination);

    // ---- CHAOS BUS: filtered noise + low rumble + sporadic "horn" ----
    const chaosGain = ctx.createGain();
    chaosGain.gain.value = 0;
    chaosGain.connect(masterGain);

    // Real Mumbai traffic recording on the chaos bus
    const trafficEl = new Audio(TRAFFIC_AUDIO);
    trafficEl.loop = true;
    trafficEl.preload = "auto";
    const trafficSrc = ctx.createMediaElementSource(trafficEl);
    trafficSrc.connect(chaosGain);

    const bufferSize = 2 * ctx.sampleRate;

    // ---- PEACE BUS: soft pad of detuned sines + airy noise ----
    const peaceGain = ctx.createGain();
    peaceGain.gain.value = 0;
    peaceGain.connect(masterGain);

    const padFreqs = [110, 164.81, 220, 329.63]; // A2, E3, A3, E4
    padFreqs.forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = 0.08;
      // slow tremolo
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.15 + i * 0.05;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.03;
      lfo.connect(lfoGain);
      lfoGain.connect(g.gain);
      o.connect(g);
      g.connect(peaceGain);
      o.start();
      lfo.start();
    });

    // gentle air noise
    const airBuf = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const airData = airBuf.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) airData[i] = (Math.random() * 2 - 1) * 0.5;
    const air = ctx.createBufferSource();
    air.buffer = airBuf;
    air.loop = true;
    const airFilter = ctx.createBiquadFilter();
    airFilter.type = "lowpass";
    airFilter.frequency.value = 800;
    const airGain = ctx.createGain();
    airGain.gain.value = 0.06;
    air.connect(airFilter);
    airFilter.connect(airGain);
    airGain.connect(peaceGain);
    air.start();

    audioRef.current = {
      ctx,
      chaosGain,
      peaceGain,
      masterGain,
      nodes: [air],
      trafficEl,
    };

    return audioRef.current;
  };

  // Master on/off
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const t = a.ctx.currentTime;
    a.masterGain.gain.cancelScheduledValues(t);
    a.masterGain.gain.linearRampToValueAtTime(soundOn ? 0.6 : 0, t + 0.4);
  }, [soundOn]);

  // Crossfade between chaos and peace based on state
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const t = a.ctx.currentTime;
    const chaos = currentState === 3 ? 0 : currentState === 2 ? 1.0 : 0.7;
    const peace = currentState === 3 ? 1.0 : currentState === 2 ? 0.25 : 0.45;
    a.chaosGain.gain.cancelScheduledValues(t);
    a.peaceGain.gain.cancelScheduledValues(t);
    a.chaosGain.gain.linearRampToValueAtTime(chaos, t + 1.0);
    a.peaceGain.gain.linearRampToValueAtTime(peace, t + 1.0);
  }, [currentState, soundOn]);

  useEffect(() => {
    return () => {
      const a = audioRef.current;
      if (!a) return;
      try { a.trafficEl.pause(); a.trafficEl.src = ""; } catch { /* noop */ }
      a.ctx.close().catch(() => {});
      audioRef.current = null;
    };
  }, []);

  const toggleSound = () => {
    const a = ensureAudio();
    if (a.ctx.state === "suspended") a.ctx.resume();
    // Trigger the state-dependent gains for the first time
    const t = a.ctx.currentTime;
    const chaos = currentState === 3 ? 0 : currentState === 2 ? 1.0 : 0.7;
    const peace = currentState === 3 ? 1.0 : currentState === 2 ? 0.25 : 0.45;
    a.chaosGain.gain.setValueAtTime(chaos, t);
    a.peaceGain.gain.setValueAtTime(peace, t);
    setSoundOn((v) => !v);
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        background: "#000",
        overflow: "hidden",
        WebkitFontSmoothing: "antialiased",
        fontFamily:
          '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <style>{`
        @keyframes sv-wave-chaos {
          0%, 100% { transform: translateX(0) scaleY(1); }
          25% { transform: translateX(-8px) scaleY(1.4); }
          50% { transform: translateX(6px) scaleY(0.7); }
          75% { transform: translateX(-4px) scaleY(1.2); }
        }
        @keyframes sv-wave-calm {
          0%, 100% { transform: translateX(0) scaleY(1); }
          50% { transform: translateX(-6px) scaleY(1.05); }
        }
        @keyframes sv-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0, 212, 170, 0.7); }
          50% { box-shadow: 0 0 0 10px rgba(0, 212, 170, 0); }
        }
        @keyframes sv-pop-in {
          from { opacity: 0; transform: translateY(30px) scale(0.85); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes sv-popup-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes sv-popup-glow {
          0%, 100% { box-shadow: 0 14px 50px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,212,170,0.5), 0 0 32px rgba(0,212,170,0.3), inset 0 0 30px rgba(0,212,170,0.05); }
          50% { box-shadow: 0 20px 70px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,212,170,1), 0 0 56px rgba(0,212,170,0.6), inset 0 0 40px rgba(0,212,170,0.1); }
        }
        @keyframes sv-syros-glide {
          0% { transform: translateX(-6px) scale(1); }
          50% { transform: translateX(6px) scale(1.04); }
          100% { transform: translateX(-6px) scale(1); }
        }
        @keyframes sv-shine {
          0% { transform: translateX(-120%) skewX(-20deg); }
          100% { transform: translateX(220%) skewX(-20deg); }
        }
        @keyframes sv-fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes sv-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes sv-breath {
          0%, 100% { filter: drop-shadow(0 0 4px rgba(0,212,170,0.4)); opacity: 0.6; }
          50% { filter: drop-shadow(0 0 18px rgba(0,212,170,0.9)); opacity: 1; }
        }
        .sv-pulse-dot {
          animation: sv-pulse 1.6s ease-out infinite;
        }
        .sv-popup {
          animation: sv-pop-in 0.7s cubic-bezier(0.22,1,0.36,1) 0.3s both,
                     sv-popup-float 4s ease-in-out 1.2s infinite,
                     sv-popup-glow 2.6s ease-in-out 1.2s infinite;
        }
        .sv-popup:hover .sv-popup-img { transform: scale(1.08); filter: brightness(1.1) contrast(1.05); }
        .sv-popup-img { transition: transform 0.6s ease, filter 0.6s ease; animation: sv-syros-glide 5s ease-in-out infinite; }
        @keyframes sv-popup-shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .sv-popup::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: inherit;
          background: linear-gradient(135deg, rgba(0,212,170,0.5), rgba(0,212,170,0.1), rgba(0,212,170,0.5));
          z-index: -1;
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .sv-popup:hover::before { opacity: 1; }
        @keyframes sv-popup-particles {
          0%, 100% { opacity: 0; transform: translateY(0) scale(0.8); }
          50% { opacity: 1; transform: translateY(-8px) scale(1); }
        }
        @keyframes sv-hero-text-in {
          from { opacity: 0; transform: translateY(40px) scale(0.9); filter: blur(8px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0px); }
        }
        @keyframes sv-hero-text-out {
          from { opacity: 1; transform: translateX(0) scale(1); filter: blur(0px); }
          to { opacity: 0; transform: translateX(60vw) scale(0.7); filter: blur(6px); }
        }
        @keyframes sv-hero-glow {
          0%, 100% { text-shadow: 0 0 20px rgba(0,212,170,0.4), 0 2px 24px rgba(0,0,0,0.6); }
          50% { text-shadow: 0 0 40px rgba(0,212,170,0.7), 0 2px 32px rgba(0,0,0,0.7); }
        }
        @keyframes sv-hero-line-in {
          from { width: 0; opacity: 0; }
          to { width: 80px; opacity: 1; }
        }
        @keyframes sv-hero-sub-in {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .sv-popup-shine {
          position: absolute; top: 0; left: 0; height: 100%; width: 50%;
          background: linear-gradient(90deg, transparent, rgba(0,212,170,0.2), rgba(255,255,255,0.4), rgba(0,212,170,0.2), transparent);
          animation: sv-shine 3s ease-in-out 1.5s infinite;
          pointer-events: none;
          z-index: 2;
        }
        .sv-headline { animation: sv-fade-up 0.9s ease-out 0.5s both; }
        .sv-subhead { animation: sv-fade-up 0.9s ease-out 0.9s both; }
        .sv-logo { animation: sv-fade 0.8s ease-out 1.2s both; }
        .sv-cta { animation: sv-fade-up 0.9s ease-out 1.4s both; }
        .sv-cta-primary:hover { filter: brightness(1.1); }
        .sv-cta-ghost { transition: all 0.25s ease; }
        .sv-cta-ghost:hover { background: #fff; color: #0A1420; }
        @keyframes sv-eq {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1); }
        }
      `}</style>

      {/* Sound toggle (top-right) */}
      <button
        onClick={toggleSound}
        aria-label={soundOn ? "Mute" : "Unmute"}
        style={{
          position: "absolute",
          top: 22,
          right: 22,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "9px 14px 9px 12px",
          borderRadius: 999,
          background: "rgba(10, 20, 30, 0.55)",
          border: "1px solid rgba(255,255,255,0.18)",
          color: "#fff",
          fontSize: 11,
          letterSpacing: 2,
          textTransform: "uppercase",
          fontWeight: 500,
          cursor: "pointer",
          backdropFilter: "blur(10px)",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "flex-end",
            gap: 2,
            height: 14,
          }}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                width: 3,
                height: "100%",
                background: soundOn ? "#00D4AA" : "rgba(255,255,255,0.45)",
                borderRadius: 2,
                transformOrigin: "bottom",
                animation: soundOn
                  ? `sv-eq ${0.6 + i * 0.15}s ease-in-out ${i * 0.1}s infinite`
                  : "none",
                transform: soundOn ? undefined : "scaleY(0.5)",
              }}
            />
          ))}
        </span>
        {soundOn ? "Sound On" : "Sound Off"}
      </button>

      {/* LEFT PANEL — Chaos */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: "100%",
          width: `${leftWidth}%`,
          overflow: "hidden",
          willChange: "width",
          transition:
            currentState === 3
              ? "width 1.0s cubic-bezier(0.22, 1, 0.36, 1)"
              : "width 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          backgroundImage: `url('${TRAFFIC_IMG}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <video
          src={TRAFFIC_VIDEO}
          autoPlay
          muted
          loop
          playsInline
          poster={TRAFFIC_IMG}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "grayscale(40%) brightness(0.7) contrast(1.1)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
          }}
        />

        {/* Label */}
        <div
          style={{
            position: "absolute",
            top: 24,
            left: 24,
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#fff",
            fontSize: 12,
            letterSpacing: 3,
            textTransform: "uppercase",
            fontWeight: 500,
            zIndex: 3,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#FF4444",
              boxShadow: "0 0 8px #FF4444",
            }}
          />
          Noise
        </div>

        {/* Sound waves */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "opacity 0.5s ease",
            opacity: currentState === 3 ? 0 : 1,
          }}
        >
          <SoundWave
            count={7}
            amplitude={currentState === 2 ? 60 : 40}
            speed={0.9}
            color="#FF4444"
            opacity={0.75}
            width={900}
            height={420}
            chaotic
          />
        </div>

        {/* Popup card */}
        {currentState === 2 && popupVisible && (
          <button
            onClick={goState3}
            className="sv-popup"
            style={{
              position: popupZooming ? "fixed" : "absolute",
              right: popupZooming ? 0 : 24,
              bottom: popupZooming ? 0 : 24,
              left: popupZooming ? 0 : "auto",
              top: popupZooming ? 0 : "auto",
              width: popupZooming ? "100vw" : 340,
              height: popupZooming ? "100vh" : "auto",
              padding: 0,
              background: "linear-gradient(145deg, rgba(10,20,30,0.95), rgba(5,15,25,0.98))",
              border: popupZooming ? "1px solid rgba(0,212,170,0)" : "1px solid rgba(0,212,170,0.6)",
              borderRadius: popupZooming ? 0 : 20,
              overflow: "hidden",
              cursor: "pointer",
              textAlign: "left",
              zIndex: popupZooming ? 30 : 5,
              backdropFilter: "blur(12px)",
              boxShadow: popupZooming ? "none" : "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,212,170,0.1), inset 0 1px 0 rgba(255,255,255,0.05)",
              transition: "all 1.1s cubic-bezier(0.7, 0, 0.2, 1)",
              transform: popupZooming ? "scale(1)" : undefined,
            }}
          >
            <span className="sv-popup-shine" />
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 220,
                background: "linear-gradient(180deg, rgba(0,212,170,0.15) 0%, transparent 60%)",
                pointerEvents: "none",
                zIndex: 1,
              }}
            />
            <div
              className="sv-popup-img"
              style={{
                width: "100%",
                height: popupZooming ? "100vh" : 210,
                backgroundImage: `linear-gradient(180deg, rgba(8,16,24,0.0) 30%, rgba(8,16,24,0.6) 100%), url('${KIA_SYROS_IMG}'), url('${ROAD_IMG}')`,
                backgroundSize: "contain, cover, cover",
                backgroundRepeat: "no-repeat, no-repeat, no-repeat",
                backgroundPosition: "center, center, center",
                backgroundColor: "#0A1420",
                transition: "height 1.1s cubic-bezier(0.7, 0, 0.2, 1)",
                position: "relative",
              }}
            />
            <div
              style={{
                padding: popupZooming ? "0" : "16px 18px 18px",
                display: popupZooming ? "none" : "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                borderTop: "1px solid rgba(0,212,170,0.15)",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ color: "#fff", fontSize: 15, fontWeight: 600, letterSpacing: 0.3 }}>
                  Escape the chaos
                </span>
                <span style={{ color: "rgba(0,212,170,0.8)", fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase" }}>
                  Experience serenity →
                </span>
              </div>
              <span
                className="sv-pulse-dot"
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: "#00D4AA",
                  boxShadow: "0 0 12px rgba(0,212,170,0.5)",
                  flexShrink: 0,
                }}
              />
            </div>
          </button>
        )}
        {/* old popup body removed (replaced above) */}
        {false && (
          <button>
            <div
              style={{
                width: "100%",
                height: 110,
                backgroundImage: `url('${ROAD_IMG}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                borderTopLeftRadius: 13,
                borderTopRightRadius: 13,
              }}
            />
            <div
              style={{
                padding: "12px 14px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <span style={{ color: "#fff", fontSize: 13, fontWeight: 500 }}>
                Escape the chaos →
              </span>
              <span
                className="sv-pulse-dot"
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#00D4AA",
                  flexShrink: 0,
                }}
              />
            </div>
          </button>
        )}
      </div>

      {/* RIGHT PANEL — Syros EV */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          height: "100%",
          width: `${rightWidth}%`,
          overflow: "hidden",
          willChange: "width",
          transition:
            currentState === 3
              ? "width 1.0s cubic-bezier(0.22, 1, 0.36, 1)"
              : "width 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          backgroundImage: `url('${ROAD_IMG}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <video
          src={ROAD_VIDEO}
          autoPlay
          muted
          loop
          playsInline
          poster={ROAD_IMG}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "hue-rotate(10deg) saturate(1.2) brightness(1.05)",
          }}
        />
        {/* Label (hidden in state 3) */}
        {currentState !== 3 && (
          <div
            style={{
              position: "absolute",
              top: 24,
              left: 24,
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "#fff",
              fontSize: 12,
              letterSpacing: 3,
              textTransform: "uppercase",
              fontWeight: 500,
              zIndex: 3,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#00D4AA",
                boxShadow: "0 0 8px #00D4AA",
              }}
            />
            Syros EV
          </div>
        )}

        {/* Gentle waves */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "opacity 0.5s ease",
            opacity: currentState === 3 ? 0 : 0.5,
          }}
        >
          <SoundWave
            count={4}
            amplitude={14}
            speed={4}
            color="#00D4AA"
            opacity={0.8}
            width={700}
            height={260}
          />
        </div>
      </div>

      {/* Center divider */}
      {currentState !== 3 && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: `${leftWidth}%`,
            transform: "translateX(-1px)",
            width: 2,
            height: "100%",
            background: "#fff",
            zIndex: 4,
            transition:
              "left 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.4s ease",
            opacity: currentState === 3 ? 0 : 1,
          }}
        />
      )}

      {/* Hero text — "Ready for Syros EV for Everyone" */}
      {currentState === 2 && heroTextVisible && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: `${leftWidth}%`,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 8,
            pointerEvents: "none",
            transition: "width 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }}
        >
          <div
            style={{
              animation: heroTextExiting
                ? "sv-hero-text-out 1.2s cubic-bezier(0.7, 0, 0.2, 1) forwards"
                : "sv-hero-text-in 0.9s cubic-bezier(0.22, 1, 0.36, 1) both",
              textAlign: "center",
              padding: "0 40px",
            }}
          >
            <div
              style={{
                fontSize: 14,
                letterSpacing: 6,
                textTransform: "uppercase",
                color: "#00D4AA",
                fontWeight: 500,
                marginBottom: 16,
                animation: heroTextExiting ? "none" : "sv-hero-sub-in 0.7s ease-out 0.3s both",
              }}
            >
              Introducing
            </div>
            <h2
              style={{
                fontSize: 44,
                fontWeight: 700,
                color: "#fff",
                margin: 0,
                lineHeight: 1.15,
                letterSpacing: "-0.5px",
                animation: heroTextExiting ? "none" : "sv-hero-glow 3s ease-in-out 0.8s infinite",
              }}
            >
              Ready for Syros EV
              <br />
              <span style={{ color: "#00D4AA" }}>for Everyone</span>
            </h2>
            <div
              style={{
                width: 80,
                height: 2,
                background: "linear-gradient(90deg, transparent, #00D4AA, transparent)",
                margin: "20px auto 0",
                animation: heroTextExiting ? "none" : "sv-hero-line-in 0.6s ease-out 0.5s both",
              }}
            />
          </div>
        </div>
      )}

      {/* STATE 3 overlay content */}
      {currentState === 3 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            paddingTop: "16vh",
            color: "#fff",
          }}
        >
          <div
            className="sv-logo"
            style={{
              position: "absolute",
              top: 28,
              left: 32,
              color: "#fff",
              textTransform: "uppercase",
              letterSpacing: 4,
              fontSize: 16,
              fontWeight: 500,
            }}
          >
            Syros EV
          </div>

          <h1
            className="sv-headline"
            style={{
              fontSize: 48,
              fontWeight: 700,
              letterSpacing: "-0.5px",
              color: "#fff",
              margin: 0,
              textAlign: "center",
              textShadow: "0 2px 24px rgba(0,0,0,0.5)",
            }}
          >
            Less Noise. More Journey.
          </h1>
          <p
            className="sv-subhead"
            style={{
              fontSize: 22,
              fontWeight: 300,
              letterSpacing: "0.5px",
              color: "#fff",
              marginTop: 18,
              textAlign: "center",
              textShadow: "0 2px 18px rgba(0,0,0,0.5)",
            }}
          >
            The Silent Power of Syros EV.
          </p>

          <div
            className="sv-cta"
            style={{
              marginTop: "auto",
              display: "flex",
              alignItems: "center",
              gap: 18,
              marginBottom: 80,
            }}
          >
            <button
              className="sv-cta-primary"
              style={{
                background: "#00D4AA",
                color: "#0A1420",
                border: "none",
                borderRadius: 999,
                padding: "14px 32px",
                fontWeight: 600,
                fontSize: 15,
                cursor: "pointer",
                transition: "filter 0.2s ease",
              }}
            >
              Discover Syros EV
            </button>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 18 }}>
              |
            </span>
            <button
              className="sv-cta-ghost"
              style={{
                background: "transparent",
                color: "#fff",
                border: "1px solid #fff",
                borderRadius: 999,
                padding: "14px 32px",
                fontWeight: 600,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              Watch Full Story
            </button>
          </div>


        </div>
      )}
    </div>
  );
}
