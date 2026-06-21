import { useEffect, useRef, useState } from "react";
import trafficAudioUrl from "../assets/traffic.mp3";
import trafficVideoUrl from "../assets/traffic.mp4";
import kiaSyrosDriveUrl from "../assets/kia-syros-drive.mp4";
import carDriveVideoAsset from "../assets/syros-car-drive.mp4.asset.json";
import carImgUrl from "../assets/syros-car.png";
import heroImgUrl from "../assets/syros-hero.jpg";
import lampsImgUrl from "../assets/syros-lamps.jpg";
import thumb1Url from "../assets/08-d (1).avif";
import thumb2Url from "../assets/08-d (3).avif";
import thumb3Url from "../assets/08-d (4).avif";
import thumb4Url from "../assets/08-d.avif";
import pauseBgUrl from "../assets/syros-2.jpg";



const TRAFFIC_AUDIO = trafficAudioUrl;
const TRAFFIC_VIDEO = trafficVideoUrl;
const ROAD_VIDEO = kiaSyrosDriveUrl;
const CAR_DRIVE_VIDEO = carDriveVideoAsset.url;
const CAR_IMG = carImgUrl;
const HERO_IMG = heroImgUrl;
const LAMPS_IMG = lampsImgUrl;
const PAUSE_BG = pauseBgUrl;
const THUMB1 = thumb1Url;
const THUMB2 = thumb2Url;
const THUMB3 = thumb3Url;
const THUMB4 = thumb4Url;

type Scene = "chaos" | "pause" | "reveal";

export default function AdPage() {
  const [scene, setScene] = useState<Scene>("chaos");
  const [started, setStarted] = useState(false);
  const [runKey, setRunKey] = useState(0);
  const [showReplay, setShowReplay] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!started || !scene) return;
    setProgress(0);
    const durations: Record<Scene, number> = { chaos: 5000, pause: 4000, reveal: 6000 };
    const total = durations[scene];
    const step = 50;
    const increment = 100 / (total / step);
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        return next >= 100 ? 100 : next;
      });
    }, step);
    return () => clearInterval(interval);
  }, [scene, started]);

  useEffect(() => {
    if (!started) {
      const t = setTimeout(start, 5000);
      return () => clearTimeout(t);
    }
  }, [started]);

  const audioRef = useRef<HTMLAudioElement>(null);
  const peaceAudioRef = useRef<{
    ctx: AudioContext;
    gain: GainNode;
    nodes: AudioNode[];
  } | null>(null);
  const chaosVidRef = useRef<HTMLVideoElement>(null);
  const driveVidRef = useRef<HTMLVideoElement>(null);
  const carVidRef = useRef<HTMLVideoElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const stopPeaceAudio = () => {
    const p = peaceAudioRef.current;
    if (p) {
      try {
        p.ctx.close();
      } catch {
        /* noop */
      }
      peaceAudioRef.current = null;
    }
  };

  const initPeaceAudio = () => {
    stopPeaceAudio();
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    const gain = ctx.createGain();
    gain.gain.value = soundOn ? 0.3 : 0;
    gain.connect(ctx.destination);
    const nodes: AudioNode[] = [];
    const padFreqs = [110, 164.81, 220, 329.63];
    padFreqs.forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = 0.08;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.15 + i * 0.05;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.03;
      lfo.connect(lfoGain);
      lfoGain.connect(g.gain);
      o.connect(g);
      g.connect(gain);
      o.start();
      lfo.start();
      nodes.push(o, lfo, g, lfoGain);
    });
    const bufferSize = 2 * ctx.sampleRate;
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
    airGain.connect(gain);
    air.start();
    nodes.push(air, airFilter, airGain);
    peaceAudioRef.current = { ctx, gain, nodes };
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = soundOn ? 0.9 : 0;
    }
    if (peaceAudioRef.current) {
      peaceAudioRef.current.gain.gain.value = soundOn ? 0.3 : 0;
    }
  }, [soundOn]);

  useEffect(
    () => () => {
      clearTimers();
      stopPeaceAudio();
    },
    [],
  );

  const start = async () => {
    stopPeaceAudio();
    setStarted(true);
    setScene("chaos");
    setShowReplay(false);
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.volume = soundOn ? 0.9 : 0;
        await audioRef.current.play();
      }
      if (chaosVidRef.current) {
        chaosVidRef.current.currentTime = 0;
        await chaosVidRef.current.play();
      }
    } catch {}

    timers.current.push(
      setTimeout(() => {
        if (audioRef.current) audioRef.current.pause();
        if (chaosVidRef.current) chaosVidRef.current.pause();
        setScene("pause");
      }, 5000),
    );

    timers.current.push(
      setTimeout(() => {
        setScene("reveal");
        initPeaceAudio();
        if (driveVidRef.current) {
          driveVidRef.current.currentTime = 0;
          driveVidRef.current.play().catch(() => {});
        }
        if (carVidRef.current) {
          carVidRef.current.currentTime = 0;
          carVidRef.current.play().catch(() => {});
        }
      }, 9000),
    );

    timers.current.push(setTimeout(() => setShowReplay(true), 15000));
  };

  const toggleSound = () => {
    setSoundOn((v) => !v);
  };

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = soundOn ? 0.9 : 0;
  }, [soundOn]);

  const replay = () => {
    clearTimers();
    setRunKey((k) => k + 1);
    setTimeout(start, 50);
  };

  useEffect(() => () => clearTimers(), []);

  return (
    <div
      className="h-screen w-screen bg-black font-sans overflow-hidden"
      style={{ fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif" }}
    >
      <style>{`
        @keyframes sc-shakeX { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-3px)} 75%{transform:translateX(3px)} }
        @keyframes sc-hornPulse { 0%,100%{opacity:0} 50%{opacity:1} }
        @keyframes sc-fadeUp { from{opacity:0; transform:translateY(20px)} to{opacity:1; transform:translateY(0)} }
        @keyframes sc-fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes sc-waveBeat { 0%,100%{transform:scaleY(.3)} 50%{transform:scaleY(1)} }
        @keyframes sc-kenBurns { from{transform:scale(1) translateY(0)} to{transform:scale(1.12) translateY(-3%)} }
        @keyframes sc-shootingStar { 0%{transform:translateX(0) translateY(0); opacity:1} 100%{transform:translateX(-120px) translateY(60px); opacity:0} }
        @keyframes sc-pulseDot { 0%,100%{opacity:.3; transform:scale(1)} 50%{opacity:1; transform:scale(1.6)} }
        @keyframes sc-progressFill { 0%{width:0%} 100%{width:100%} }
        @keyframes sc-carDrift { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
      `}</style>

      <div
        className="relative w-screen h-screen overflow-hidden"
        style={{ background: "#000" }}
        key={runKey}
      >
        <audio ref={audioRef} src={TRAFFIC_AUDIO} loop preload="auto" />

        {!started && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 z-10 overflow-hidden">
            <img
              src={HERO_IMG}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                animation: "sc-kenBurns 8s ease-in-out infinite alternate",
                filter: "brightness(.45)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(0,0,0,.2) 0%, rgba(0,0,0,.85) 100%)",
              }}
            />
            <div className="relative z-10 flex flex-col items-center">
              <img
                src={CAR_IMG}
                alt="Kia Syros"
                className="w-[38%] mb-4 drop-shadow-2xl"
                style={{ maxWidth: 200 }}
              />
              <div className="text-[10px] tracking-[.4em] text-white/60 mb-2">
                KIA SYROS EV · INTERACTIVE
              </div>
              <h2 className="text-white text-3xl md:text-4xl font-extrabold mb-3">
                The Silent Pause
              </h2>
              <p className="text-white/70 text-sm mb-6 max-w-md">
                A 13-second immersive experience. Sound on for the full effect.
              </p>
              <button
                onClick={start}
                className="inline-flex items-center gap-2 bg-[#5AE0A0] text-black font-semibold px-6 py-3 rounded-full hover:bg-white transition-colors"
              >
                ▶ Play with sound
              </button>
              <div className="text-white/40 text-[10px] mt-4">🔊 Audio required</div>
            </div>
          </div>
        )}

        {started && (
          <>
            {/* SCENE 1 — CHAOS */}
            <div
              className="absolute inset-0 transition-opacity duration-300"
              style={{
                opacity: scene === "chaos" ? 1 : 0,
                pointerEvents: scene === "chaos" ? "auto" : "none",
              }}
            >
              <video
                ref={chaosVidRef}
                src={TRAFFIC_VIDEO}
                muted
                playsInline
                preload="auto"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ filter: "brightness(.5) contrast(1.15) saturate(1.1)" }}
              />
              <div
                className="absolute inset-x-0 top-0 h-1/3 opacity-60 mix-blend-screen"
                style={{
                  backgroundImage: `url(${LAMPS_IMG})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  maskImage: "linear-gradient(180deg, rgba(0,0,0,.9), transparent)",
                  WebkitMaskImage: "linear-gradient(180deg, rgba(0,0,0,.9), transparent)",
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse at 50% 60%, rgba(0,0,0,0) 0%, rgba(0,0,0,.65) 100%)",
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(200,40,40,.12) 0%, rgba(200,40,40,0) 40%, rgba(0,0,0,0) 60%, rgba(0,0,0,.5) 100%)",
                }}
              />
              <div
                className="absolute inset-0 opacity-30 mix-blend-overlay"
                style={{
                  background:
                    "repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(255,255,255,.03) 4px, rgba(255,255,255,.03) 5px)",
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(0deg, rgba(255,140,0,.06) 0%, rgba(255,140,0,0) 50%)",
                  animation: "sc-hornPulse 2s ease-in-out infinite",
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FFB400"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    filter: "drop-shadow(0 0 18px rgba(255,180,0,.6))",
                    animation: scene === "chaos" ? "sc-shakeX .15s infinite" : "none",
                  }}
                >
                  <path d="M11 5L6 9H2v6h4l5 4V5z" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
              </div>
              {[
                { l: "12%", t: "32%", d: "0s" },
                { l: "78%", t: "26%", d: ".4s" },
                { l: "72%", t: "70%", d: ".8s" },
                { l: "8%", t: "66%", d: "1.2s" },
              ].map((p, i) => (
                <div
                  key={i}
                  className="absolute text-[#FFB400] font-black tracking-wider select-none"
                  style={{
                    left: p.l,
                    top: p.t,
                    fontSize: 28,
                    textShadow: "0 0 16px rgba(255,180,0,.7)",
                    animation: `sc-hornPulse 1.4s ${p.d} infinite`,
                  }}
                >
                  HONK!
                </div>
              ))}
              <div className="absolute left-0 right-0 top-6 px-8 text-center">
                <div className="text-[11px] tracking-[.3em] text-white/70 mb-2">KIA SYROS EV</div>
                <h1
                  className="text-white font-extrabold text-3xl md:text-4xl leading-tight"
                  style={{ textShadow: "0 2px 18px rgba(0,0,0,.8)" }}
                >
                  Ready for a different kind of drive?
                </h1>
              </div>
              <div className="absolute bottom-5 left-6 flex items-end gap-[3px] h-7">
                {Array.from({ length: 14 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-[3px] bg-[#FFB400] rounded-sm"
                    style={{
                      height: 28,
                      transformOrigin: "bottom",
                      animation: `sc-waveBeat ${0.4 + (i % 4) * 0.12}s ${i * 0.05}s infinite`,
                    }}
                  />
                ))}
                <span className="text-white/70 text-[11px] ml-3">🔊 SOUND ON</span>
              </div>
            </div>

            {/* SCENE 2 — PAUSE */}
            <div
              className="absolute inset-0 transition-opacity duration-200"
              style={{
                opacity: scene === "pause" ? 1 : 0,
                pointerEvents: scene === "pause" ? "auto" : "none",
              }}
            >
              <img src={PAUSE_BG} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(180deg, transparent 60%, rgba(0,0,0,.7) 100%)",
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse at 50% 50%, transparent 60%, rgba(0,0,0,.3) 100%)",
                }}
              />
              <div
                className="absolute w-[3px] h-[3px] bg-white rounded-full"
                style={{
                  top: "12%",
                  left: "70%",
                  boxShadow: "0 0 6px #fff",
                  animation: "sc-shootingStar 2s ease-out 0.5s infinite",
                }}
              />
              <div
                className="absolute w-[2px] h-[2px] bg-white rounded-full"
                style={{
                  top: "18%",
                  left: "80%",
                  boxShadow: "0 0 4px #fff",
                  animation: "sc-shootingStar 2.8s ease-out 1.2s infinite",
                }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center pb-12">
                <div
                  className="text-[38px] tracking-[.25em] text-[#00E5A0] font-black"
                  style={{
                    textShadow: "0 0 24px rgba(0,229,160,.5)",
                    animation: "sc-fadeUp .5s .2s both",
                  }}
                >
                  — SILENT MODE —
                </div>
                <div
                  className="text-white text-[22px] tracking-[.15em] font-semibold mt-2"
                  style={{
                    textShadow: "0 0 18px rgba(0,229,160,.35)",
                    animation: "sc-fadeUp .5s .3s both",
                  }}
                >
                  KIA Syros EV — EV for Everyone
                </div>
                <div
                  className="w-[120px] h-0 mt-6 relative overflow-hidden"
                  style={{ animation: "sc-fadeIn .6s .6s both" }}
                >
                  <hr className="border-0 border-t border-dotted border-white/40 w-full" />
                </div>
                <div
                  className="flex items-center gap-3 mt-5"
                  style={{ animation: "sc-fadeIn .6s .8s both" }}
                >
                  {[0, 0.15, 0.3].map((d, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-[#00E5A0]"
                      style={{ animation: `sc-pulseDot 2s ease-in-out ${d}s infinite` }}
                    />
                  ))}
                </div>
                <div
                  className="text-white/70 text-[18px] italic font-light mt-4"
                  style={{
                    textShadow: "0 0 12px rgba(0,229,160,.3)",
                    animation: "sc-fadeUp .6s 1s both",
                  }}
                >
                  ( pause and listen )
                </div>
                <div
                  className="flex items-center gap-2 mt-6 text-white text-[20px]"
                  style={{ animation: "sc-fadeUp .6s 1.2s both" }}
                >
                  <span>Experience silence differently.</span>
                  <span
                    className="inline-block"
                    style={{ animation: "sc-carDrift 1.2s ease-in-out infinite" }}
                  >
                    →
                  </span>
                </div>
              </div>
              <div className="absolute left-0 right-0 bottom-0 h-[3px] bg-white/10">
                <div
                  className="h-full bg-[#00E5A0]"
                  style={{ animation: "sc-progressFill 6s linear 0.5s both" }}
                />
              </div>
            </div>

            {/* SCENE 3 — REVEAL */}
            <div
              className="absolute inset-0 transition-opacity duration-500"
              style={{
                opacity: scene === "reveal" ? 1 : 0,
                pointerEvents: scene === "reveal" ? "auto" : "none",
              }}
            >
              <video
                ref={driveVidRef}
                src={ROAD_VIDEO}
                playsInline
                loop
                preload="auto"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ filter: "brightness(.7) saturate(1.05)" }}
              />
              <div
                className="absolute right-0 top-0 bottom-0 w-[58%] overflow-hidden"
                style={{
                  clipPath: "polygon(12% 0, 100% 0, 100% 100%, 0 100%)",
                  animation: scene === "reveal" ? "sc-fadeIn .8s .2s both" : "none",
                }}
              >
                <video
                  ref={carVidRef}
                  src={CAR_DRIVE_VIDEO}
                  playsInline
                  loop
                  preload="auto"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div
                className="absolute left-8 top-1/2 -translate-y-1/2 max-w-[44%] z-10"
                style={{ animation: scene === "reveal" ? "sc-fadeUp .8s .2s both" : "none" }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-white text-[10px] tracking-[.3em] mb-4 border border-white/20">
                  <span className="w-2 h-2 rounded-full bg-[#5AE0A0]" /> 100% ELECTRIC
                </div>
                <h2
                  className="text-white font-extrabold leading-[1.05] text-4xl md:text-5xl"
                  style={{ textShadow: "0 4px 24px rgba(0,0,0,.6)" }}
                >
                  Not a glitch.
                  <br />
                  <span className="text-[#5AE0A0]">Just the sound of silence.</span>
                </h2>
                <p className="text-white/85 mt-3 text-base">Syros EV. EV for Everyone.</p>
                <div className="mt-5 flex gap-1">
                  {[
                    { src: THUMB1, label: "RED" },
                    { src: THUMB2, label: "BLUE" },
                    { src: THUMB3, label: "WHITE" },
                    { src: THUMB4, label: "BLUE" },
                  ].map((t, i) => (
                    <div
                      key={t.label}
                      className="relative w-[68px] h-[44px] rounded-md overflow-hidden border border-white/25 shadow-lg"
                      style={{ animation: `sc-fadeUp .6s ${0.5 + i * 0.1}s both` }}
                    >
                      <img src={t.src} alt={t.label} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30" />
                      <div className="absolute bottom-0.5 left-1 text-[8px] tracking-[.15em] text-white font-bold">
                        {t.label}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center gap-3">
                  <a
                    href="https://www.kia.com/in/our-vehicles/syros/showroom.html"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded-full hover:bg-[#5AE0A0] hover:text-black transition-colors"
                  >
                    Book a Test Drive <span>→</span>
                  </a>
                  <a
                    href="https://www.kia.com/in/our-vehicles/syros/showroom.html"
                    target="_blank"
                    rel="noreferrer"
                    className="text-white/90 text-sm underline-offset-4 hover:underline"
                  >
                    Explore Syros
                  </a>
                </div>
              </div>
              <div className="absolute top-5 right-6 flex items-center gap-2 text-white z-10">
                <span className="font-black tracking-widest text-lg">KIA</span>
                <span className="w-px h-4 bg-white/40" />
                <span className="text-xs tracking-[.25em]">SYROS EV</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="absolute left-0 right-0 bottom-0 h-1 bg-white/10">
              <div
                className="h-full bg-[#5AE0A0]"
                style={{
                  width: `${progress}%`,
                  transition: "width 2.5s linear",
                }}
              />
            </div>

            {showReplay && (
              <button
                onClick={replay}
                className="absolute top-5 left-5 bg-black/60 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full border border-white/20 hover:bg-black/80 z-20"
              >
                ↻ Replay
              </button>
            )}

            {/* Sound toggle */}
            <button
              onClick={toggleSound}
              className="absolute top-5 right-5 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur border border-white/20 text-white text-xs hover:bg-black/80"
            >
              {soundOn ? "🔊 Sound On" : "🔇 Sound Off"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
