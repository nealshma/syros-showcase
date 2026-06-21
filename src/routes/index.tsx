import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  X,
  Eye,
  Monitor,
  Smartphone,
  Zap,
  Volume2,
  VolumeX,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import kiaSyrosImgUrl from "../assets/kia-syros.png";
import roadImgAsset from "../assets/road.jpg.asset.json";
import trafficImgAsset from "../assets/traffic.jpg.asset.json";
import trafficVideoUrl from "../assets/traffic.mp4";
import kiaSyrosDriveUrl from "../assets/kia-syros-drive.mp4";
import trafficAudioUrl from "../assets/traffic.mp3";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NOISE VS SILENCE — Creative Showcase" },
      {
        name: "description",
        content: "NOISE VS SILENCE — A Kia Syros EV immersive brand experience.",
      },
      { property: "og:title", content: "NOISE VS SILENCE — Creative Showcase" },
      { property: "og:description", content: "Explore our creative projects." },
    ],
  }),
  component: Showcase,
});

const KIA_SYROS_IMG = kiaSyrosImgUrl;
const ROAD_IMG = roadImgAsset.url;
const TRAFFIC_IMG = trafficImgAsset.url;
const TRAFFIC_VIDEO = trafficVideoUrl;
const ROAD_VIDEO = kiaSyrosDriveUrl;
const TRAFFIC_AUDIO = trafficAudioUrl;

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

function Showcase() {
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
        @keyframes sw-coming-soon-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        .sw-creative-card {
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .sw-creative-card:hover {
          transform: translateY(-4px);
        }
        .sw-creative-card:active {
          transform: translateY(-1px) scale(0.99);
        }
      `}</style>

      {/* === HEADER === */}
      <header
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
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "14px 32px",
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
              gap: 10,
              textDecoration: "none",
              color: "#F5F2ED",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #00D4AA, #006B5E)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Zap size={14} style={{ fill: "#0E0E10", color: "#0E0E10" }} />
            </div>
            <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: "-0.3px" }}>
              Soundscape
            </span>
            <span
              style={{
                fontWeight: 300,
                fontSize: 13,
                color: "rgba(245, 242, 237, 0.5)",
                marginLeft: 4,
              }}
            >
              Showcase
            </span>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <a
              href="/experience"
              style={{
                fontSize: 12,
                color: "rgba(245, 242, 237, 0.6)",
                textDecoration: "none",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#F5F2ED")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(245, 242, 237, 0.6)")}
            >
              Full Experience
            </a>
          </div>
        </div>
      </header>

      <main style={{ paddingTop: 80 }}>
        {/* === HERO === */}
        <section
          style={{
            borderBottom: "1px solid rgba(245, 242, 237, 0.06)",
            background: "linear-gradient(180deg, rgba(0, 212, 170, 0.04) 0%, transparent 100%)",
          }}
        >
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "60px 32px 48px" }}>
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
              style={{
                fontSize: 40,
                fontWeight: 700,
                letterSpacing: "-1px",
                lineHeight: 1.1,
                margin: 0,
                maxWidth: 600,
              }}
            >
              Explore our <span style={{ color: "#00D4AA" }}>creative work</span>
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
        <section style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 32px 80px" }}>
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
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 2,
              border: "1px solid rgba(245, 242, 237, 0.08)",
              background: "rgba(245, 242, 237, 0.04)",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            {/* === CREATIVE 1: NOISE VS SILENCE === */}
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
                    >
                    </span>
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
                      }}
                    >
                      {typeof window !== "undefined" && window.innerWidth < 768 ? (
                        <Smartphone size={10} />
                      ) : (
                        <Monitor size={10} />
                      )}{" "}
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
                    NOISE VS SILENCE
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

            {/* === CREATIVE 2: Coming Soon === */}
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
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "linear-gradient(135deg, #1A1A1E 0%, #141416 100%)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Decorative circles */}
                <div
                  style={{
                    position: "absolute",
                    width: 200,
                    height: 200,
                    borderRadius: "50%",
                    border: "1px solid rgba(245, 242, 237, 0.04)",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    width: 140,
                    height: 140,
                    borderRadius: "50%",
                    border: "1px solid rgba(245, 242, 237, 0.03)",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    border: "1px solid rgba(245, 242, 237, 0.02)",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                />
                {/* Animated dot */}
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: "#00D4AA",
                    boxShadow: "0 0 20px rgba(0, 212, 170, 0.3)",
                    animation: "sw-pulse-ring 2s ease-in-out infinite",
                    marginBottom: 16,
                  }}
                />
                <Sparkles
                  size={24}
                  style={{
                    color: "rgba(245, 242, 237, 0.15)",
                    marginBottom: 10,
                  }}
                />
                <h3
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    margin: 0,
                    letterSpacing: "-0.3px",
                    color: "rgba(245, 242, 237, 0.6)",
                    animation: "sw-coming-soon-pulse 3s ease-in-out infinite",
                  }}
                >
                  Coming Soon
                </h3>
                <p
                  style={{
                    fontSize: 11,
                    color: "rgba(245, 242, 237, 0.3)",
                    margin: "8px 0 0",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  Next creative in progress
                </p>
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
                        background: "rgba(245, 242, 237, 0.08)",
                        color: "rgba(245, 242, 237, 0.4)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        fontWeight: 500,
                      }}
                    >
                      Upcoming
                    </span>
                  </div>
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      margin: 0,
                      letterSpacing: "-0.3px",
                      color: "rgba(245, 242, 237, 0.5)",
                    }}
                  >
                    Untitled Creative
                  </h3>
                  <p
                    style={{
                      fontSize: 12,
                      color: "rgba(245, 242, 237, 0.35)",
                      margin: "4px 0 0",
                    }}
                  >
                    A new immersive experience is being crafted
                  </p>
                </div>
                <ArrowUpRight
                  size={16}
                  style={{
                    color: "rgba(245, 242, 237, 0.2)",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* === FOOTER === */}
        <footer
          style={{
            borderTop: "1px solid rgba(245, 242, 237, 0.06)",
            padding: "20px 32px",
            background: "#0E0E10",
          }}
        >
          <div
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
            <span>NOISE VS SILENCE · Creative Showcase · {new Date().getFullYear()}</span>
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
                  {selectedCreative === 1 ? "NOISE VS SILENCE — Kia Syros EV" : "Coming Soon"}
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
                <Creative2ComingSoon />
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
          className="sv-full-detail"
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
            href="/experience"
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

function Creative2ComingSoon() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        padding: 40,
        textAlign: "center",
        width: "100%",
        height: "100%",
        background: "linear-gradient(135deg, #1A1A1E 0%, #141416 100%)",
      }}
    >
      <div
        style={{
          position: "relative",
          width: 80,
          height: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "2px solid rgba(0, 212, 170, 0.15)",
            animation: "sw-pulse-ring 2.5s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 10,
            borderRadius: "50%",
            border: "1px solid rgba(0, 212, 170, 0.1)",
            animation: "sw-pulse-ring 2.5s ease-in-out infinite 0.3s",
          }}
        />
        <Sparkles size={36} style={{ color: "rgba(0, 212, 170, 0.4)" }} />
      </div>

      <div>
        <h2
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#F5F2ED",
            margin: 0,
            letterSpacing: "-0.5px",
          }}
        >
          Coming Soon
        </h2>
        <p
          style={{
            fontSize: 14,
            color: "rgba(245, 242, 237, 0.5)",
            marginTop: 10,
            maxWidth: 400,
            lineHeight: 1.6,
          }}
        >
          A new creative project is being crafted with care. We're exploring fresh ideas and
          immersive experiences. Stay tuned for something exciting.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 8,
        }}
      >
        {["Immersive", "Interactive", "Innovative"].map((word) => (
          <span
            key={word}
            style={{
              fontSize: 9,
              padding: "4px 12px",
              borderRadius: 6,
              background: "rgba(245, 242, 237, 0.06)",
              color: "rgba(245, 242, 237, 0.3)",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
            }}
          >
            {word}
          </span>
        ))}
      </div>

      <div
        style={{
          marginTop: 8,
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontSize: 11,
          color: "rgba(245, 242, 237, 0.2)",
          textTransform: "uppercase",
          letterSpacing: "0.15em",
        }}
      >
        <div
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "#00D4AA",
            animation: "sw-pulse-ring 2s ease-in-out infinite",
          }}
        />
        In development
      </div>
    </div>
  );
}
