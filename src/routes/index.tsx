import { useState, useEffect, useRef } from "react";
import { X, Eye, Monitor, Smartphone, Volume2, VolumeX, ArrowUpRight } from "lucide-react";
import kiaSyrosImgUrl from "../assets/kia-syros.png";
import roadImgAsset from "../assets/road.jpg.asset.json";
import trafficImgAsset from "../assets/traffic.jpg.asset.json";
import trafficVideoUrl from "../assets/traffic.mp4";
import kiaSyrosDriveUrl from "../assets/kia-syros-drive.mp4";
import trafficAudioUrl from "../assets/traffic.mp3";
import carDriveVideoAsset from "../assets/syros-car-drive.mp4.asset.json";
import carImgUrl from "../assets/syros-car.png";
import heroImgUrl from "../assets/syros-hero.jpg";
import lampsImgUrl from "../assets/syros-lamps.jpg";
import thumb1Url from "../assets/08-d (1).avif";
import thumb2Url from "../assets/08-d (3).avif";
import thumb3Url from "../assets/08-d (4).avif";
import thumb4Url from "../assets/08-d.avif";
import pauseBgUrl from "../assets/syros-2.jpg";

const KIA_SYROS_IMG = kiaSyrosImgUrl;
const ROAD_IMG = roadImgAsset.url;
const TRAFFIC_IMG = trafficImgAsset.url;
const TRAFFIC_VIDEO = trafficVideoUrl;
const ROAD_VIDEO = kiaSyrosDriveUrl;
const TRAFFIC_AUDIO = trafficAudioUrl;
const CAR_DRIVE_VIDEO = carDriveVideoAsset.url;
const CAR_IMG = carImgUrl;
const HERO_IMG = heroImgUrl;
const LAMPS_IMG = lampsImgUrl;
const THUMB1 = thumb1Url;
const THUMB2 = thumb2Url;
const THUMB3 = thumb3Url;
const THUMB4 = thumb4Url;
const PAUSE_BG = pauseBgUrl;

function SoundWaveMini({ chaotic = false }: { chaotic?: boolean }) {
  const width = 200;
  const height = 60;
  const count = chaotic ? 5 : 3;
  const lines = Array.from({ length: count }, (_, i) => {
    const freq = chaotic ? 3 + i * 0.7 : 1 + i * 0.3;
    const amp = 18 * (1 - i / (count * 2));
    const phase = i * 0.9;
    return { freq, amp, phase, idx: i };
  });
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ opacity: 0.7, display: "block" }}
      preserveAspectRatio="none"
    >
      {lines.map((l) => {
        const pts: string[] = [];
        const steps = 40;
        for (let i = 0; i <= steps; i++) {
          const x = (i / steps) * width;
          const y =
            height / 2 +
            Math.sin((i / steps) * Math.PI * 2 * l.freq + l.phase) * l.amp +
            (chaotic
              ? Math.sin((i / steps) * Math.PI * 2 * l.freq * 2.3 + l.phase) * l.amp * 0.35
              : 0);
          pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
        }
        return (
          <polyline
            key={l.idx}
            fill="none"
            stroke={chaotic ? "#FF4444" : "#00D4AA"}
            strokeWidth={chaotic ? 1.2 : 1}
            strokeLinecap="round"
            points={pts.join(" ")}
            style={{
              transformOrigin: "center",
              animation: chaotic
                ? `sw-mini-chaos ${0.6 + l.idx * 0.12}s ease-in-out infinite`
                : `sw-mini-calm ${3 + l.idx * 0.4}s ease-in-out infinite`,
              animationDelay: `${l.idx * 0.08}s`,
            }}
          />
        );
      })}
    </svg>
  );
}

export default function Showcase() {
  const [selectedCreative, setSelectedCreative] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [animPhase, setAnimPhase] = useState<"enter" | "shown" | "exit">("enter");
  const [soundOn, setSoundOn] = useState(true);
  const trafficAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (modalVisible) {
      setAnimPhase("enter");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimPhase("shown"));
      });
      document.body.style.overflow = "hidden";
    } else {
      setAnimPhase("exit");
      document.body.style.overflow = "";
      const t = setTimeout(() => setAnimPhase("enter"), 400);
      return () => clearTimeout(t);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalVisible]);

  useEffect(() => {
    if (!trafficAudioRef.current) return;
    trafficAudioRef.current.volume = soundOn ? 0.4 : 0;
  }, [soundOn]);

  useEffect(() => {
    return () => {
      if (trafficAudioRef.current) {
        trafficAudioRef.current.pause();
        trafficAudioRef.current.src = "";
        trafficAudioRef.current = null;
      }
    };
  }, []);

  const initTrafficAudio = () => {
    if (trafficAudioRef.current) return;
    const el = new Audio(TRAFFIC_AUDIO);
    el.loop = true;
    el.volume = 0.4;
    trafficAudioRef.current = el;
    const resume = () => el.play().catch(() => {});
    resume();
    document.addEventListener("click", resume, { once: true });
    document.addEventListener("touchstart", resume, { once: true });
  };

  const openCreative = (id: number) => {
    setSelectedCreative(id);
    if (id === 1) initTrafficAudio();
    setModalVisible(true);
  };

  const closeCreative = () => {
    setAnimPhase("exit");
    if (trafficAudioRef.current) {
      trafficAudioRef.current.pause();
      trafficAudioRef.current.src = "";
      trafficAudioRef.current = null;
    }
    setTimeout(() => {
      setModalVisible(false);
      setSelectedCreative(null);
    }, 350);
  };

  return (
    <div
      style={{
        fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        background: "#0E0E10",
        color: "#F5F2ED",
        minHeight: "100vh",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <style>{`
        @keyframes sw-mini-chaos {
          0%, 100% { transform: translateX(0) scaleY(1); }
          25% { transform: translateX(-3px) scaleY(1.3); }
          50% { transform: translateX(2px) scaleY(0.75); }
          75% { transform: translateX(-2px) scaleY(1.15); }
        }
        @keyframes sw-mini-calm {
          0%, 100% { transform: translateX(0) scaleY(1); }
          50% { transform: translateX(-2px) scaleY(1.03); }
        }
        @keyframes sw-pulse-ring {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0, 212, 170, 0.5); }
          50% { box-shadow: 0 0 0 12px rgba(0, 212, 170, 0); }
        }
        @keyframes sw-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes sw-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes sw-modal-in {
          from { opacity: 0; transform: scale(0.92) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes sw-modal-out {
          from { opacity: 1; transform: scale(1) translateY(0); }
          to { opacity: 0; transform: scale(0.92) translateY(20px); }
        }
        @keyframes sw-overlay-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes sw-overlay-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes sw-glide {
          0% { transform: translateX(-4px); }
          50% { transform: translateX(4px); }
          100% { transform: translateX(-4px); }
        }
        @keyframes sw-eq-bar {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1); }
        }
        .sw-creative-card {
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25), 0 1px 2px rgba(0, 0, 0, 0.2);
        }
        .sw-creative-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        .sw-creative-card:active {
          transform: translateY(-2px) scale(0.98);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
        }
        @media (max-width: 640px) {
          .sw-grid { grid-template-columns: 1fr !important; }
          .sw-header { padding: 6px 16px !important; }
          .sw-header-inner { padding: 0 !important; }
          .sw-hero-title { font-size: 28px !important; }
          .sw-section { padding: 24px 16px 60px !important; }
          .sw-hero-section { padding: 12px 16px !important; }
          .sw-hero-section-inner { padding: 0 !important; }
          .sw-footer { padding: 16px !important; }
          .sw-footer-inner { flex-direction: column !important; gap: 8px !important; text-align: center !important; }
          .sw-modal { width: 100vw !important; height: 100vh !important; max-width: 100vw !important; max-height: 100vh !important; border-radius: 0 !important; }
          .sw-creative1-modal { flex-direction: column !important; }
          .sw-creative1-modal > div { flex: none !important; height: 50% !important; }
          .sw-creative1-details { bottom: 12px !important; left: 50% !important; transform: translateX(-50%) !important; padding: 8px 14px !important; gap: 10px !important; }
          .sw-creative1-details > span:first-child { font-size: 9px !important; }
          .sw-creative2-modal-car { right: 50% !important; transform: translateX(50%) !important; bottom: 4% !important; width: 50% !important; }
          .sw-creative2-modal-car { width: 90% !important; max-width: 280px !important; }
          .sw-header-nav { gap: 4px !important; }
        }
        @media (max-width: 380px) {
          .sw-hero-title { font-size: 22px !important; }
          .sw-grid { gap: 16px !important; }
          .sw-section { padding: 16px 12px 40px !important; }
        }
      `}</style>

      {/* === HEADER === */}
      <header
        className="sw-header"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          backdropFilter: "blur(16px)",
          background: "rgba(14, 14, 16, 0.85)",
          borderBottom: "1px solid rgba(245, 242, 237, 0.08)",
        }}
      >
        <div
          className="sw-header-inner"
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "8px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <a
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              textDecoration: "none",
              color: "#F5F2ED",
            }}
          >
            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  filter: "blur(16px)",
                  borderRadius: "50%",
                  transform: "scale(1.3)",
                  background:
                    "linear-gradient(135deg, rgba(0,229,255,0.15), rgba(59,130,246,0.15))",
                  transition: "all 0.5s",
                }}
              />
              <img
                src="https://cdn.adcountymedia.com/upload/2026-04-27/b38cd1323d4e70fb/new-and-white.png"
                alt="AdaxxPro"
                style={{
                  position: "relative",
                  height: 64,
                  width: "auto",
                  filter:
                    "brightness(1.15) contrast(1.15) drop-shadow(0 0 10px rgba(0,229,255,0.15))",
                  transition: "all 0.3s",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                color: "rgba(245, 242, 237, 0.7)",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.3em",
                  fontWeight: 600,
                }}
              >
                Powered By
              </span>
              <span
                style={{
                  fontSize: 13,
                  textTransform: "uppercase",
                  letterSpacing: "0.25em",
                  fontWeight: 500,
                }}
              >
                Adcounty Media
              </span>
            </div>
          </a>
          <div className="sw-header-nav" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <a
              href="/experience-creative1"
              style={{
                fontSize: 11,
                color: "rgba(245, 242, 237, 0.6)",
                textDecoration: "none",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#F5F2ED")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(245, 242, 237, 0.6)")}
            >
              Creative 01
            </a>
            <span style={{ fontSize: 10, color: "rgba(245, 242, 237, 0.2)" }}>·</span>
            <a
              href="/experience-creative2"
              style={{
                fontSize: 11,
                color: "rgba(245, 242, 237, 0.6)",
                textDecoration: "none",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#F5F2ED")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(245, 242, 237, 0.6)")}
            >
              Creative 02
            </a>
          </div>
        </div>
      </header>

      <main style={{ paddingTop: 80 }}>
        {/* === HERO === */}
        <section
          className="sw-hero-section"
          style={{
            borderBottom: "1px solid rgba(245, 242, 237, 0.06)",
            background: "linear-gradient(180deg, rgba(0, 212, 170, 0.04) 0%, transparent 100%)",
          }}
        >
          <div
            className="sw-hero-section-inner"
            style={{ maxWidth: 1280, margin: "0 auto", padding: "16px 32px" }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.25em",
                color: "#00D4AA",
                fontWeight: 500,
                marginBottom: 16,
              }}
            >
              <Eye size={12} />
              Creative Showcase
            </div>
            <h1
              className="sw-hero-title"
              style={{
                fontSize: 40,
                fontWeight: 700,
                letterSpacing: "-1px",
                lineHeight: 1.1,
                margin: 0,
                maxWidth: 600,
              }}
            >
              KIA Syros EV <span style={{ color: "#00D4AA" }}>— EV for Everyone</span>
            </h1>
            <p
              style={{
                marginTop: 14,
                fontSize: 14,
                color: "rgba(245, 242, 237, 0.6)",
                maxWidth: 500,
                lineHeight: 1.6,
              }}
            >
              Each project is an immersive brand experience. Click a creative to view it in full
              detail.
            </p>
          </div>
        </section>

        {/* === CREATIVE GRID === */}
        <section
          className="sw-section"
          style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 32px 80px" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 24,
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.25em",
                  color: "rgba(245, 242, 237, 0.4)",
                  marginBottom: 6,
                }}
              >
                Section I
              </p>
              <h2
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  margin: 0,
                  letterSpacing: "-0.3px",
                }}
              >
                Choose a creative
              </h2>
            </div>
            <p
              style={{
                fontSize: 11,
                color: "rgba(245, 242, 237, 0.35)",
                maxWidth: 260,
                textAlign: "right",
                lineHeight: 1.5,
                display: "none",
              }}
            >
              Click any card to inspect the full creative in detail.
            </p>
          </div>

          <div
            className="sw-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 24,
            }}
          >
            {/* === CREATIVE 1: Noise Vs Silence === */}
            <div
              className="sw-creative-card"
              onClick={() => openCreative(1)}
              style={{
                background: "#161618",
                padding: 0,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Preview area */}
              <div
                style={{
                  position: "relative",
                  height: 220,
                  overflow: "hidden",
                  display: "flex",
                }}
              >
                {/* Left panel - Noise */}
                <div
                  style={{
                    flex: 1,
                    position: "relative",
                    overflow: "hidden",
                    background: "#000",
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
                      filter: "grayscale(40%) brightness(0.6) contrast(1.1)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(0,0,0,0.4)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: 8,
                      left: 10,
                      fontSize: 9,
                      textTransform: "uppercase",
                      letterSpacing: "0.15em",
                      color: "#FF4444",
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      zIndex: 2,
                    }}
                  >
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: "#FF4444",
                        boxShadow: "0 0 6px #FF4444",
                      }}
                    />
                    Noise
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: 0.5,
                      zIndex: 1,
                    }}
                  >
                    <SoundWaveMini chaotic />
                  </div>
                </div>
                {/* Divider */}
                <div
                  style={{
                    width: 1,
                    background: "rgba(255,255,255,0.15)",
                    flexShrink: 0,
                    zIndex: 2,
                  }}
                />
                {/* Right panel - Syros EV */}
                <div
                  style={{
                    flex: 1,
                    position: "relative",
                    overflow: "hidden",
                    background: "#000",
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
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(0,0,0,0.2)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: 8,
                      left: 10,
                      fontSize: 9,
                      textTransform: "uppercase",
                      letterSpacing: "0.15em",
                      color: "#00D4AA",
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      zIndex: 2,
                    }}
                  >
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: "#00D4AA",
                        boxShadow: "0 0 6px #00D4AA",
                      }}
                    />
                    Syros EV
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: 0.4,
                      zIndex: 1,
                    }}
                  >
                    <SoundWaveMini />
                  </div>
                </div>
                {/* Hover overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0, 212, 170, 0)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: 0,
                    transition: "opacity 0.3s ease, background 0.3s ease",
                  }}
                  className="sw-creative-overlay"
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 16px",
                      borderRadius: 999,
                      background: "rgba(0, 212, 170, 0.9)",
                      color: "#0E0E10",
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                    }}
                  >
                    <Eye size={13} />
                    Preview
                  </div>
                </div>
                <style>{`
                  .sw-creative-card:hover .sw-creative-overlay {
                    opacity: 1 !important;
                    background: rgba(0, 0, 0, 0.5) !important;
                  }
                `}</style>
              </div>
              {/* Card info */}
              <div
                style={{
                  padding: "16px 18px 18px",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 12,
                  borderTop: "1px solid rgba(245, 242, 237, 0.06)",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        color: "rgba(245, 242, 237, 0.4)",
                        fontWeight: 500,
                        fontStyle: "italic",
                      }}
                    ></span>
                    <span
                      style={{
                        fontSize: 9,
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: "rgba(0, 212, 170, 0.15)",
                        color: "#00D4AA",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        fontWeight: 500,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 3,
                        flexShrink: 0,
                      }}
                    >
                      {typeof window !== "undefined" && window.innerWidth < 768 ? (
                        <Smartphone size={10} />
                      ) : (
                        <Monitor size={10} />
                      )}
                      Full Screen
                    </span>
                  </div>
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      margin: 0,
                      letterSpacing: "-0.3px",
                      color: "#F5F2ED",
                    }}
                  >
                    Noise Vs Silence
                  </h3>
                  <p
                    style={{
                      fontSize: 12,
                      color: "rgba(245, 242, 237, 0.5)",
                      margin: "4px 0 0",
                      lineHeight: 1.4,
                    }}
                  >
                    Noise vs. Silence — Kia Syros EV immersive brand experience
                  </p>
                </div>
                <ArrowUpRight
                  size={16}
                  style={{
                    color: "rgba(245, 242, 237, 0.3)",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                />
              </div>
              {/* Tech badges */}
              <div
                style={{
                  display: "flex",
                  gap: 4,
                  padding: "0 18px 16px",
                  flexWrap: "wrap",
                }}
              >
                {["Web Audio API", "Animation", "Split Screen", "Branding"].map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: 9,
                      padding: "3px 8px",
                      borderRadius: 4,
                      background: "rgba(245, 242, 237, 0.06)",
                      color: "rgba(245, 242, 237, 0.5)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* === CREATIVE 2: The Silent Pause === */}
            <div
              className="sw-creative-card"
              onClick={() => openCreative(2)}
              style={{
                background: "#161618",
                padding: 0,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: 220,
                  position: "relative",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Three small scene previews */}
                <div style={{ display: "flex", flex: 1 }}>
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      overflow: "hidden",
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
                        filter: "brightness(0.4) contrast(1.1)",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(135deg, rgba(200,40,40,.25), rgba(0,0,0,.6))",
                      }}
                    />
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#FFB400"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ zIndex: 1 }}
                    >
                      <path d="M11 5L6 9H2v6h4l5 4V5z" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                    </svg>
                    <span
                      style={{
                        position: "absolute",
                        bottom: 6,
                        fontSize: 7,
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                        color: "rgba(255,180,0,.6)",
                        zIndex: 1,
                      }}
                    >
                      Chaos
                    </span>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={PAUSE_BG}
                      alt=""
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        filter: "brightness(0.4)",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(135deg, rgba(0,229,160,.15), rgba(0,0,0,.6))",
                      }}
                    />
                    <span
                      style={{
                        fontSize: 18,
                        fontWeight: 900,
                        color: "rgba(0,229,160,.5)",
                        letterSpacing: "0.1em",
                        zIndex: 1,
                      }}
                    >
                      — —
                    </span>
                    <span
                      style={{
                        position: "absolute",
                        bottom: 6,
                        fontSize: 7,
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                        color: "rgba(0,229,160,.6)",
                        zIndex: 1,
                      }}
                    >
                      Pause
                    </span>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      overflow: "hidden",
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
                        filter: "brightness(0.35)",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(135deg, rgba(90,224,160,.15), rgba(0,0,0,.6))",
                      }}
                    />
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "rgba(90,224,160,.5)",
                        zIndex: 1,
                      }}
                    >
                      EV
                    </span>
                    <span
                      style={{
                        position: "absolute",
                        bottom: 6,
                        fontSize: 7,
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                        color: "rgba(90,224,160,.6)",
                        zIndex: 1,
                      }}
                    >
                      Reveal
                    </span>
                  </div>
                </div>
                {/* Hover overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0, 212, 170, 0)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: 0,
                    transition: "opacity 0.3s ease, background 0.3s ease",
                  }}
                  className="sw-creative-overlay-2"
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 16px",
                      borderRadius: 999,
                      background: "rgba(90, 224, 160, 0.9)",
                      color: "#0E0E10",
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                    }}
                  >
                    <Eye size={13} />
                    Preview
                  </div>
                </div>
                <style>{`
                  .sw-creative-card:hover .sw-creative-overlay-2 {
                    opacity: 1 !important;
                    background: rgba(0, 0, 0, 0.5) !important;
                  }
                `}</style>
              </div>
              <div
                style={{
                  padding: "16px 18px 18px",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 12,
                  borderTop: "1px solid rgba(245, 242, 237, 0.06)",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        color: "rgba(245, 242, 237, 0.4)",
                        fontWeight: 500,
                        fontStyle: "italic",
                      }}
                    >
                      № 02
                    </span>
                    <span
                      style={{
                        fontSize: 9,
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: "rgba(90, 224, 160, 0.15)",
                        color: "#5AE0A0",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        fontWeight: 500,
                      }}
                    >
                      13-Second Story
                    </span>
                  </div>
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      margin: 0,
                      letterSpacing: "-0.3px",
                      color: "#F5F2ED",
                    }}
                  >
                    The Silent Pause
                  </h3>
                  <p
                    style={{
                      fontSize: 12,
                      color: "rgba(245, 242, 237, 0.5)",
                      margin: "4px 0 0",
                      lineHeight: 1.4,
                    }}
                  >
                    Kia Syros EV — City chaos to silent serenity
                  </p>
                </div>
                <ArrowUpRight
                  size={16}
                  style={{
                    color: "rgba(245, 242, 237, 0.3)",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 4,
                  padding: "0 18px 16px",
                  flexWrap: "wrap",
                }}
              >
                {["Cinematic", "Audio", "3-Act Story", "Thumbnails"].map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: 9,
                      padding: "3px 8px",
                      borderRadius: 4,
                      background: "rgba(245, 242, 237, 0.06)",
                      color: "rgba(245, 242, 237, 0.5)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* === FOOTER === */}
        <footer
          className="sw-footer"
          style={{
            borderTop: "1px solid rgba(245, 242, 237, 0.06)",
            padding: "20px 32px",
            background: "#0E0E10",
          }}
        >
          <div
            className="sw-footer-inner"
            style={{
              maxWidth: 1280,
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "rgba(245, 242, 237, 0.3)",
            }}
          >
            <span>KIA Syros EV · Creative Showcase · {new Date().getFullYear()}</span>
            <span>Kia Syros EV — Less Noise. More Journey.</span>
          </div>
        </footer>
      </main>

      {/* === MODAL OVERLAY === */}
      {modalVisible && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "5vh 5vw",
            animation:
              animPhase === "exit"
                ? "sw-overlay-out 0.35s ease forwards"
                : "sw-overlay-in 0.3s ease both",
          }}
          onClick={closeCreative}
        >
          {/* Backdrop */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0, 0, 0, 0.85)",
              backdropFilter: "blur(12px)",
            }}
          />

          {/* Modal content */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "90vw",
              height: "90vh",
              maxWidth: 1400,
              maxHeight: 900,
              background: "#161618",
              borderRadius: 16,
              overflow: "hidden",
              border: "1px solid rgba(245, 242, 237, 0.08)",
              boxShadow: "0 24px 80px rgba(0, 0, 0, 0.6)",
              animation:
                animPhase === "exit"
                  ? "sw-modal-out 0.35s ease forwards"
                  : "sw-modal-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Modal header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 20px",
                borderBottom: "1px solid rgba(245, 242, 237, 0.06)",
                flexShrink: 0,
                background: "rgba(22, 22, 24, 0.95)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#00D4AA",
                    boxShadow: "0 0 8px rgba(0, 212, 170, 0.5)",
                    animation: "sw-pulse-ring 2s ease-in-out infinite",
                  }}
                />
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: "rgba(245, 242, 237, 0.7)",
                  }}
                >
                  {selectedCreative === 1
                    ? "Noise vs Silence — KIA Syros EV"
                    : "The Silent Pause — KIA Syros EV"}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {selectedCreative === 1 && (
                  <button
                    onClick={() => setSoundOn((v) => !v)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 12px",
                      borderRadius: 6,
                      background: "rgba(245, 242, 237, 0.06)",
                      border: "1px solid rgba(245, 242, 237, 0.08)",
                      color: soundOn ? "#00D4AA" : "rgba(245, 242, 237, 0.4)",
                      fontSize: 11,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {soundOn ? (
                      <>
                        <Volume2 size={13} /> Sound On
                      </>
                    ) : (
                      <>
                        <VolumeX size={13} /> Sound Off
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={closeCreative}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    background: "rgba(245, 242, 237, 0.06)",
                    border: "1px solid rgba(245, 242, 237, 0.08)",
                    color: "rgba(245, 242, 237, 0.5)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(245, 242, 237, 0.1)";
                    e.currentTarget.style.color = "#F5F2ED";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(245, 242, 237, 0.06)";
                    e.currentTarget.style.color = "rgba(245, 242, 237, 0.5)";
                  }}
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Modal body */}
            <div
              style={{
                flex: 1,
                overflow: "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
              }}
            >
              {selectedCreative === 1 ? (
                <Creative1Full soundOn={soundOn} />
              ) : (
                <Creative2Full soundOn={soundOn} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Creative1Full({ soundOn }: { soundOn: boolean }) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowDetails(true), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="sw-creative1-modal"
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: "#000",
      }}
    >
      <style>{`
        @keyframes sv-full-chaos {
          0%, 100% { transform: translateX(0) scaleY(1); }
          25% { transform: translateX(-10px) scaleY(1.35); }
          50% { transform: translateX(8px) scaleY(0.7); }
          75% { transform: translateX(-6px) scaleY(1.2); }
        }
        @keyframes sv-full-calm {
          0%, 100% { transform: translateX(0) scaleY(1); }
          50% { transform: translateX(-6px) scaleY(1.06); }
        }
        @keyframes sv-full-fade-in {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes sv-full-glide {
          0% { transform: translateX(-8px); }
          50% { transform: translateX(8px); }
          100% { transform: translateX(-8px); }
        }
        @keyframes sv-full-eq {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1); }
        }
        .sv-full-detail {
          animation: sv-full-fade-in 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
      `}</style>

      {/* Left panel - Noise */}
      <div
        style={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000",
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
            filter: "grayscale(40%) brightness(0.65) contrast(1.1)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 16,
            left: 20,
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            color: "#FF4444",
            fontWeight: 500,
            zIndex: 2,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#FF4444",
              boxShadow: "0 0 8px #FF4444",
            }}
          />
          Noise
        </div>
        <div style={{ opacity: 0.55, maxWidth: "90%", zIndex: 1 }}>
          <SoundWaveFull chaotic color="#FF4444" />
        </div>
        {soundOn && (
          <div
            style={{
              position: "absolute",
              bottom: 20,
              left: 20,
              display: "flex",
              alignItems: "center",
              gap: 3,
              height: 20,
              zIndex: 2,
            }}
          >
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                style={{
                  width: 3,
                  height: "100%",
                  background: "#FF4444",
                  borderRadius: 2,
                  transformOrigin: "bottom",
                  animation: `sv-full-eq ${0.5 + i * 0.12}s ease-in-out ${i * 0.08}s infinite`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div
        style={{
          width: 1,
          background: "rgba(255,255,255,0.1)",
          flexShrink: 0,
          zIndex: 2,
        }}
      />

      {/* Right panel - Syros EV */}
      <div
        style={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000",
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
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.15)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 16,
            left: 20,
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            color: "#00D4AA",
            fontWeight: 500,
            zIndex: 2,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#00D4AA",
              boxShadow: "0 0 8px #00D4AA",
            }}
          />
          Syros EV
        </div>
        <div style={{ opacity: 0.35, maxWidth: "90%", zIndex: 1 }}>
          <SoundWaveFull color="#00D4AA" />
        </div>

        {/* Kia Syros car image */}
        <div
          className="sw-creative2-modal-car"
          style={{
            position: "absolute",
            right: "5%",
            bottom: "8%",
            width: "35%",
            maxWidth: 240,
            zIndex: 2,
            animation: "sv-full-glide 5s ease-in-out infinite",
          }}
        >
          <img
            src={KIA_SYROS_IMG}
            alt="Kia Syros EV"
            style={{
              width: "100%",
              height: "auto",
              filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.6))",
            }}
          />
        </div>
      </div>

      {/* Floating details */}
      {showDetails && (
        <div
          className="sv-full-detail sw-creative1-details"
          style={{
            position: "absolute",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "10px 20px",
            borderRadius: 12,
            background: "rgba(14, 14, 16, 0.85)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(245, 242, 237, 0.08)",
            zIndex: 5,
          }}
        >
          <div
            style={{
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "rgba(245, 242, 237, 0.5)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Monitor size={12} />
            Full Screen
          </div>
          <div style={{ width: 1, height: 16, background: "rgba(245, 242, 237, 0.1)" }} />
          <span
            style={{
              fontSize: 11,
              color: "rgba(245, 242, 237, 0.7)",
              fontWeight: 500,
            }}
          >
            Less Noise. More Journey.
          </span>
          <div style={{ width: 1, height: 16, background: "rgba(245, 242, 237, 0.1)" }} />
          <a
            href="/experience-creative1"
            style={{
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "#00D4AA",
              textDecoration: "none",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            View Full Experience <ArrowUpRight size={11} />
          </a>
        </div>
      )}
    </div>
  );
}

function SoundWaveFull({ chaotic = false, color }: { chaotic?: boolean; color: string }) {
  const width = 500;
  const height = 120;
  const count = chaotic ? 6 : 4;
  const lines = Array.from({ length: count }, (_, i) => {
    const freq = chaotic ? 3 + i * 0.6 : 1.5 + i * 0.3;
    const amp = 28 * (1 - i / (count * 1.8));
    const phase = i * 0.8;
    return { freq, amp, phase, idx: i };
  });
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ opacity: 0.7, display: "block" }}
      preserveAspectRatio="none"
    >
      {lines.map((l) => {
        const pts: string[] = [];
        const steps = 60;
        for (let i = 0; i <= steps; i++) {
          const x = (i / steps) * width;
          const y =
            height / 2 +
            Math.sin((i / steps) * Math.PI * 2 * l.freq + l.phase) * l.amp +
            (chaotic
              ? Math.sin((i / steps) * Math.PI * 2 * l.freq * 2.5 + l.phase) * l.amp * 0.35
              : 0);
          pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
        }
        return (
          <polyline
            key={l.idx}
            fill="none"
            stroke={color}
            strokeWidth={chaotic ? 1.8 : 1.4}
            strokeLinecap="round"
            points={pts.join(" ")}
            style={{
              transformOrigin: "center",
              animation: chaotic
                ? `sv-full-chaos ${0.8 + l.idx * 0.12}s ease-in-out infinite`
                : `sv-full-calm ${3.5 + l.idx * 0.4}s ease-in-out infinite`,
              animationDelay: `${l.idx * 0.1}s`,
            }}
          />
        );
      })}
    </svg>
  );
}

type Scene = "chaos" | "pause" | "reveal";

function Creative2Full({ soundOn }: { soundOn: boolean }) {
  const [scene, setScene] = useState<Scene>("chaos");
  const [started, setStarted] = useState(false);
  const [runKey, setRunKey] = useState(0);
  const [showReplay, setShowReplay] = useState(false);
  const [showDetails] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!started) {
      const t = setTimeout(start, 5000);
      return () => clearTimeout(t);
    }
  }, [started]);

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

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = soundOn ? 0.9 : 0;
    }
    if (peaceAudioRef.current) {
      peaceAudioRef.current.gain.gain.value = soundOn ? 0.3 : 0;
    }
  }, [soundOn]);

  const replay = () => {
    clearTimers();
    setRunKey((k) => k + 1);
    setTimeout(start, 50);
  };

  useEffect(
    () => () => {
      clearTimers();
      stopPeaceAudio();
    },
    [],
  );

  return (
    <div
      className="ad-stage relative w-full h-full overflow-hidden"
      style={{
        background: "#000",
        fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
      }}
      key={runKey}
    >
      <style>{`
        @keyframes sc-shakeX { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-3px)} 75%{transform:translateX(3px)} }
        @keyframes sc-hornPulse { 0%,100%{opacity:0} 50%{opacity:1} }
        @keyframes sc-fadeUp { from{opacity:0; transform:translateY(16px)} to{opacity:1; transform:translateY(0)} }
        @keyframes sc-fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes sc-waveBeat { 0%,100%{transform:scaleY(.3)} 50%{transform:scaleY(1)} }
        @keyframes sc-kenBurns { from{transform:scale(1) translateY(0)} to{transform:scale(1.12) translateY(-3%)} }
        @keyframes sc-shootingStar { 0%{transform:translateX(0) translateY(0); opacity:1} 100%{transform:translateX(-80px) translateY(40px); opacity:0} }
        @keyframes sc-pulseDot { 0%,100%{opacity:.3; transform:scale(1)} 50%{opacity:1; transform:scale(1.6)} }
        @keyframes sc-progressFill { 0%{width:0%} 100%{width:100%} }
        @keyframes sc-carDrift { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        @media (max-width: 640px) {
          .sc2-reveal-text { max-width: 85% !important; left: 50% !important; transform: translate(-50%, -50%) !important; text-align: center !important; }
          .sc2-reveal-text h2 { font-size: 18px !important; }
          .sc2-reveal-car { width: 100% !important; height: 45% !important; top: auto !important; bottom: 0 !important; clip-path: none !important; }
          .sc2-chaos-title { font-size: 17px !important; }
        }
      `}</style>

      <audio ref={audioRef} src={TRAFFIC_AUDIO} loop preload="auto" />

      {!started && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10 overflow-hidden">
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
              background: "radial-gradient(rgba(0,0,0,.2) 0%, rgba(0,0,0,.85) 100%)",
            }}
          />
          <div className="relative z-10 flex flex-col items-center">
            <img
              src={CAR_IMG}
              alt="Kia Syros"
              className="w-[90%] drop-shadow-2xl"
              style={{ maxWidth: 420 }}
            />
            <div className="text-[9px] tracking-[.35em] text-white/60 mb-1">
              KIA SYROS EV · INTERACTIVE
            </div>
            <h2 className="text-white text-2xl font-extrabold mb-2">The Silent Pause</h2>
            <p className="text-white/70 text-xs mb-4 max-w-xs">A 15-second immersive experience.</p>
            <button
              onClick={start}
              className="inline-flex items-center gap-2 bg-[#5AE0A0] text-black font-semibold px-5 py-2.5 rounded-full hover:bg-white transition-colors text-sm"
            >
              ▶ Play with sound
            </button>
            <div className="text-white/40 text-[9px] mt-3">🔊 Audio required</div>
          </div>
        </div>
      )}

      {started && (
        <>
          {/* SCENE 1 — CHAOS */}
          <div
            className="absolute inset-0"
            style={{
              opacity: scene === "chaos" ? 1 : 0,
              transition: "opacity 0.3s",
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
                background: "linear-gradient(0deg, rgba(255,140,0,.06) 0%, rgba(255,140,0,0) 50%)",
                animation: scene === "chaos" ? "sc-hornPulse 2s ease-in-out infinite" : "none",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FFB400"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  filter: "drop-shadow(0 0 14px rgba(255,180,0,.6))",
                  animation: scene === "chaos" ? "sc-shakeX .15s infinite" : "none",
                }}
              >
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            </div>
            {[
              { l: "10%", t: "28%", d: "0s" },
              { l: "75%", t: "22%", d: ".4s" },
              { l: "68%", t: "68%", d: ".8s" },
            ].map((p, i) => (
              <div
                key={i}
                className="absolute text-[#FFB400] font-black tracking-wider select-none"
                style={{
                  left: p.l,
                  top: p.t,
                  fontSize: 22,
                  textShadow: "0 0 14px rgba(255,180,0,.7)",
                  animation: `sc-hornPulse 1.4s ${p.d} infinite`,
                }}
              >
                HONK!
              </div>
            ))}
            <div className="absolute left-0 right-0 top-4 px-6 text-center">
              <div className="text-[9px] tracking-[.25em] text-white/70 mb-1">KIA SYROS EV</div>
              <h1
                className="text-white font-extrabold text-xl leading-tight sc2-chaos-title"
                style={{ textShadow: "0 2px 14px rgba(0,0,0,.8)" }}
              >
                Ready for a different kind of drive?
              </h1>
            </div>
            <div className="absolute bottom-3 left-4 flex items-end gap-[2px] h-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[2px] bg-[#FFB400] rounded-sm"
                  style={{
                    height: 20,
                    transformOrigin: "bottom",
                    animation: `sc-waveBeat ${0.4 + (i % 4) * 0.12}s ${i * 0.05}s infinite`,
                  }}
                />
              ))}
              <span className="text-white/70 text-[9px] ml-2">🔊 SOUND ON</span>
            </div>
          </div>

          {/* SCENE 2 — PAUSE */}
          <div
            className="absolute inset-0"
            style={{
              opacity: scene === "pause" ? 1 : 0,
              transition: "opacity 0.2s",
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
              className="absolute w-[2px] h-[2px] bg-white rounded-full"
              style={{
                top: "12%",
                left: "70%",
                boxShadow: "0 0 5px #fff",
                animation: "sc-shootingStar 2s ease-out 0.5s infinite",
              }}
            />
            <div
              className="absolute w-[2px] h-[2px] bg-white rounded-full"
              style={{
                top: "18%",
                left: "82%",
                boxShadow: "0 0 4px #fff",
                animation: "sc-shootingStar 2.8s ease-out 1.2s infinite",
              }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center pb-10">
              <div
                className="text-2xl tracking-[.2em] text-[#00E5A0] font-black"
                style={{
                  textShadow: "0 0 20px rgba(0,229,160,.5)",
                  animation: "sc-fadeUp .5s .2s both",
                }}
              >
                — SILENT MODE —
              </div>
              <div
                className="text-white text-base tracking-[.12em] font-semibold mt-1"
                style={{
                  textShadow: "0 0 14px rgba(0,229,160,.35)",
                  animation: "sc-fadeUp .5s .3s both",
                }}
              >
                KIA Syros EV — EV for Everyone
              </div>
              <div
                className="flex items-center gap-2 mt-3"
                style={{ animation: "sc-fadeIn .6s .6s both" }}
              >
                {[0, 0.15, 0.3].map((d, i) => (
                  <div
                    key={i}
                    className="w-[6px] h-[6px] rounded-full bg-[#00E5A0]"
                    style={{ animation: `sc-pulseDot 2s ease-in-out ${d}s infinite` }}
                  />
                ))}
              </div>
              <div
                className="text-white/70 text-sm italic font-light mt-3"
                style={{
                  textShadow: "0 0 10px rgba(0,229,160,.3)",
                  animation: "sc-fadeUp .6s .8s both",
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
            className="absolute inset-0"
            style={{
              opacity: scene === "reveal" ? 1 : 0,
              transition: "opacity 0.5s",
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
              className="absolute right-0 top-0 bottom-0 w-[55%] overflow-hidden sc2-reveal-car"
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
              className="absolute left-5 top-1/2 -translate-y-1/2 max-w-[42%] z-10 sc2-reveal-text"
              style={{ animation: scene === "reveal" ? "sc-fadeUp .8s .2s both" : "none" }}
            >
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/15 backdrop-blur text-white text-[8px] tracking-[.25em] mb-3 border border-white/20">
                <span className="w-[5px] h-[5px] rounded-full bg-[#5AE0A0]" /> 100% ELECTRIC
              </div>
              <h2
                className="text-white font-extrabold leading-[1.05] text-xl md:text-2xl"
                style={{ textShadow: "0 4px 20px rgba(0,0,0,.6)" }}
              >
                Not a glitch.
                <br />
                <span className="text-[#5AE0A0]">Just the sound of silence.</span>
              </h2>
              <p className="text-white/85 mt-1 text-xs">Syros EV. EV for Everyone.</p>
              <div className="mt-3 flex gap-1">
                {[
                  { src: THUMB1, label: "RED" },
                  { src: THUMB2, label: "BLUE" },
                  { src: THUMB3, label: "WHITE" },
                  { src: THUMB4, label: "BLUE" },
                ].map((t, i) => (
                  <div
                    key={t.label}
                    className="relative w-[52px] h-[34px] rounded overflow-hidden border border-white/25 shadow-lg"
                    style={{ animation: `sc-fadeUp .6s ${0.5 + i * 0.1}s both` }}
                  >
                    <img src={t.src} alt={t.label} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="absolute bottom-px left-1 text-[6px] tracking-[.12em] text-white font-bold">
                      {t.label}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <a
                  href="https://www.kia.com/in/our-vehicles/syros/showroom.html"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 bg-white text-black font-semibold px-4 py-2 rounded-full hover:bg-[#5AE0A0] hover:text-black transition-colors text-xs"
                >
                  Book a Test Drive <span>→</span>
                </a>
                <a
                  href="https://www.kia.com/in/our-vehicles/syros/showroom.html"
                  target="_blank"
                  rel="noreferrer"
                  className="text-white/90 text-xs underline-offset-4 hover:underline"
                >
                  Explore Syros
                </a>
              </div>
            </div>
            <div className="absolute top-3 right-4 flex items-center gap-1.5 text-white z-10">
              <span className="font-black tracking-widest text-sm">KIA</span>
              <span className="w-px h-3 bg-white/40" />
              <span className="text-[9px] tracking-[.2em]">SYROS EV</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="absolute left-0 right-0 bottom-0 h-[3px] bg-white/10">
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
              className="absolute top-3 left-3 bg-black/60 backdrop-blur text-white text-[10px] px-2.5 py-1 rounded-full border border-white/20 hover:bg-black/80 z-20"
            >
              ↻ Replay
            </button>
          )}
        </>
      )}

      {/* Floating details bar — visible on intro screen and during experience */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "8px 16px",
          borderRadius: 12,
          background: "rgba(14, 14, 16, 0.85)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(245, 242, 237, 0.08)",
          zIndex: 15,
          animation: "sc-fadeUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) both",
        }}
      >
        <div
          style={{
            fontSize: 9,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "rgba(245, 242, 237, 0.5)",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Monitor size={11} />
          Full Screen
        </div>
        <div style={{ width: 1, height: 14, background: "rgba(245, 242, 237, 0.1)" }} />
        <span
          style={{
            fontSize: 10,
            color: "rgba(245, 242, 237, 0.7)",
            fontWeight: 500,
          }}
        >
          The Silent Pause
        </span>
        <div style={{ width: 1, height: 14, background: "rgba(245, 242, 237, 0.1)" }} />
        <a
          href="/experience-creative2"
          style={{
            fontSize: 9,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "#5AE0A0",
            textDecoration: "none",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          View Full Experience <ArrowUpRight size={10} />
        </a>
      </div>
    </div>
  );
}
